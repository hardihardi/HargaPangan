"use client";

import { FormEvent, useState } from "react";
import { useAuth } from "../providers/auth-provider";

export function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState("admin@pangan.local");
  const [password, setPassword] = useState("Pangan123!");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (evt: FormEvent) => {
    evt.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Gagal login, periksa kredensial.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-3rem)] items-center justify-center bg-slate-950">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-2xl bg-slate-900/90 p-6 shadow-soft ring-1 ring-slate-800"
      >
        <h1 className="text-sm font-semibold text-slate-50">
          Masuk ke Pangan Insight
        </h1>
        <p className="mt-1 text-xs text-slate-400">
          Gunakan akun yang sudah didaftarkan. Untuk demo lokal, kredensial
          bawaan adalah <code>admin@pangan.local</code> /{" "}
          <code>Pangan123!</code>.
        </p>

        <div className="mt-4 space-y-3 text-xs">
          <div className="flex flex-col gap-1">
            <label className="text-slate-300">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-slate-300">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs"
            />
          </div>
        </div>

        {error && (
          <p className="mt-3 text-xs text-red-400">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="mt-4 w-full rounded-lg bg-emerald-500 px-3 py-2 text-xs font-semibold text-slate-950 hover:bg-emerald-400 disabled:opacity-60"
        >
          {loading ? "Memproses..." : "Masuk"}
        </button>
      </form>
    </div>
  );
}