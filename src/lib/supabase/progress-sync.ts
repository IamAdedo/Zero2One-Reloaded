import type { SupabaseClient } from "@supabase/supabase-js";
import type { Drill } from "@/lib/domain/types";

export interface ProgressUpsert {
  user_id: string;
  module_id: string;
  is_completed: boolean;
  completed_at: string;
}

export type SyncResult =
  | { synced: true }
  | { synced: false; reason: string };

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isUuid(value: string): boolean {
  return UUID_RE.test(value);
}

export function buildProgressUpsert(
  userId: string,
  moduleId: string,
  now: Date = new Date(),
): ProgressUpsert {
  return {
    user_id: userId,
    module_id: moduleId,
    is_completed: true,
    completed_at: now.toISOString(),
  };
}

/**
 * Best-effort remote completion record. Skips (with an explicit reason)
 * when there is no signed-in user, no client, or the module id is a local
 * seed slug rather than a Supabase UUID — never writes garbage rows.
 */
export async function syncPassToRemote(
  supabase: SupabaseClient | null,
  userId: string | null,
  drill: Drill,
): Promise<SyncResult> {
  if (!supabase) return { synced: false, reason: "supabase-unconfigured" };
  if (!userId) return { synced: false, reason: "anonymous" };
  if (!isUuid(drill.moduleId)) {
    return { synced: false, reason: "seed-module-id" };
  }
  const { error } = await supabase.from("user_progress").upsert(
    buildProgressUpsert(userId, drill.moduleId),
    { onConflict: "user_id,module_id" },
  );
  if (error) return { synced: false, reason: error.message };
  return { synced: true };
}
