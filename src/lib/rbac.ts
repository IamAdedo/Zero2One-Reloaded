import { useState } from "react";
import type { UserRole } from "@/lib/domain/types";
import { hasPermission, type Permission } from "@/lib/domain/types";

const ROLE_RANK: Record<UserRole, number> = {
  learner: 0,
  teacher: 1,
  admin: 2,
  super_admin: 3,
};

export function useEffectiveRole(roles: UserRole[]): UserRole {
  const [fallback] = useState<UserRole>("learner");
  if (roles.length === 0) return fallback;
  return roles.reduce((a, b) => (ROLE_RANK[a] >= ROLE_RANK[b] ? a : b));
}

export function useCan(roles: UserRole[], permission: Permission): boolean {
  return roles.some((r) => hasPermission(r, permission));
}
