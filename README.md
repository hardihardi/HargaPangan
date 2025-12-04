# Pangan Insight Monorepo

Monorepo untuk aplikasi prediksi harga bahan pangan di Indonesia.

## Struktur

- `apps/web` – Frontend dashboard (Next.js + React Router + Tailwind CSS).
- `apps/api` – Backend REST API (Node.js + Express + Prisma + PostgreSQL).
- `apps/ml-service` – Microservice Machine Learning (FastAPI + scikit-learn).
- `apps/docs` – Dokumentasi (Next.js).
- `packages/ui` – Komponen UI bersama.
- `packages/eslint-config` – Konfigurasi ESLint.
- `packages/typescript-config` – Konfigurasi TypeScript bersama.

## Menjalankan Secara Lokal

1. **Install dependensi JS**

```bash
pnpm install
```

2. **Siapkan database PostgreSQL**

Buat database misalnya `pangan_db` dan set `DATABASE_URL` di `apps/api/.env` (lihat `.env.example`).

3. **Migrasi & seed database**

```bash
cd apps/api
pnpm prisma:generate
pnpm prisma:migrate
pnpm prisma:seed
```

4. **Jalankan ML Service (Python)**

```bash
cd apps/ml-service
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 5000
```

5. **Jalankan API Node.js**

```bash
cd apps/api
pnpm dev
# API tersedia di http://localhost:4000
```

6. **Jalankan Frontend Dashboard**

```bash
cd apps/web
# set NEXT_PUBLIC_API_URL=http://localhost:4000/api pada .env.local
pnpm dev
# Web tersedia di http://localhost:3000
```

## Fitur Utama

- Manajemen wilayah: provinsi dan kabupaten/kota (CRUD, filter, pencarian).
- Manajemen komoditas dan status aktif/nonaktif.
- Input harga manual, rencana import CSV/Excel, dan integrasi API eksternal.
- Prediksi harga berdasarkan wilayah, komoditas, dan horizon waktu.
- Dashboard KPI, tren harga nasional, dan alert lonjakan harga.
- Manajemen model ML (training, metrik, dan riwayat).
- Manajemen pengguna dan role (Admin, Analis, Viewer).
- Laporan mingguan/bulanan dalam format PDF dan Excel.
