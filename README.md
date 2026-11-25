<div align="center">

# 🗳️ PEMIRA TSU — Sistem E-Voting Mahasiswa
### Pemilihan Raya Presiden & Wakil Presiden Mahasiswa
**Tiga Serangkai University (TSU) — Surakarta, Indonesia**

[![React](https://img.shields.io/badge/React-19.0-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8.3-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Firebase](https://img.shields.io/badge/Firebase-Firestore_%26_Auth-FFCA28?logo=firebase&logoColor=black)](https://firebase.google.com/)
[![Vercel](https://img.shields.io/badge/Deploy-Vercel-000000?logo=vercel&logoColor=white)](https://vercel.com/)
[![Security](https://img.shields.io/badge/Security-Hardened-10B981?logo=shieldsdotio&logoColor=white)](#-keamanan--integritas-sistem)

<p align="center">
  Aplikasi pemungutan suara elektronik (E-Voting) modern, transparan, dan real-time yang dirancang khusus untuk Pemilihan Raya Mahasiswa Tiga Serangkai University (TSU). Dilengkapi proteksi suara ganda berbasis basis data, sistem quick count langsung, serta panel administrasi KPUM.
</p>

[Fitur Utama](#-fitur-utama) • [Tech Stack](#-tech-stack--arsitektur) • [Instalasi Lokal](#-panduan-instalasi-lokal) • [Keamanan](#-keamanan--integritas-sistem)

---

</div>

## 🌟 Fitur Utama

### 🗳️ 1. Bilik Suara Digital (Voting Booth)
- **Katalog Paslon Interaktif:** Menampilkan profil resmi pasangan calon (Capresma & Cawapresma), visi-misi, fakultas, dan program unggulan.
- **Modal Konfirmasi Pencoblosan:** Mencegah kesalahan pemilihan sebelum suara sah dikirim ke sistem.
- **Asas LUBER (Langsung, Umum, Bebas, Rahasia):** Surat suara disimpan secara terpisah dan anonim tanpa menautkan identitas pemilih ke pilihan kandidat.

### 📊 2. Quick Count Real-Time
- **Live Vote Counter:** Perolehan suara dihitung dan diperbarui secara instan melalui koneksi real-time basis data tanpa perlu memuat ulang halaman.
- **Visualisasi Hasil:** Dilengkapi persentase perolehan suara, indikator perolehan tertinggi sementara, dan total partisipasi suara sah.

### 🎓 3. Autentikasi Google Terfilter (`@tsu.ac.id`)
- **Single Sign-On (SSO):** Login instan menggunakan akun Google resmi mahasiswa.
- **Domain Whitelist Filter:** Membatasi hak suara secara ketat hanya untuk mahasiswa aktif dengan domain email resmi kampus (`@tsu.ac.id`).
- **Deteksi In-App Browser:** Mendeteksi akses dari browser bawaan media sosial (WhatsApp/Instagram) dan mengarahkan pengguna ke browser utama (Chrome/Safari) demi kelancaran proses autentikasi.

### 🛡️ 4. Anti-Double Voting (Validasi Server-Side)
- **Single Source of Truth:** Status partisipasi pemilih diverifikasi langsung pada level aturan basis data.
- **Tahan Manipulasi Klien:** Membersihkan cache browser, menggunakan mode Incognito, atau berganti perangkat tidak memungkinkan pemilih memberikan suara lebih dari satu kali.

### ⚙️ 5. Panel Administrasi KPUM
- **Kontrol Sesi Pemilihan:** Panitia dapat membuka atau menutup akses pemungutan suara secara real-time.
- **Manajemen Data Kandidat:** Pengelolaan profil paslon, nomor urut, visi-misi, program kerja, serta aset visual secara dinamis.
- **Manajemen Sesi & Keamanan:** Dilengkapi proteksi konfirmasi berlapis untuk fitur reset uji coba dan pembaruan kredensial administrator.

---

## 🛠️ Tech Stack & Arsitektur

| Komponen | Teknologi | Deskripsi |
|---|---|---|
| **Frontend Framework** | [React 19](https://react.dev/) | Library UI modern dengan performa rendering optimal |
| **Language** | [TypeScript](https://www.typescriptlang.org/) | Pengetikan statis penuh untuk stabilitas kode |
| **Bundler & Tooling** | [Vite 8](https://vitejs.dev/) | Build tool cepat dengan Hot Module Replacement (HMR) |
| **Styling** | [TailwindCSS v4](https://tailwindcss.com/) | Engine CSS utilitas modern |
| **Icons** | [Lucide React](https://lucide.dev/) | Paket ikon antarmuka minimalis |
| **Database** | [Google Cloud Firestore](https://firebase.google.com/docs/firestore) | Basis data dokumen NoSQL real-time |
| **Autentikasi** | [Firebase Authentication](https://firebase.google.com/docs/auth) | Google OAuth 2.0 dengan domain restriction |
| **Deployment** | [Vercel](https://vercel.com/) | Hosting serverless dengan konfigurasi SPA rewrite |

---

## 📁 Struktur Direktori

```text
e-voting/
├── public/                 # Aset statis publik
├── src/
│   ├── components/         # Komponen antarmuka modular (Bilik Suara, Quick Count, Admin)
│   ├── data/               # Struktur data awal kandidat
│   ├── utils/              # Utilitas pemrosesan aset & validasi
│   ├── App.tsx             # Root komponen & manajemen state utama
│   ├── firebase.ts         # Konfigurasi klien layanan autentikasi & database
│   ├── index.css           # Konfigurasi styling global
│   ├── main.tsx            # Entry point aplikasi
│   └── types.ts            # Definisi tipe TypeScript
├── .env.example            # Template variabel lingkungan (environment variables)
├── firestore.rules         # Konfigurasi aturan akses basis data (privat/internal)
├── vercel.json             # Konfigurasi routing & reverse proxy deployment
├── vite.config.ts          # Konfigurasi bundler
└── package.json            # Daftar dependensi & skrip build
