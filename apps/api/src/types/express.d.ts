import type { Role } from "../types/role";

declare global {
  namespace Express {
    interface AuthUser {
      id: number;
      email: string;
      role: Role;
    }

    interface Request {
      user?: AuthUser;
    }
  }
}

export {};