"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Bell,
  ChartAreaIcon,
  ChartLine,
  CloudDownload,
  Database,
  Gauge,
  LayoutDashboard,
  MapPin,
  Settings,
  Users,
} from "lucide-react";
import { BrowserRouter, NavLink, Route, Routes } from "react-router-dom";
import { useTheme } from "./providers/theme-provider";
import { useDashboardSummary } from "./services/useDashboardSummary";
import { useEffect, useMemo, useState } from "react";
import { useRealtimePrices } from "./services/useRealtimePrices";
import { PrediksiPage } from "./routes/PrediksiPage";
import { DataWilayahPage } from "./routes/DataWilayahPage";
import { DataKomoditasPage } from "./routes/DataKomoditasPage";
import { DataHargaPage } from "./routes/DataHargaPage";
import { AnalyticsPage } from "./routes/AnalyticsPage";
import { ModelPage } from "./routes/ModelPage";
import { UsersPage } from "./routes/UsersPage";
import { ReportsPage } from "./routes/ReportsPage";
import { SettingsPage } from "./routes/SettingsPage";
import { LoginPage } from "./routes/LoginPage";

const KPICard = ({
  title,
  value,
  subtitle,
}: {
  title: string;
  value: string;
  subtitle?: string;
}) => (
  <div className="rounded-xl bg-slate-900/80 p-4 shadow-soft ring-1 ring-slate-800">
    <p className="text-xs font-medium uppercase text-slate-400">{title}</p>
    <p className="mt-2 text-2xl font-semibold text-slate-50">{value}</p>
    {subtitle && (
      <p className="mt-1 text-xs text-slate-400">
        {subtitle}
      </p>
    )}
  </div>
);

const menuItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/wilayah", label: "Data Wilayah", icon: MapPin },
  { to: "/komoditas", label: "Data Komoditas", icon: Database },
  { to: "/harga", label: "Data Harga", icon: ChartAreaIcon },
  { to: "/prediksi", label: "Prediksi Harga", icon: ChartLine },
  { to: "/analytics", label: "Analitik", icon: Gauge },
  { to: "/models", label: "Model ML", icon: CloudDownload },
  { to: "/users", label: "User", icon: Users },
  { to: "/reports", label: "Laporan", icon: CloudDownload },
  { to: "/settings", label: "Pengaturan", icon: Settings },
];

function Sidebar({ collapsed }: { collapsed: boolean }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <aside
      className={`flex h-full flex-col border-r border-slate-800 bg-slate-950/80 px-3 py-4 transition-all duration-200 ${
        collapsed ? "w-16" : "w-64"
      }`}
    >
      <div className="mb-6 flex items-center gap-2 px-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500 text-sm font-bold text-slate-900">
          PI
        </div>
        {!collapsed && (
          <div className="flex flex-col">
            <span className="text-sm font-semibold">Pangan Insight</span>
            <span className="text-[11px] text-slate-400">
              Harga Pangan Nasional
            </span>
          </div>
        )}
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto scrollbar-thin">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                [
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-emerald-500 text-slate-950"
                    : "text-slate-300 hover:bg-slate-800/70 hover:text-white",
                ].join(" ")
              }
            >
              <Icon className="h-4 w-4" />
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>
      <button
        type="button"
        onClick={toggleTheme}
        className="mt-4 flex items-center justify-center rounded-lg border border-slate-700 px-3 py-2 text-[11px] font-medium text-slate-300 hover:bg-slate-800"
      >
        Mode: {theme === "dark" ? "Dark" : "Light"}
      </button>
    </aside>
  );
}

