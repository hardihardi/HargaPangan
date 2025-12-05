import jwt from "jsonwebtoken";
import type { Role } from "../types/role";
import { env } from "../config/env";

export interface JwtPayload {
  sub: number;
  email: string;
  role: Role;
  type: "access" | "refresh";
}

const ACCESS_TOKEN_TTL = "15m";
const REFRESH_TOKEN_TTL = "30d";

export function signAccessToken(user: {
  id: number;
  email: string;
  role: Role;
}): string {
  const payload: JwtPayload = {
    sub: user.id,
    email: user.email,
    role: user.role,
    type: "access",
  };

  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: ACCESS_TOKEN_TTL,
  });
}

export function signRefreshToken(user: {
  id: number;
  email: string;
  role: Role;
}): string {
  const payload: JwtPayload = {
    sub: user.id,
    email: user.email,
    role: user.role,
    type: "refresh",
  };

  return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: REFRESH_TOKEN_TTL,
  });
}

export function verifyAccessToken(token: string): JwtPayload {
  const decoded = jwt.verify(token, env.JWT_SECRET);
  if (typeof decoded === "string") {
    throw new Error("Invalid token payload");
  }
  const payload = decoded as unknown as JwtPayload;
  if (payload.type !== "access") {
    throw new Error("Invalid token type");
  }
  return payload;
}

export function verifyRefreshToken(token: string): JwtPayload {
  const decoded = jwt.verify(token, env.JWT_REFRESH_SECRET);
  if (typeof decoded === "string") {
    throw new Error("Invalid token payload");
  }
  const payload = decoded as unknown as JwtPayload;
  if (payload.type !== "refresh") {
    throw new Error("Invalid token type");
  }
  return payload;
}