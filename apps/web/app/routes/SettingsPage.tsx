"use client";

import { useState } from "react";
import { useTheme } from "../providers/theme-provider";

export function SettingsPage() {
  const { theme, toggleTheme } = useTheme();
  const [threshold, setThreshold] = useState("15");
  const [timezone, setTimezone] = useState("Asia/Jakarta");
  const [language, setLanguage] = useState<"id" | "en">("id");

  return (
    <div className="space-y-4 p-4 lg:p-6">
      <div className="rounded-xl bg-slate-900/80 p-4 ring-1 ring-slate-800">
        <h1 className="text-sm font-semibold text-slate-50">
          Pengaturan Sistem
        </h1>
        <p className="text-xs text-slate-400">
          Atur tema, threshold lonjakan harga, zona waktu, dan bahasa.
        </p>

        <div className="mt-4 grid gap-4 md:grid-cols-2 text-xs">
          <div className="flex flex-col gap-2">
            <label className="text-slate-300">Tema</label>
            <button
              type="button"
              onClick={toggleTheme}
              className="w-fit rounded-lg bg-slate-800 px-3 py-1.5 text-xs"
            >
              Mode saat ini: {theme === "dark" ? "Dark" : "Light"}
            </button>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-slate-300">
              Threshold lonjakan harga (%)
            </label>
            <input
              value={threshold}
              onChange={(e) => setThreshold(e.target.value)}
              className="w-32 rounded-lg border border-slate-700 bg-slate-900 px-2 py-1 text-xs"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-slate-300">Zona waktu</label>
            <select
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="w-52 rounded-lg border border-slate-700 bg-slate-900 px-2 py-1 text-xs"
            >
              <option value="Asia/Jakarta">WIB (Asia/Jakarta)</option>
              <option value="Asia/Makassar">WITA (Asia/Makassar)</option>
              <option value="Asia/Jayapura">WIT (Asia/Jayapura)</option>
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-slate-300">Bahasa</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as "id" | "en")}
              className="w-40 rounded-lg border border-slate-700 bg-slate-900 px-2 py-1 text-xs"
            >
              <option value="id">Bahasa Indonesia</option>
              <option value="en">English</option>
            </select>
          </div>
        </div>
        <p className="mt-4 text-[11px] text-slate-500">
          Untuk kesederhanaan, nilai konfigurasi pada layar ini disimpan di sisi
          klien. Integrasi penuh dengan backend dapat dilakukan melalui endpoint
          SystemSetting yang sudah disediakan.
        </p>
      </div>
    </div>
  );
}