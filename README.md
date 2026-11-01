# 🌱 Tumbuh V2 — Gamified Habit Tracker

> **"Start small. Water daily. Grow consistently."**  
> *Aplikasi pelacak kebiasaan (habit tracker) berbasis web responsif dengan metafora visual pertumbuhan tanaman dan sistem gamifikasi terintegrasi.*

[![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-24.x-339933?logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.19-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-5.18-2D3748?logo=prisma&logoColor=white)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-17-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Playwright](https://img.shields.io/badge/Playwright-Tested-2EAD33?logo=playwright&logoColor=white)](https://playwright.dev/)

---

## 📌 Ringkasan Proyek

**Tumbuh V2** adalah evolusi dari prototipe Tumbuh V1. Tumbuh dirancang khusus untuk membantu pengguna (terutama usia 16–30 tahun) membangun rutinitas positif secara konsisten tanpa rasa stres atau cemas (*anxiety-free & zero-guilt*).

Tidak seperti aplikasi habit tracker konvensional yang kaku dan menghukum pengguna saat melewatkan hari, Tumbuh menggunakan **prinsip non-punitive**:
- Tanaman Anda **tidak akan pernah mati atau layu** hanya karena hari terlewat.
- Setiap check-in dirayakan sebagai tindakan **"Menyiram Tanaman"** dengan umpan balik instan (+10 XP) dan pertumbuhan visual tanaman 2D SVG yang memanjakan mata.

---

## ✨ Fitur-Fitur Utama

### 1. 🎮 Core Gamification Engine
- **Instant Experience Points (XP):** Mendapatkan +10 XP seketika setiap kali menyiram tanaman (check-in harian).
- **Sistem Level & Gelar Pekebun:** Akumulasi XP meningkatkan level pengguna secara bertahap (mulai dari *Penyemai Benih*, *Penyiram Rajin*, hingga tingkatan master).
- **Lemari Trofi & Lencana Prestasi (Badges):** Koleksi 9 lencana prestasi unik dengan aturan berbasis event (misal: *Streak 5 Hari*, *Tetesan Pertama*, *Kebun Asri*, dll.) lengkap dengan bonus XP.

### 2. 🌿 Morfologi Pertumbuhan Tanaman Berkelanjutan
Visual tanaman berbasis **100% Client-Side GPU (SVG & Hardware-Accelerated CSS)** tanpa membebani server:
- **Bibit (SEED):** 0–2 hari penyiraman.
- **Tunas (SPROUT):** 3–6 hari penyiraman.
- **Rindang (GROWING):** 7–29 hari penyiraman dengan dedaunan lebat.
- **Mekar & Berbunga Progresif (BLOOM):** $\ge$ 30 hari penyiraman. Tanaman terus berkembang menumbuhkan cabang baru dan memekarkan hingga **maksimal 5 kuntum bunga** disertai kilau keemasan (*golden sparkles*) pada penyiraman ke-38+.

### 3. 🛡️ Filosofi Non-Punitive & Pemulihan Suportif
- **Zero-Guilt Approach:** Tidak ada penalti pengurangan level atau kematian tanaman.
- **Supportive Recovery View:** Dialog pemulihan yang hangat saat kebiasaan terlewat, memberikan motivasi untuk melanjutkan tanpa rasa bersalah.
- **In-App Smart Banner:** Sapaan re-engagement yang kontekstual dan empati.

### 4. ⏰ Pengingat Harian & Web Browser Notification
- Integrasi native **Web Notification API** dan **Web Audio API** untuk membunyikan lonceng lembut dan mengirimkan notifikasi browser sesuai jadwal pengingat per kebiasaan (`HH:MM`).
- Banner peringatan interaktif di dalam aplikasi ketika jam pengingat tiba.

### 5. 📅 Riwayat Mingguan Kalender Lokal
- Strip indikator 7 hari (Senin–Minggu) di setiap kartu kebiasaan untuk memantau konsistensi mingguan secara intuitif.

### 6. 🗄️ Manajemen Kebun Lengkap (Full CRUD & Archive)
- Tanam kebiasaan baru, edit nama, kategori, jadwal pengingat, serta arsipkan atau pulihkan (*restore*) tanaman kapan saja.

---

## 🏛️ Arsitektur Sistem

Sistem mengadopsi arsitektur *decoupled client-server* dengan integritas data tingkat tinggi:

```mermaid
graph TD
    subgraph Client ["Client Tier (Browser - React 18 SPA)"]
        UI["React 18 Component UI (Vite)"]
        SVG["GPU-Accelerated SVG Plants & Animations"]
    end

    subgraph Server ["Application Tier (Node.js + Express API)"]
        Router["Express Router (/api/*)"]
        HabitService["Habit & Plant Engine"]
        GamificationService["Gamification & Badge Rule Evaluator"]
        Prisma["Prisma ORM Client"]
    end

    subgraph Storage ["Database Tier"]
        Postgres[("PostgreSQL 17 (Port 5433)")]
    end

    UI -->|REST API via Fetch / CORS| Router
    Router --> HabitService & GamificationService
    HabitService & GamificationService --> Prisma
    Prisma -->|ACID Transactions| Postgres
```

- **Client Tier (`Code/frontend`):** React 18 SPA berbasis Vite pada port `5173`. 
- **Application Tier (`Code/backend`):** Node.js Express API berbasis TypeScript pada port `8000`.
- **Database Tier:** PostgreSQL 17 pada port `5433` (`tumbuh_v2_db`) dengan *ACID guarantees* dan *idempotency protection* untuk seluruh mutasi XP dan check-in.

---

## 📂 Struktur Direktori Proyek

```text
/data/apps/tumbuh/
├── Architecture/               # Dokumentasi Arsitektur Perangkat Lunak Lengkap
│   └── Arc_tumbuh_v2.md
├── Code/
│   ├── backend/                # Layanan REST API Backend (Express + Prisma)
│   │   ├── prisma/             # Schema Prisma & Migrations
│   │   │   └── schema.prisma
│   │   ├── src/                # Kode Sumber Backend (TypeScript)
│   │   │   ├── index.ts        # Entry Point Express Server
│   │   │   ├── routes/         # Endpoint Routing (/api/habits, /api/profile, etc.)
│   │   │   ├── services/       # Business Logic (Gamification, Streak, Badge Engine)
│   │   │   └── seed.ts         # Seeder Database Awal
│   │   └── tests/              # Unit Test Suite
│   └── frontend/               # Single Page Application Frontend (React 18 + Vite)
│       ├── public/             # Static Assets
│       ├── src/
│       │   ├── components/     # Komponen UI (PlantIllustration, HabitCard, Modals, dll.)
│       │   ├── App.tsx         # Root Application Component
│       │   └── index.css       # Design System & SVG Animation Keyframes
│       ├── run_playwright_test.cjs # Automated E2E Browser Test Suite
│       └── vite.config.ts
├── PRD/                        # Product Requirements Document
│   ├── PRD_tumbuh_v2.md
│   └── tumbuh_v1.md
├── SAD/                        # Software Architecture Document
│   └── SAD_tumbuh_v2.md
├── TestDocumentation/          # Laporan Resmi Pengujian Sistem (Playwright)
│   └── Test_Report_Tumbuh_v2.md
├── .gitignore                  # Git Ignore Konfigurasi (node_modules, .env, dist)
└── README.md                   # Dokumentasi Utama Proyek
```

---

## 🚀 Panduan Memulai (Getting Started)

### Prasyarat Sistem
- **Node.js:** Versi $\ge$ 20.x (disarankan v24 LTS)
- **PostgreSQL:** Versi 17 (port default proyek: `5433`)
- **Package Manager:** `npm`

---

### 1. Konfigurasi Backend

Masuk ke folder backend:
```bash
cd /data/apps/tumbuh/Code/backend
```

Salin atau buat file `.env`:
```env
PORT=8000
DATABASE_URL="postgresql://postgres:PASSWORD@localhost:5433/tumbuh_v2_db?schema=public"
```

Instal dependensi dan jalankan migrasi database:
```bash
# Instal dependensi
npm install

# Generate Prisma Client & Sync Database Schema
npx prisma generate
npx prisma db push

# (Opsional) Jalankan data awal / seed
npm run prisma:seed
```

Jalankan server backend (mode dev):
```bash
npm run dev
```
Backend akan berjalan di `http://localhost:8000`.

---

### 2. Konfigurasi Frontend

Buka terminal baru dan masuk ke folder frontend:
```bash
cd /data/apps/tumbuh/Code/frontend
```

Instal dependensi:
```bash
npm install
```

Jalankan frontend dalam mode development:
```bash
npm run dev
```
Aplikasi dapat diakses melalui browser di `http://localhost:5173`.

---

## 🧪 Pengujian Otomatis (E2E & Unit Testing)

Tumbuh V2 telah diuji secara menyeluruh menggunakan **Playwright Core Chromium Headless**:
- **Total Skenario:** 20 Skenario End-to-End
- **Tingkat Kelulusan (Pass Rate):** **100% (20 PASS / 0 FAIL)**
- **Cakupan Pengujian:**
  1. Header Gamifikasi & Perhitungan XP
  2. Transaksi Penyiraman & Proteksi Idempotensi
  3. Simulasi Siklus Hidup Morfologi Tanaman (Bibit $\rightarrow$ Tunas $\rightarrow$ Rindang $\rightarrow$ Bunga Mekar)
  4. Aturan Pembukaan 9 Lencana Prestasi & Kenaikan Level
  5. Web Browser Notification API & Audio Chime
  6. Manajemen Sub-menu Kebun Aktif & Arsip Kebun

Jalankan pengujian Playwright:
```bash
cd /data/apps/tumbuh/Code/frontend
node run_playwright_test.cjs
```
Laporan lengkap tersedia di [Test_Report_Tumbuh_v2.md](TestDocumentation/Test_Report_Tumbuh_v2.md).

---

## 📖 Dokumentasi Lengkap

Dokumentasi teknis dan bisnis komprehensif dapat dipelajari pada berkas:
- 📄 **[Product Requirements Document (PRD)](PRD/PRD_tumbuh_v2.md)**
- 📐 **[Software Architecture Document (SAD)](SAD/SAD_tumbuh_v2.md)**
- 🏗️ **[Detailed System Architecture](Architecture/Arc_tumbuh_v2.md)**
- 📊 **[Playwright Test Report](TestDocumentation/Test_Report_Tumbuh_v2.md)**

---

## 👤 Tim & Kontributor

- **Ide Produk:** Fawwaz Al Mujahid
- **System Architect:** Abu Aisyah (fredynepra)
- **Pengembang (Author):** [Abu Aisyah (fredynepra)](https://github.com/fredynepra)
- **Email:** fredy.nepra@gmail.com
- **Project:** Tumbuh Habit Tracker V2

*Dibuat dengan dedikasi untuk mendukung pembiasaan positif yang menyenangkan dan berkelanjutan.* 🌱

