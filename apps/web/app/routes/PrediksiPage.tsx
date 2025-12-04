"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { apiClient } from "../services/apiClient";
import { ResponsiveContainer, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Line } from "recharts";

interface Option {
  id: number;
  name: string;
}

interface PredictionRow {
  predictionDate: string;
  predictedPrice: string | number;
}

export function PrediksiPage() {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState({
    provinceId: "",
    regencyId: "",
    commodityId: "",
    horizon: "7",
  });

  const provincesQuery = useQuery<Option[]>({
    queryKey: ["provinces"],
    queryFn: async () => {
      const res = await apiClient.get("/regions/provinces");
      return res.data;
    },
  });

  const commoditiesQuery = useQuery<Option[]>({
    queryKey: ["commodities"],
    queryFn: async () => {
      const res = await apiClient.get("/commodities");
      return res.data;
    },
  });

  const regenciesQuery = useQuery<Option[]>({
    queryKey: ["regencies", filters.provinceId],
    enabled: !!filters.provinceId,
    queryFn: async () => {
      const res = await apiClient.get("/regions/regencies", {
        params: { provinceId: filters.provinceId },
      });
      return res.data;
    },
  });

  const predictionQuery = useQuery<PredictionRow[]>({
    queryKey: ["predictions", filters],
    enabled:
      !!filters.provinceId && !!filters.regencyId && !!filters.commodityId,
    queryFn: async () => {
      const horizon = Number(filters.horizon);
      const start = new Date();
      const end = new Date();
      end.setDate(start.getDate() + horizon);

      const res = await apiClient.post("/prices/predictions/generate", {
        provinceId: Number(filters.provinceId),
        regencyId: Number(filters.regencyId),
        commodityId: Number(filters.commodityId),
        startDate: start.toISOString(),
        endDate: end.toISOString(),
      });

      return res.data as PredictionRow[];
    },
  });

  const mutation = useMutation({
    mutationFn: async () => {
      await predictionQuery.refetch();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["predictions", filters] });
    },
  });

  const chartData =
    predictionQuery.data?.map((row) => ({
      date: row.predictionDate.slice(0, 10),
      predicted: Number(row.predictedPrice),
    })) ?? [];

  return (
    <div className="space-y-4 p-4 lg:p-6">
      <div className="rounded-xl bg-slate-900/80 p-4 ring-1 ring-slate-800">
        <h1 className="text-sm font-semibold text-slate-50">
          Prediksi Harga Komoditas
        </h1>
        <p className="text-xs text-slate-400">
          Pilih wilayah, komoditas, dan horizon waktu untuk menghasilkan prediksi
          harga dari model ML.
        </p>

        <form
          className="mt-4 grid gap-3 md:grid-cols-4"
          onSubmit={(e) => {
            e.preventDefault();
            mutation.mutate();
          }}
        >
          <div className="flex flex-col gap-1 text-xs">
            <label className="text-slate-300">Provinsi</label>
            <select
              className="rounded-lg border border-slate-700 bg-slate-900 px-2 py-1 text-xs"
              value={filters.provinceId}
              onChange={(e) =>
                setFilters((f) => ({
                  ...f,
                  provinceId: e.target.value,
                  regencyId: "",
                }))
              }
            >
              <option value="">Pilih provinsi</option>
              {provincesQuery.data?.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1 text-xs">
            <label className="text-slate-300">Kabupaten / Kota</label>
            <select
              className="rounded-lg border border-slate-700 bg-slate-900 px-2 py-1 text-xs"
              value={filters.regencyId}
              onChange={(e) =>
                setFilters((f) => ({ ...f, regencyId: e.target.value }))
              }
            >
              <option value="">Pilih kabupaten/kota</option>
              {regenciesQuery.data?.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1 text-xs">
            <label className="text-slate-300">Komoditas</label>
            <select
              className="rounded-lg border border-slate-700 bg-slate-900 px-2 py-1 text-xs"
              value={filters.commodityId}
              onChange={(e) =>
                setFilters((f) => ({ ...f, commodityId: e.target.value }))
              }
            >
              <option value="">Pilih komoditas</option>
              {commoditiesQuery.data?.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1 text-xs">
            <label className="text-slate-300">Horizon (hari ke depan)</label>
            <select
              className="rounded-lg border border-slate-700 bg-slate-900 px-2 py-1 text-xs"
              value={filters.horizon}
              onChange={(e) =>
                setFilters((f) => ({ ...f, horizon: e.target.value }))
              }
            >
              <option value="7">7 hari</option>
              <option value="30">30 hari</option>
            </select>
          </div>
          <div className="md:col-span-4">
            <button
              type="submit"
              disabled={mutation.isPending}
              className="mt-2 rounded-lg bg-emerald-500 px-4 py-1.5 text-xs font-semibold text-slate-950 hover:bg-emerald-400 disabled:opacity-60"
            >
              {mutation.isPending ? "Mengirim..." : "Generate Prediksi"}
            </button>
          </div>
        </form>
      </div>

      <div className="rounded-xl bg-slate-900/80 p-4 ring-1 ring-slate-800">
        <h2 className="mb-3 text-sm font-semibold text-slate-50">
          Grafik Prediksi Harga
        </h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="date" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#020617",
                  borderColor: "#1e293b",
                  borderRadius: 8,
                  fontSize: 12,
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="predicted"
                name="Harga prediksi"
                stroke="#22c55e"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}