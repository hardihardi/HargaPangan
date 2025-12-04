"use client";

export function AnalyticsPage() {
  return (
    <div className="space-y-4 p-4 lg:p-6">
      <div className="rounded-xl bg-slate-900/80 p-4 ring-1 ring-slate-800">
        <h1 className="text-sm font-semibold text-slate-50">
          Analitik &amp; Visualisasi
        </h1>
        <p className="text-xs text-slate-400">
          Halaman ini disiapkan untuk heatmap harga per provinsi, perbandingan
          antar wilayah, dan distribusi harga (histogram/boxplot).
        </p>
        <p className="mt-3 text-xs text-slate-300">
          Struktur komponen dan style mengikuti dashboard utama, sehingga Anda
          dapat dengan mudah menambahkan grafik menggunakan Recharts atau
          perpustakaan lain sesuai kebutuhan.
        </p>
      </div>
    </div>
  );
}