function TopBar() {
  const [timeFilter, setTimeFilter] = useState<"today" | "week" | "month" | "year">(
    "today",
  );

  return (
    <header className="flex items-center justify-between border-b border-slate-800 bg-slate-950/80 px-6 py-3">
      <div className="flex items-center gap-3">
        <input
          placeholder="Cari komoditas, wilayah..."
          className="w-64 rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-xs text-slate-100 placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none"
        />
        <div className="flex items-center gap-1 rounded-full bg-slate-900 p-1 text-xs">
          {[
            { key: "today", label: "Hari ini" },
            { key: "week", label: "Minggu ini" },
            { key: "month", label: "Bulan ini" },
            { key: "year", label: "Tahun ini" },
          ].map((opt) => (
            <button
              key={opt.key}
              type="button"
              onClick={() =>
                setTimeFilter(opt.key as typeof timeFilter)
              }
              className={`rounded-full px-3 py-1 ${
                timeFilter === opt.key
                  ? "bg-emerald-500 text-slate-950"
                  : "text-slate-300"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-4">
        <button
          type="button"
          className="relative flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-slate-300 hover:text-white"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-emerald-400" />
        </button>
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-emerald-500 to-sky-500" />
          <div className="flex flex-col">
            <span className="text-xs font-medium">Admin Pangan</span>
            <span className="text-[11px] text-slate-400">Admin</span>
          </div>
        </div>
      </div>
    </header>
  );
}

function DashboardHome() {
  const { data, isLoading } = useDashboardSummary();
  useRealtimePrices();

  const chartData = useMemo(() => {
    if (!data) return [];
    // Dummy series from aggregated current/lastWeek values
    return data.priceChange.map((row) => ({
      commodityId: row.commodityId,
      name: `Komoditas ${row.commodityId}`,
      current: row.current,
      lastWeek: row.lastWeek ?? row.current,
    }));
  }, [data]);

  return (
    <div className="space-y-4 p-4 lg:p-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KPICard
          title="Total Data Harga"
          value={isLoading ? "..." : data?.totals.priceCount.toLocaleString("id-ID") ?? "0"}
          subtitle="Baris harga harian tersimpan"
        />
        <KPICard
          title="Jumlah Komoditas"
          value={isLoading ? "..." : String(data?.totals.commodityCount ?? 0)}
          subtitle="Komoditas aktif untuk prediksi"
        />
        <KPICard
          title="Wilayah Tercakup"
          value={
            isLoading
              ? "..."
              : `${data?.totals.provinceCount ?? 0} prov / ${data?.totals.regencyCount ?? 0} kab/kota`
          }
          subtitle="Cakupan data wilayah"
        />
        <KPICard
          title="Akurasi Model Terbaru"
          value={
            data?.modelMetrics
              ? `${data.modelMetrics.mape.toFixed(1)}% MAPE`
              : "Belum ada"
          }
          subtitle="Semakin kecil semakin baik"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-xl bg-slate-900/80 p-4 shadow-soft ring-1 ring-slate-800 lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-slate-50">
                Tren Harga Nasional
              </h2>
              <p className="text-xs text-slate-400">
                Rata-rata harga minggu ini vs minggu lalu
              </p>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#64748b" />
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
                <Bar
                  dataKey="lastWeek"
                  name="Minggu lalu"
                  fill="#475569"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="current"
                  name="Hari ini"
                  fill="#22c55e"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl bg-slate-900/80 p-4 shadow-soft ring-1 ring-slate-800">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-slate-50">
                Alert Lonjakan Harga
              </h2>
              <p className="text-xs text-slate-400">
                Wilayah dengan kenaikan harga signifikan
              </p>
            </div>
          </div>
          <div className="space-y-2 text-xs">
            {data?.alerts && data.alerts.length > 0 ? (
              data.alerts.slice(0, 5).map((alert, idx) => (
                <div
                  key={`${alert.provinceId}-${alert.regencyId}-${alert.commodityId}-${idx}`}
                  className="flex items-start justify-between rounded-lg bg-red-500/10 px-3 py-2 text-red-100"
                >
                  <div>
                    <p className="font-medium">
                      Komoditas {alert.commodityId}
                    </p>
                    <p className="text-[11px] text-red-200">
                      Prov {alert.provinceId} / Kab {alert.regencyId}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[11px] text-red-200">
                      {alert.changePct
                        ? `${alert.changePct.toFixed(1)}%`
                        : "n/a"}
                    </p>
                    <p className="text-[11px] text-red-200">
                      Rp{alert.latestPrice.toLocaleString("id-ID")}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-slate-400">Belum ada lonjakan signifikan.</p>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl bg-slate-900/80 p-4 shadow-soft ring-1 ring-slate-800">
          <h2 className="mb-3 text-sm font-semibold text-slate-50">
            Tren Prediksi vs Aktual (contoh)
          </h2>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={[
                  { date: "M-5", actual: 12000, predicted: 11800 },
                  { date: "M-4", actual: 12150, predicted: 12000 },
                  { date: "M-3", actual: 12300, predicted: 12200 },
                  { date: "M-2", actual: 12400, predicted: 12350 },
                  { date: "M-1", actual: 12550, predicted: 12600 },
                ]}
              >
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
                  dataKey="actual"
                  name="Aktual"
                  stroke="#22c55e"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="predicted"
                  name="Prediksi"
                  stroke="#38bdf8"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="rounded-xl bg-slate-900/80 p-4 shadow-soft ring-1 ring-slate-800">
          <h2 className="mb-3 text-sm font-semibold text-slate-50">
            Aktivitas Terakhir
          </h2>
          <ul className="space-y-2 text-xs text-slate-300">
            <li>• Admin melakukan training ulang model Random Forest.</li>
            <li>• Analis mengimpor data harga harian dari CSV.</li>
            <li>• Sistem mendeteksi lonjakan harga Cabai Merah di Jawa Barat.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function AppShell() {
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)");
    setCollapsed(mq.matches);
    const handler = (e: MediaQueryListEvent) => setCollapsed(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100">
      <Sidebar collapsed={collapsed} />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar />
        <main className="min-h-0 flex-1 overflow-y-auto bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900">
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={<DashboardHome />} />
            <Route path="/wilayah" element={<DataWilayahPage />} />
            <Route path="/komoditas" element={<DataKomoditasPage />} />
            <Route path="/harga" element={<DataHargaPage />} />
            <Route path="/prediksi" element={<PrediksiPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/models" element={<ModelPage />} />
            <Route path="/users" element={<UsersPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default function Home() {
  // Saat build/prerender di server, hindari rendering BrowserRouter
  if (typeof window === "undefined") {
    return null;
  }

  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  );
}
