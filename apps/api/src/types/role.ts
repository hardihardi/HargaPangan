export const RoleValues = {
  ADMIN: "ADMIN",
  ANALYST: "ANALYST",
  VIEWER: "VIEWER",
} as const;

export type Role = (typeof RoleValues)[keyof typeof RoleValues];