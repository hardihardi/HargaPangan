"use client";

import axios from "axios";

const baseURL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

export const apiClient = axios.create({
  baseURL,
  withCredentials: false,
});

// Sisipkan header Authorization jika token tersimpan di localStorage
apiClient.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = window.localStorage.getItem("pangan-access-token");
    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      };
    }
  }
  return config;
});