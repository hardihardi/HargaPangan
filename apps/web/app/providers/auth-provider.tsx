"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { apiClient } from "../services/apiClient";

type Role = "ADMIN" | "ANALYST" | "VIEWER";

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: Role;
}

interface AuthContextValue {
  user: AuthUser | null;
  accessToken: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const ACCESS_TOKEN_KEY = "pangan-access-token";
const USER_KEY = "pangan-user";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const storedToken = window.localStorage.getItem(ACCESS_TOKEN_KEY);
    const storedUser = window.localStorage.getItem(USER_KEY);

    if (storedToken && storedUser) {
      setAccessToken(storedToken);
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        setUser(null);
      }
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await apiClient.post<{
      user: AuthUser;
      accessToken: string;
      refreshToken: string;
    }>("/auth/login", {
      email,
      password,
    });

    setUser(res.data.user);
    setAccessToken(res.data.accessToken);

    if (typeof window !== "undefined") {
      window.localStorage.setItem(ACCESS_TOKEN_KEY, res.data.accessToken);
      window.localStorage.setItem(USER_KEY, JSON.stringify(res.data.user));
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setAccessToken(null);
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(ACCESS_TOKEN_KEY);
      window.localStorage.removeItem(USER_KEY);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, accessToken, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth harus dipanggil di dalam AuthProvider");
  }
  return ctx;
}