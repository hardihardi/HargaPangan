# Pangan API

Backend utama untuk manajemen data wilayah, komoditas, harga harian, prediksi harga, user management, dan laporan.

## Menjalankan API

```bash
cd apps/api
pnpm install           # atau jalankan di root: pnpm install
pnpm prisma:generate
pnpm prisma:migrate    # pertama kali, akan membuat tabel
pnpm prisma:seed       # mengisi data awal provinsi, kabupaten/kota, komoditas, dan user
pnpm dev
```

API akan berjalan di `http://localhost:4000` (lihat `.env.example`).

Endpoint utama (prefix `/api`):

- `POST /api/auth/login` – login dan mendapatkan access + refresh token.
- `POST /api/auth/refresh` – refresh access token.
- `GET /api/dashboard/summary` – ringkasan KPI dashboard.
- `GET /api/regions/provinces` – CRUD provinsi.
- `GET /api/regions/regencies` – CRUD kabupaten/kota.
- `GET /api/commodities` – CRUD komoditas.
- `GET /api/prices/daily` – listing harga harian dengan filter.
- `POST /api/prices/daily` – input manual harga harian.
- `POST /api/prices/predictions/generate` – generate dan simpan prediksi harga dengan memanggil ML service.
- `GET /api/models/active` – metrik model aktif.
- `POST /api/models/train` – train ulang model.
- `GET /api/reports/weekly` / `GET /api/reports/monthly` – generate laporan PDF / Excel.

Lihat kode di folder `src/` untuk detail skema dan service layer.