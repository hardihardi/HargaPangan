"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "./apiClient";

export interface DashboardSummary {
  totals: {
    commodityCount: number;
    provinceCount: number;
    regencyCount: number;
    priceCount: number;
  };
  latestDate: string;
  priceChange: {
    commodityId: number;
    current: number;
    lastWeek: number | null;
    changePct: number | null;
  }[];
  modelMetrics: {
    rmse: number;
    mae: number;
    mape: number;
    precision?: number | null;
    recall?: number | null;
    f1?: number | null;
    roc_auc?: number | null;
  } | null;
  alerts: {
    provinceId: number;
    regencyId: number;
    commodityId: number;
    latestPrice: number;
    prevPrice: number | null;
    changePct: number | null;
  }[];
}

export function useDashboardSummary() {
  return useQuery<DashboardSummary>({
    queryKey: ["dashboard-summary"],
    queryFn: async () => {
      const res = await apiClient.get<DashboardSummary>("/dashboard/summary", {
        headers: {
          // Untuk demo, backend bisa diatur untuk mengizinkan request tanpa auth
        },
      });
      return res.data;
    },
  });
}