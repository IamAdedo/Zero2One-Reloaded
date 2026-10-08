import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export type { SupabaseClient };

export interface SupabaseConfig {
  url: string;
  key: string;
}

/**
 * Browser config reads `VITE_`-prefixed vars (the only ones Vite exposes to
 * client bundles). Returns null when unconfigured — callers must handle the
 * offline/seed-data path explicitly instead of receiving a mock that lies.
 */
export function browserSupabaseConfig(): SupabaseConfig | null {
  // Static property access only — Vite's SSR module runner rejects dynamic
  // `import.meta.env` reads. Optional chaining keeps node/test runtimes safe.
  const url = import.meta.env?.VITE_SUPABASE_URL?.trim();
  const key = import.meta.env?.VITE_SUPABASE_ANON_KEY?.trim();
  if (!url || !key) return null;
  return { url, key };
}

/** Server config reads non-prefixed vars (server functions / SSR only). */
export function serverSupabaseConfig(env: {
  SUPABASE_URL?: string;
  SUPABASE_ANON_KEY?: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
}): SupabaseConfig | null {
  const url = env.SUPABASE_URL?.trim();
  const key =
    env.SUPABASE_SERVICE_ROLE_KEY?.trim() ?? env.SUPABASE_ANON_KEY?.trim();
  if (!url || !key) return null;
  return { url, key };
}

let browserClient: SupabaseClient | null = null;
let browserClientFor: string | null = null;

export function getSupabaseBrowserClient(
  config: SupabaseConfig | null,
): SupabaseClient | null {
  if (!config) return null;
  if (!browserClient || browserClientFor !== config.url) {
    browserClient = createClient(config.url, config.key);
    browserClientFor = config.url;
  }
  return browserClient;
}

export function resetSupabaseBrowserClient(): void {
  browserClient = null;
  browserClientFor = null;
}
