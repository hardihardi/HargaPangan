"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../services/apiClient";

interface UserRow {
  id: number;
  name: string;
  email: string;
  role: "ADMIN" | "ANALYST" | "VIEWER";
  isActive: boolean;
  createdAt: string;
}

export function UsersPage() {
  const usersQuery = useQuery<UserRow[]>({
    queryKey: ["users"],
    queryFn: async () => {
      const res = await apiClient.get("/auth/users");
      return res.data;
    },
  });

  return (
    <div className="space-y-4 p-4 lg:p-6">
      <div className="rounded-xl bg-slate-900/80 p-4 ring-1 ring-slate-800">
        <h2 className="text-sm font-semibold text-slate-50">
          Manajemen Pengguna
        </h2>
        <p className="text-xs text-slate-400">
          Role utama: Admin, Analis, dan Viewer. Penambahan dan pengaturan user
          dilakukan melalui endpoint backend.
        </p>

        <div className="mt-3 max-h-80 overflow-y-auto text-xs scrollbar-thin">
          <table className="min-w-full border-collapse">
            <thead className="sticky top-0 bg-slate-900">
              <tr className="text-left text-[11px] uppercase text-slate-400">
                <th className="px-2 py-1">Nama</th>
                <th className="px-2 py-1">Email</th>
                <th className="px-2 py-1">Role</th>
                <th className="px-2 py-1">Status</th>
                <th className="px-2 py-1">Dibuat</th>
              </tr>
            </thead>
            <tbody>
              {usersQuery.data?.map((u) => (
                <tr key={u.id} className="border-t border-slate-800">
                  <td className="px-2 py-1">{u.name}</td>
                  <td className="px-2 py-1">{u.email}</td>
                  <td className="px-2 py-1">{u.role}</td>
                  <td className="px-2 py-1">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-[11px] ${
                        u.isActive
                          ? "bg-emerald-500/10 text-emerald-300"
                          : "bg-slate-700/60 text-slate-300"
                      }`}
                    >
                      {u.isActive ? "Aktif" : "Nonaktif"}
                    </span>
                  </td>
                  <td className="px-2 py-1">
                    {new Date(u.createdAt).toLocaleDateString("id-ID")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!usersQuery.data?.length && (
            <p className="mt-2 text-slate-400">
              Belum ada pengguna. Gunakan endpoint admin untuk menambahkan user.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}