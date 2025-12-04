"use client";

import { useState } from "react";
import { apiClient } from "../services/apiClient";

export function ReportsPage() {
  const [format, setFormat] = useState<"pdf" | "xlsx">("pdf");

  const handleDownload = async () => {
    const now = new Date();
    const start = new Date(now);
    start.setDate(now.getDate() - 7);

    const params = new URLSearchParams({
      commodityId: "1",
      startDate: start.toISOString(),
      endDate: now.toISOString(),
      format,
    });

    const res = await apiClient.get<Blob>(`/reports/weekly?${params.toString()}`, {
      responseType: "blob",
    });

    const blob = new Blob([res.data], {
      type:
        format === "pdf"
          ? "application/pdf"
          : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download =
      format === "pdf"
        ? "laporan-harga-mingguan.pdf"
        : "laporan-harga-mingguan.xlsx";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4 p-4 lg:p-6">
      <div className="rounded-xl bg-slate-900/80 p-4 text-xs ring-1 ring-slate-800">
        <h1 className="text-sm font-semibold text-slate-50">
          Laporan &amp; Ekspor
        </h1>
        <p className="text-xs text-slate-400">
          Generate laporan periodik harga dan prediksi dalam format PDF atau
          Excel siap cetak.
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <select
            value={format}
            onChange={(e) => setFormat(e.target.value as typeof format)}
            className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-1 text-xs"
          >
            <option value="pdf">PDF</option>
            <option value="xlsx">Excel</option>
          </select>
          <button
            type="button"
            onClick={handleDownload}
            className="rounded-lg bg-emerald-500 px-4 py-1.5 text-xs font-semibold text-slate-950 hover:bg-emerald-400"
          >
            Download Laporan Contoh
          </button>
        </div>
      </div>
    </div>
  );
}