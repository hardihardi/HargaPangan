# Pangan Insight Web

Frontend dashboard untuk monitoring dan prediksi harga bahan pangan nasional.

## Stack

- Next.js (React + TypeScript).
- React Router (SPA) di dalam halaman utama.
- Tailwind CSS (dark mode default, toggle light mode).
- Recharts untuk grafik.
- React Query untuk data fetching dan caching.

## Menjalankan

```bash
cd apps/web
pnpm install        # atau dari root monorepo
pnpm dev
```

Aplikasi akan berjalan di `http://localhost:3000`.

Konfigurasi API backend:

- Set variabel `NEXT_PUBLIC_API_URL` pada file `.env.local`, contoh:

```bash
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

Kemudian jalankan juga:

- API Node.js di `apps/api`.
- ML Service FastAPI di `apps/ml-service`.
