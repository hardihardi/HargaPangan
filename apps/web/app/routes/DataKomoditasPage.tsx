"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { apiClient } from "../services/apiClient";

interface Commodity {
  id: number;
  name: string;
  category: string;
  unit: string;
  isActive: boolean;
}

export function DataKomoditasPage() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    name: "",
    category: "",
    unit: "kg",
  });

  const commoditiesQuery = useQuery<Commodity[]>({
    queryKey: ["commodities"],
    queryFn: async () => {
      const res = await apiClient.get("/commodities");
      return res.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      await apiClient.post("/commodities", {
        ...form,
        isActive: true,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["commodities"] });
      setForm({ name: "", category: "", unit: "kg" });
    },
  });

  const toggleMutation = useMutation({
    mutationFn: async (payload: { id: number; isActive: boolean }) => {
      await apiClient.post(`/commodities/${payload.id}/toggle`, {
        isActive: payload.isActive,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["commodities"] });
    },
  });

  return (
    <div className="grid gap-4 p-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] lg:p-6">
      <div className="rounded-xl bg-slate-900/80 p-4 ring-1 ring-slate-800">
        <h2 className="text-sm font-semibold text-slate-50">Tambah Komoditas</h2>
        <p className="text-xs text-slate-400">
          Daftarkan komoditas yang digunakan dalam prediksi harga.
        </p>

        <form
          className="mt-4 flex flex-col gap-3 text-xs"
          onSubmit={(e) => {
            e.preventDefault();
            createMutation.mutate();
          }}
        >
          <div className="flex flex-col gap-1">
            <label>Nama komoditas</label>
            <input
              value={form.name}
              onChange={(e) =>
                setForm((f) => ({ ...f, name: e.target.value }))
              }
              className="rounded-lg border border-slate-700 bg-slate-900 px-2 py-1 text-xs"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label>Kategori</label>
            <input
              value={form.category}
              onChange={(e) =>
                setForm((f) => ({ ...f, category: e.target.value }))
              }
              className="rounded-lg border border-slate-700 bg-slate-900 px-2 py-1 text-xs"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label>Satuan</label>
            <select
              value={form.unit}
              onChange={(e) =>
                setForm((f) => ({ ...f, unit: e.target.value }))
              }
              className="rounded-lg border border-slate-700 bg-slate-900 px-2 py-1 text-xs"
            >
              <option value="kg">kg</option>
              <option value="liter">liter</option>
              <option value="pcs">pcs</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={createMutation.isPending}
            className="mt-2 self-start rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-slate-950 hover:bg-emerald-400 disabled:opacity-60"
          >
            {createMutation.isPending ? "Menyimpan..." : "Tambah Komoditas"}
          </button>
        </form>
      </div>

      <div className="rounded-xl bg-slate-900/80 p-4 ring-1 ring-slate-800">
        <h2 className="text-sm font-semibold text-slate-50">
          Daftar Komoditas
        </h2>
        <p className="text-xs text-slate-400">
          Aktif/nonaktifkan komoditas yang akan digunakan dalam prediksi.
        </p>

        <div className="mt-4 max-h-80 overflow-y-auto text-xs scrollbar-thin">
          <table className="min-w-full border-collapse">
            <thead className="sticky top-0 bg-slate-900">
              <tr className="text-left text-[11px] uppercase text-slate-400">
                <th className="px-2 py-1">Nama</th>
                <th className="px-2 py-1">Kategori</th>
                <th className="px-2 py-1">Satuan</th>
                <th className="px-2 py-1">Status</th>
                <th className="px-2 py-1" />
              </tr>
            </thead>
            <tbody>
              {commoditiesQuery.data?.map((c) => (
                <tr key={c.id} className="border-t border-slate-800">
                  <td className="px-2 py-1">{c.name}</td>
                  <td className="px-2 py-1">{c.category}</td>
                  <td className="px-2 py-1">{c.unit}</td>
                  <td className="px-2 py-1">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-[11px] ${
                        c.isActive
                          ? "bg-emerald-500/10 text-emerald-300"
                          : "bg-slate-700/60 text-slate-300"
                      }`}
                    >
                      {c.isActive ? "Aktif" : "Nonaktif"}
                    </span>
                  </td>
                  <td className="px-2 py-1 text-right">
                    <button
                      type="button"
                      onClick={() =>
                        toggleMutation.mutate({
                          id: c.id,
                          isActive: !c.isActive,
                        })
                      }
                      className="rounded-lg border border-slate-700 px-2 py-0.5 text-[11px] hover:bg-slate-800"
                    >
                      {c.isActive ? "Nonaktifkan" : "Aktifkan"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}