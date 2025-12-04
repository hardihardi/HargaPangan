import { Role } from "@prisma/client";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "../config/prisma";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "../utils/jwt";

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const createUserSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.nativeEnum(Role),
});

export const updateUserSchema = z.object({
  name: z.string().min(1).optional(),
  role: z.nativeEnum(Role).optional(),
  isActive: z.boolean().optional(),
});

export async function login(input: z.infer<typeof loginSchema>) {
  const user = await prisma.user.findUnique({
    where: { email: input.email },
  });

  if (!user || !user.isActive) {
    throw new Error("Email atau password salah");
  }

  const valid = await bcrypt.compare(input.password, user.passwordHash);
  if (!valid) {
    throw new Error("Email atau password salah");
  }

  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);

  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      token: refreshToken,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    accessToken,
    refreshToken,
  };
}

export async function refreshSession(refreshToken: string) {
  const decoded = verifyRefreshToken(refreshToken);

  const tokenRow = await prisma.refreshToken.findUnique({
    where: { token: refreshToken },
    include: { user: true },
  });

  if (!tokenRow || tokenRow.revokedAt || tokenRow.expiresAt < new Date()) {
    throw new Error("Refresh token tidak valid");
  }

  const user = tokenRow.user;
  if (!user.isActive) {
    throw new Error("Akun dinonaktifkan");
  }

  const accessToken = signAccessToken(user);

  return {
    accessToken,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  };
}

export async function listUsers() {
  return prisma.user.findMany({
    orderBy: { createdAt: "desc" },
  });
}

export async function createUser(input: z.infer<typeof createUserSchema>) {
  const passwordHash = await bcrypt.hash(input.password, 10);

  const user = await prisma.user.create({
    data: {
      name: input.name,
      email: input.email,
      passwordHash,
      role: input.role,
      isActive: true,
    },
  });

  return user;
}

export async function updateUser(
  id: number,
  input: z.infer<typeof updateUserSchema>,
) {
  return prisma.user.update({
    where: { id },
    data: input,
  });
}

export async function resetPassword(id: number, newPassword: string) {
  const passwordHash = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({
    where: { id },
    data: { passwordHash },
  });
}

export async function deactivateUser(id: number, isActive: boolean) {
  await prisma.user.update({
    where: { id },
    data: { isActive },
  });
}