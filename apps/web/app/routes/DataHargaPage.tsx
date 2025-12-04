"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { apiClient } from "../services/apiClient";

interface Option {
  id: number;
  name: string;
}

interface PriceRow {
  id: number;
  date: string;
  price: string | number;
  source: string;
  province: Option;
  regency: Option;
  commodity: {
    id: number;
    name: string;
    unit: string;
  };
}

export function DataHargaPage() {
  const queryClient = useQueryClient();
  const [mode, setMode] = useState<"manual" | "import" | "api">("manual");
  const [filter, setFilter] = useState({
    provinceId: "",
    regencyId: "",
    commodityId: "",
  });
  const [manualForm, setManualForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    price: "",
  });

  const provincesQuery = useQuery<Option[]>({
    queryKey: ["provinces"],
    queryFn: async () => {
      const res = await apiClient.get("/regions/provinces");
      return res.data;
    },
  });

  const [syncRange, setSyncRange] = useState({
    dateFrom: "",
    dateTo: "",
  });

  const syncGovMutation = useMutation({
    mutationFn: async () => {
      await apiClient.post("/integrations/gov/prices/sync", undefined, {
        params: {
          dateFrom: syncRange.dateFrom || undefined,
          dateTo: syncRange.dateTo || undefined,
        },
      });
    },
    onSuccess: () => {
      // Harga yang baru tersinkronisasi bisa langsung muncul di tabel manual
      queryClient.invalidateQueries({ queryKey: ["prices"] });
      queryClient.invalidateQueries({ queryKey: ["gov-sync-logs"] });
    },
  });

  interface SyncLogRow {
    id: number;
    status: string;
    runAt: string;
    records: number;
    errorMessage: string | null;
    details: {
      from?: string;
      to?: string;
      inserted?: number;
      updated?: number;
      skipped?: number;
      [key: string]: unknown;
    } | null;
  }

  const syncLogsQuery = useQuery<SyncLogRow[]>({
    queryKey: ["gov-sync-logs"],
    enabled: mode === "api",
    queryFn: async () => {
      const res = await apiClient.get("/integrations/gov/sync-logs");
      return res.data;
    },
  });

  const regenciesQuery = useQuery<Option[]>({
    queryKey: ["regencies", filter.provinceId],
    enabled: !!filter.provinceId,
    queryFn: async () => {
      const res = await apiClient.get("/regions/regencies", {
        params: { provinceId: filter.provinceId },
      });
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

  const pricesQuery = useQuery<{
    items: PriceRow[];
    total: number;
  }>({
    queryKey: ["prices", filter],
    enabled: mode === "manual",
    queryFn: async () => {
      const res = await apiClient.get("/prices/daily", {
        params: {
          provinceId: filter.provinceId || undefined,
          regencyId: filter.regencyId || undefined,
          commodityId: filter.commodityId || undefined,
        },
      });
      return res.data;
    },
  });

  const createPriceMutation = useMutation({
    mutationFn: async () => {
      await apiClient.post("/prices/daily", {
        provinceId: Number(filter.provinceId),
        regencyId: Number(filter.regencyId),
        commodityId: Number(filter.commodityId),
        date: manualForm.date,
        price: Number(manualForm.price),
        source: "INPUT_MANUAL",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["prices", filter] });
      setManualForm((f) => ({ ...f, price: "" }));
    },
  });

  const selectedCommodity = useMemo(
    () =>
      commoditiesQuery.data?.find(
        (c) => String(c.id) === filter.commodityId,
      ) ?? null,
    [commoditiesQuery.data, filter.commodityId],
  );

  return (
    <div className="space-y-4 p-4 lg:p-6">
      <div className="flex flex-wrap items-center gap-3 text-xs">
        <div className="inline-flex rounded-full bg-slate-900 p-1">
          {[
            { key: "manual", label: "Input Manual" },
            { key: "import", label: "Import File" },
            { key: "api", label: "Integrasi API" },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setMode(tab.key as typeof mode)}
              className={`rounded-full px-3 py-1 font-medium ${
                mode === tab.key
                  ? "bg-emerald-500 text-slate-950"
                  : "text-slate-300"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {mode === "manual" && (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,2fr)]">
          <div className="rounded-xl bg-slate-900/80 p-4 ring-1 ring-slate-800">
            <h2 className="text-sm font-semibold text-slate-50">
              Input Harga Manual
            </h2>
            <p className="text-xs text-slate-400">
              Masukkan harga harian per wilayah dan komoditas, tanpa duplikasi
              kombinasi (tanggal, wilayah, komoditas).
            </p>

            <form
              className="mt-4 grid gap-3 text-xs"
              onSubmit={(e) => {
                e.preventDefault();
                createPriceMutation.mutate();
              }}
            >
              <div className="flex flex-col gap-1">
                <label>Provinsi</label>
                <select
                  className="rounded-lg border border-slate-700 bg-slate-900 px-2 py-1 text-xs"
                  value={filter.provinceId}
                  onChange={(e) =>
                    setFilter((f) => ({
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
              <div className="flex flex-col gap-1">
                <label>Kabupaten / Kota</label>
                <select
                  className="rounded-lg border border-slate-700 bg-slate-900 px-2 py-1 text-xs"
                  value={filter.regencyId}
                  onChange={(e) =>
                    setFilter((f) => ({ ...f, regencyId: e.target.value }))
                  }
                >
                  <option value="">Pilih kab/kota</option>
                  {regenciesQuery.data?.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label>Komoditas</label>
                <select
                  className="rounded-lg border border-slate-700 bg-slate-900 px-2 py-1 text-xs"
                  value={filter.commodityId}
                  onChange={(e) =>
                    setFilter((f) => ({ ...f, commodityId: e.target.value }))
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
              <div className="flex flex-col gap-1">
                <label>Tanggal</label>
                <input
                  type="date"
                  value={manualForm.date}
                  onChange={(e) =>
                    setManualForm((f) => ({ ...f, date: e.target.value }))
                  }
                  className="rounded-lg border border-slate-700 bg-slate-900 px-2 py-1 text-xs"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label>
                  Harga {selectedCommodity ? `(${selectedCommodity.name})` : ""}
                </label>
                <input
                  type="number"
                  value={manualForm.price}
                  onChange={(e) =>
                    setManualForm((f) => ({ ...f, price: e.target.value }))
                  }
                  className="rounded-lg border border-slate-700 bg-slate-900 px-2 py-1 text-xs"
                />
              </div>
              <button
                type="submit"
                disabled={createPriceMutation.isPending}
                className="mt-1 self-start rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-slate-950 hover:bg-emerald-400 disabled:opacity-60"
              >
                {createPriceMutation.isPending ? "Menyimpan..." : "Simpan Harga"}
              </button>
            </form>
          </div>

          <div className="rounded-xl bg-slate-900/80 p-4 ring-1 ring-slate-800">
            <h2 className="text-sm font-semibold text-slate-50">
              Riwayat Harga Terkini
            </h2>
            <p className="text-xs text-slate-400">
              Menampilkan data terbaru sesuai filter wilayah dan komoditas.
            </p>

            <div className="mt-3 max-h-80 overflow-y-auto text-xs scrollbar-thin">
              <table className="min-w-full border-collapse">
                <thead className="sticky top-0 bg-slate-900">
                  <tr className="text-left text-[11px] uppercase text-slate-400">
                    <th className="px-2 py-1">Tanggal</th>
                    <th className="px-2 py-1">Wilayah</th>
                    <th className="px-2 py-1">Komoditas</th>
                    <th className="px-2 py-1">Harga</th>
                    <th className="px-2 py-1">Sumber</th>
                  </tr>
                </thead>
                <tbody>
                  {pricesQuery.data?.items.map((row) => (
                    <tr key={row.id} className="border-t border-slate-800">
                      <td className="px-2 py-1">
                        {row.date.slice(0, 10)}
                      </td>
                      <td className="px-2 py-1">
                        {row.province.name} / {row.regency.name}
                      </td>
                      <td className="px-2 py-1">
                        {row.commodity.name} ({row.commodity.unit})
                      </td>
                      <td className="px-2 py-1">
                        Rp{Number(row.price).toLocaleString("id-ID")}
                      </td>
                      <td className="px-2 py-1">{row.source}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {pricesQuery.data && pricesQuery.data.total === 0 && (
                <p className="mt-2 text-slate-400">
                  Belum ada data untuk filter yang dipilih.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {mode === "import" && (
        <div className="rounded-xl bg-slate-900/80 p-4 text-xs ring-1 ring-slate-800">
          <h2 className="text-sm font-semibold text-slate-50">
            Import Data Harga (CSV/Excel)
          </h2>
          <p className="mt-1 text-xs text-slate-400">
            Endpoint backend disiapkan untuk menerima file CSV/Excel. Pada
            contoh UI ini, proses upload belum dihubungkan ke server untuk
            menjaga fokus pada struktur arsitektur.
          </p>
          <ul className="mt-3 list-disc pl-5 text-slate-300">
            <li>Kolom wajib: tanggal, kode_provinsi, kode_kabupaten, id_komoditas, harga.</li>
            <li>Sistem akan menampilkan jumlah baris sukses/gagal beserta detail error.</li>
          </ul>
        </div>
      )}

      {mode === "api" && (
        <div className="rounded-xl bg-slate-900/80 p-4 text-xs ring-1 ring-slate-800">
          <h2 className="text-sm font-semibold text-slate-50">
            Integrasi API Harga Pangan Pemerintah
          </h2>
          <p className="mt-1 text-xs text-slate-400">
            Gunakan fitur ini untuk menarik data harga pangan dari API resmi
            pemerintah Indonesia (misalnya Panel Harga Pangan / layanan lain)
            yang dilindungi dengan API key.
          </p>

          <div className="mt-4 grid gap-3 md:grid-cols-[minmax(0,1.3fr)_minmax(0,1.7fr)]">
            <div className="space-y-3">
              <div className="flex flex-col gap-1">
                <label className="font-medium text-slate-200">
                  Rentang Tanggal Sinkronisasi
                </label>
                <p className="text-[11px] text-slate-400">
                  Jika dikosongkan, sistem akan menarik data sekitar 7 hari
                  terakhir sesuai konfigurasi backend.
                </p>
              </div>
              <div className="grid grid-cols-1 gap-2 text-xs sm:grid-cols-2">
                <div className="flex flex-col gap-1">
                  <label>Dari tanggal</label>
                  <input
                    type="date"
                    value={syncRange.dateFrom}
                    onChange={(e) =>
                      setSyncRange((r) => ({ ...r, dateFrom: e.target.value }))
                    }
                    className="rounded-lg border border-slate-700 bg-slate-900 px-2 py-1 text-xs"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label>Sampai tanggal</label>
                  <input
                    type="date"
                    value={syncRange.dateTo}
                    onChange={(e) =>
                      setSyncRange((r) => ({ ...r, dateTo: e.target.value }))
                    }
                    className="rounded-lg border border-slate-700 bg-slate-900 px-2 py-1 text-xs"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={() => syncGovMutation.mutate()}
                disabled={syncGovMutation.isPending}
                className="mt-2 inline-flex items-center justify-center rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-slate-950 hover:bg-emerald-400 disabled:opacity-60"
              >
                {syncGovMutation.isPending
                  ? "Sinkronisasi..."
                  : "Sinkronkan Data dari API Pemerintah"}
              </button>

              {syncGovMutation.isError && (
                <p className="text-[11px] text-red-400">
                  Gagal sinkronisasi dari API pemerintah. Periksa konfigurasi
                  API di backend (GOV_API_BASE_URL dan GOV_API_KEY) serta
                  format response API.
                </p>
              )}
              {syncGovMutation.isSuccess && (
                <p className="text-[11px] text-emerald-400">
                  Permintaan sinkronisasi telah dikirim. Data yang berhasil
                  dimuat akan muncul pada tabel harga setelah beberapa saat.
                </p>
              )}
            </div>

            <div className="rounded-lg border border-dashed border-slate-700 bg-slate-950/60 p-3">
              <h3 className="text-[11px] font-semibold text-slate-200">
                Cara Konfigurasi API Pemerintah
              </h3>
              <ol className="mt-2 list-decimal space-y-1 pl-4 text-[11px] text-slate-300">
                <li>
                  Dapatkan akses dan API key resmi dari instansi pemerintah
                  penyedia data harga pangan (misalnya Badan Pangan Nasional /
                  Kementerian terkait).
                </li>
                <li>
                  Isi variabel environment di backend:
                  <code className="ml-1 rounded bg-slate-800 px-1">
                    GOV_API_BASE_URL
                  </code>{" "}
                  dan{" "}
                  <code className="rounded bg-slate-800 px-1">
                    GOV_API_KEY
                  </code>
                  .
                </li>
                <li>
                  Sesuaikan pemetaan field di service backend{" "}
                  <code className="rounded bg-slate-800 px-1">
                    govPriceService.ts
                  </code>{" "}
                  agar nama kolom (kode_provinsi, tanggal, harga, dsb.) cocok
                  dengan spesifikasi API Anda.
                </li>
                <li>
                  Jalankan tombol sinkronisasi di atas untuk menarik data dan
                  menyimpannya ke tabel{" "}
                  <code className="rounded bg-slate-800 px-1">
                    DailyPrice
                  </code>
                  . Setiap proses akan dicatat ke{" "}
                  <code className="rounded bg-slate-800 px-1">SyncLog</code>.
                </li>
              </ol>
            </div>
          </div>

          <div className="mt-4 rounded-lg border border-slate-800 bg-slate-950/60 p-3">
            <h3 className="text-[11px] font-semibold text-slate-200">
              Riwayat Sinkronisasi Terakhir
            </h3>
            <p className="mt-1 text-[11px] text-slate-400">
              Tabel ini menampilkan beberapa proses sinkronisasi terakhir dari
              API pemerintah beserta jumlah data yang berhasil dimuat.
            </p>

            <div className="mt-2 max-h-52 overflow-y-auto text-[11px] scrollbar-thin">
              {syncLogsQuery.isLoading && (
                <p className="text-slate-400">Memuat riwayat sinkronisasi...</p>
              )}
              {syncLogsQuery.isError && (
                <p className="text-red-400">
                  Gagal memuat riwayat sinkronisasi. Coba beberapa saat lagi.
                </p>
              )}
              {syncLogsQuery.data && syncLogsQuery.data.length === 0 && (
                <p className="text-slate-400">
                  Belum ada riwayat sinkronisasi yang tercatat.
                </p>
              )}
              {syncLogsQuery.data && syncLogsQuery.data.length > 0 && (
                <table className="mt-1 min-w-full border-collapse">
                  <thead className="sticky top-0 bg-slate-900">
                    <tr className="text-left uppercase text-[10px] text-slate-400">
                      <th className="px-2 py-1">Waktu</th>
                      <th className="px-2 py-1">Status</th>
                      <th className="px-2 py-1">Rentang</th>
                      <th className="px-2 py-1">Rekaman</th>
                    </tr>
                  </thead>
                  <tbody>
                    {syncLogsQuery.data.map((log) => {
                      const from =
                        log.details && typeof log.details.from === "string"
                          ? log.details.from
                          : undefined;
                      const to =
                        log.details && typeof log.details.to === "string"
                          ? log.details.to
                          : undefined;
                      const inserted =
                        log.details && typeof log.details.inserted === "number"
                          ? log.details.inserted
                          : undefined;
                      const updated =
                        log.details && typeof log.details.updated === "number"
                          ? log.details.updated
                          : undefined;
                      const skipped =
                        log.details && typeof log.details.skipped === "number"
                          ? log.details.skipped
                          : undefined;

                      return (
                        <tr
                          key={log.id}
                          className="border-t border-slate-800 align-top"
                        >
                          <td className="px-2 py-1">
                            {new Date(log.runAt).toLocaleString("id-ID", {
                              dateStyle: "short",
                              timeStyle: "short",
                            })}
                          </td>
                          <td className="px-2 py-1">
                            <span
                              className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                                log.status === "SUCCESS"
                                  ? "bg-emerald-500/20 text-emerald-300"
                                  : log.status === "FAILED"
                                    ? "bg-red-500/20 text-red-300"
                                    : "bg-slate-600/30 text-slate-200"
                              }`}
                            >
                              {log.status}
                            </span>
                          </td>
                          <td className="px-2 py-1">
                            {from && to ? `${from} s/d ${to}` : "-"}
                          </td>
                          <td className="px-2 py-1">
                            <div>
                              <span className="font-semibold">
                                {log.records}
                              </span>{" "}
                              baris
                            </div>
                            {(inserted || updated || skipped) && (
                              <div className="text-[10px] text-slate-400">
                                {inserted !== undefined && (
                                  <span>+{inserted} baru</span>
                                )}
                                {updated !== undefined && (
                                  <span className="ml-1">
                                    / {updated} diperbarui
                                  </span>
                                )}
                                {skipped !== undefined && (
                                  <span className="ml-1">
                                    / {skipped} dilewati
                                  </span>
                                )}
                              </div>
                            )}
                            {log.errorMessage && (
                              <div className="mt-0.5 text-[10px] text-red-400">
                                {log.errorMessage}
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}