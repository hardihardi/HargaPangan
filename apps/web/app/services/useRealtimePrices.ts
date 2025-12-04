"use client";

import { useEffect } from "react";

export function useRealtimePrices() {
  useEffect(() => {
    const apiBase =
      process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

    const source = new EventSource(`${apiBase}/prices/stream`, {
      withCredentials: false,
    });

    source.onmessage = () => {
      // pesan default diabaikan, hook ini bisa diperluas untuk update state global
    };

    source.addEventListener("price_created", () => {
      // bisa men-trigger invalidasi React Query di sini melalui context jika dibutuhkan
    });

    source.onerror = () => {
      source.close();
    };

    return () => {
      source.close();
    };
  }, []);
}