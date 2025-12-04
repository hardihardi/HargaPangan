"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { apiClient } from "../services/apiClient";

interface Province {
  id: number;
  name: string;
  code: string;
}

interface Regency {
  id: number;
  name: string;
  code: string;
  province: Province;
}

export function DataWilayahPage() {
  const queryClient = useQueryClient();
  const [provinceForm, setProvinceForm] = useState({ name: "", code: "" });
  const [selectedProvinceId, setSelectedProvinceId] = useState<string>("");

  const provincesQuery = useQuery<Province[]>({
    queryKey: ["provinces"],
    queryFn: async () => {
      const res = await apiClient.get("/regions/provinces");
      return res.data;
    },
  });

  const regenciesQuery = useQuery<Regency[]>({
    queryKey: ["regencies", selectedProvinceId],
    queryFn: async () => {
      const res = await apiClient.get("/regions/regencies", {
        params: {
          provinceId: selectedProvinceId || undefined,
        },
      });
      return res.data;
    },
  });

  const createProvinceMutation = useMutation({
    mutationFn: async () => {
      await apiClient.post("/regions/provinces", {
        name: provinceForm.name,
        code: provinceForm.code,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["provinces"] });
      setProvinceForm({ name: "", code: "" });
    },
  });

  return (
    <div className="grid gap-4 p-4 lg:grid-cols-2 lg:p-6">
      <div className="rounded-xl bg-slate-900/80 p-4 ring-1 ring-slate-800">
        <h2 className="text-sm font-semibold text-slate-50">Provinsi</h2>
        <p className="text-xs text-slate-400">
          Kelola daftar provinsi beserta kode unik (kode BPS).
        </p>

        <form
          className="mt-4 flex flex-col gap-3 text-xs"
          onSubmit={(e) => {
            e.preventDefault();
            createProvinceMutation.mutate();
          }}
        >
          <div className="flex flex-col gap-1">
            <label>Nama provinsi</label>
            <input
              value={provinceForm.name}
              onChange={(e) =>
                setProvinceForm((f) => ({ ...f, name: e.target.value }))
              }
              className="rounded-lg border border-slate-700 bg-slate-900 px-2 py-1 text-xs"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label>Kode provinsi</label>
            <input
              value={provinceForm.code}
              onChange={(e) =>
                setProvinceForm((f) => ({ ...f, code: e.target.value }))
              }
              className="rounded-lg border border-slate-700 bg-slate-900 px-2 py-1 text-xs"
            />
          </div>
          <button
            type="submit"
            disabled={createProvinceMutation.isPending}
            className="self-start rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-slate-950 hover:bg-emerald-400 disabled:opacity-60"
          >
            {createProvinceMutation.isPending ? "Menyimpan..." : "Tambah Provinsi"}
          </button>
        </form>

        <div className="mt-4 max-h-64 overflow-y-auto text-xs scrollbar-thin">
          <table className="min-w-full border-collapse">
            <thead className="sticky top-0 bg-slate-900">
              <tr className="text-left text-[11px] uppercase text-slate-400">
                <th className="px-2 py-1">Kode</th>
                <th className="px-2 py-1">Nama</th>
              </tr>
            </thead>
            <tbody>
              {provincesQuery.data?.map((p) => (
                <tr key={p.id} className="border-t border-slate-800">
                  <td className="px-2 py-1">{p.code}</td>
                  <td className="px-2 py-1">{p.name}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-xl bg-slate-900/80 p-4 ring-1 ring-slate-800">
        <h2 className="text-sm font-semibold text-slate-50">Kabupaten / Kota</h2>
        <p className="text-xs text-slate-400">
          Filter berdasarkan provinsi untuk melihat kabupaten/kota terkait.
        </p>

        <div className="mt-4 flex items-center gap-2 text-xs">
          <label>Provinsi</label>
          <select
            value={selectedProvinceId}
            onChange={(e) => setSelectedProvinceId(e.target.value)}
            className="rounded-lg border border-slate-700 bg-slate-900 px-2 py-1 text-xs"
          >
            <option value="">Semua provinsi</option>
            {provincesQuery.data?.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-4 max-h-72 overflow-y-auto text-xs scrollbar-thin">
          <table className="min-w-full border-collapse">
            <thead className="sticky top-0 bg-slate-900">
              <tr className="text-left text-[11px] uppercase text-slate-400">
                <th className="px-2 py-1">Provinsi</th>
                <th className="px-2 py-1">Kode</th>
                <th className="px-2 py-1">Kabupaten / Kota</th>
              </tr>
            </thead>
            <tbody>
              {regenciesQuery.data?.map((r) => (
                <tr key={r.id} className="border-t border-slate-800">
                  <td className="px-2 py-1">{r.province.name}</td>
                  <td className="px-2 py-1">{r.code}</td>
                  <td className="px-2 py-1">{r.name}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}