"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { apiClient } from "../services/apiClient";

interface ModelRun {
  id: number;
  modelName: string;
  modelType: string;
  startedAt: string;
  finishedAt: string | null;
  status: string;
  rmse: number | null;
  mae: number | null;
  mape: number | null;
}

export function ModelPage() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    modelName: "random_forest_baseline",
    modelType: "random_forest",
    range: "2y",
  });

  const runsQuery = useQuery<ModelRun[]>({
    queryKey: ["model-runs"],
    queryFn: async () => {
      const res = await apiClient.get("/models/runs");
      return res.data;
    },
  });

  const trainMutation = useMutation({
    mutationFn: async () => {
      const now = new Date();
      const dateTo = now.toISOString();
      const dateFrom = new Date(
        now.getFullYear() - (form.range === "2y" ? 2 : 1),
        now.getMonth(),
        now.getDate(),
      ).toISOString();

      await apiClient.post("/models/train", {
        modelName: form.modelName,
        modelType: form.modelType,
        dateFrom,
        dateTo,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["model-runs"] });
    },
  });

  return (
    <div className="grid gap-4 p-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,2fr)] lg:p-6">
      <div className="rounded-xl bg-slate-900/80 p-4 ring-1 ring-slate-800">
        <h2 className="text-sm font-semibold text-slate-50">
          Train Ulang Model
        </h2>
        <p className="text-xs text-slate-400">
          Pilih konfigurasi model dan rentang data untuk melatih ulang model
          prediksi harga.
        </p>

        <form
          className="mt-4 flex flex-col gap-3 text-xs"
          onSubmit={(e) => {
            e.preventDefault();
            trainMutation.mutate();
          }}
        >
          <div className="flex flex-col gap-1">
            <label>Nama model</label>
            <input
              value={form.modelName}
              onChange={(e) =>
                setForm((f) => ({ ...f, modelName: e.target.value }))
              }
              className="rounded-lg border border-slate-700 bg-slate-900 px-2 py-1 text-xs"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label>Tipe model</label>
            <select
              value={form.modelType}
              onChange={(e) =>
                setForm((f) => ({ ...f, modelType: e.target.value }))
              }
              className="rounded-lg border border-slate-700 bg-slate-900 px-2 py-1 text-xs"
            >
              <option value="random_forest">Random Forest</option>
              <option value="xgboost">XGBoost</option>
              <option value="ensemble">Ensemble</option>
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label>Rentang data</label>
            <select
              value={form.range}
              onChange={(e) =>
                setForm((f) => ({ ...f, range: e.target.value }))
              }
              className="rounded-lg border border-slate-700 bg-slate-900 px-2 py-1 text-xs"
            >
              <option value="1y">1 tahun terakhir</option>
              <option value="2y">2 tahun terakhir</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={trainMutation.isPending}
            className="mt-2 self-start rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-slate-950 hover:bg-emerald-400 disabled:opacity-60"
          >
            {trainMutation.isPending ? "Training..." : "Train Ulang Model"}
          </button>
        </form>
      </div>

      <div className="rounded-xl bg-slate-900/80 p-4 ring-1 ring-slate-800">
        <h2 className="text-sm font-semibold text-slate-50">
          Riwayat Training Model
        </h2>
        <p className="text-xs text-slate-400">
          Pantau performa model dari setiap sesi training.
        </p>

        <div className="mt-3 max-h-80 overflow-y-auto text-xs scrollbar-thin">
          <table className="min-w-full border-collapse">
            <thead className="sticky top-0 bg-slate-900">
              <tr className="text-left text-[11px] uppercase text-slate-400">
                <th className="px-2 py-1">Waktu</th>
                <th className="px-2 py-1">Model</th>
                <th className="px-2 py-1">Status</th>
                <th className="px-2 py-1">RMSE</th>
                <th className="px-2 py-1">MAPE</th>
              </tr>
            </thead>
            <tbody>
              {runsQuery.data?.map((run) => (
                <tr key={run.id} className="border-t border-slate-800">
                  <td className="px-2 py-1">
                    {new Date(run.startedAt).toLocaleString("id-ID")}
                  </td>
                  <td className="px-2 py-1">
                    {run.modelName} ({run.modelType})
                  </td>
                  <td className="px-2 py-1">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-[11px] ${
                        run.status === "SUCCESS"
                          ? "bg-emerald-500/10 text-emerald-300"
                          : run.status === "RUNNING"
                            ? "bg-sky-500/10 text-sky-300"
                            : "bg-red-500/10 text-red-300"
                      }`}
                    >
                      {run.status}
                    </span>
                  </td>
                  <td className="px-2 py-1">
                    {run.rmse != null ? run.rmse.toFixed(1) : "-"}
                  </td>
                  <td className="px-2 py-1">
                    {run.mape != null ? `${run.mape.toFixed(1)}%` : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!runsQuery.data?.length && (
            <p className="mt-2 text-slate-400">
              Belum ada riwayat training model.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}