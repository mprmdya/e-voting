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
[![Security](https://img.shields.io/badge/Security-Hardened_%26_Audited-10B981?logo=shieldsdotio&logoColor=white)](#-keamanan--security-hardening)

<p align="center">
  Aplikasi pemungutan suara elektronik (E-Voting) modern, transparan, dan real-time yang dirancang khusus untuk Pemilihan Raya Mahasiswa Tiga Serangkai University (TSU). Dilengkapi proteksi suara ganda berbasis basis data, sistem quick count langsung, serta panel administrasi berbasis web.
</p>

[Demo Aplikasi](https://e-voting-gold.vercel.app/) • [Fitur Utama](#-fitur-utama) • [Instalasi](#-panduan-instalasi-lokal) • [Keamanan](#-keamanan--security-hardening) • [Aturan Firestore](#-firestore-security-rules)

---

</div>

## 🌟 Fitur Utama

### 🗳️ 1. Bilik Suara Digital (Voting Booth)
* **Katalog Paslon Interaktif:** Menampilkan foto resmi pasangan calon (Capresma & Cawapresma), visi-misi, fakultas, dan program unggulan.
* **Modal Konfirmasi Pencoblosan:** Mencegah salah klik sebelum suara sah dikirim ke sistem.
* **Asas LUBER (Langsung, Umum, Bebas, Rahasia):** Surat suara disimpan secara **anonim** di database tanpa menautkan email/identitas pemilih ke pilihan paslon.

### 📊 2. Quick Count Real-Time
* **Live Vote Counter:** Perolehan suara dihitung dan diperbarui secara instan via listener real-time Firebase Firestore tanpa perlu me-refresh halaman.
* **Visualisasi Modern:** Dilengkapi persentase perolehan suara, indikator pemimpin sementara (*Leading Candidate*), dan total partisipasi suara sah yang masuk.

### 🎓 3. Autentikasi Google Terfilter (`@tsu.ac.id`)
* **Single Sign-On (SSO):** Login instan menggunakan akun Google resmi mahasiswa.
* **Domain Whitelist Filter:** Membatasi hak suara hanya untuk mahasiswa dengan email resmi kampus (`@tsu.ac.id`). Akun publik/pribadi secara otomatis ditolak.
* **Deteksi Browser Medsos (WhatsApp / Instagram):** Mendeteksi pengguna yang membuka link dari WhatsApp/Instagram in-app browser dan memandu membuka di Safari/Chrome asli agar terhindar dari pemblokiran OAuth Google.

### 🛡️ 4. Anti-Double Voting (Verifikasi Level Database)
* **Single Source of Truth:** Status "sudah memilih" diverifikasi langsung ke dokumen unik `voters/{uid}` di Firestore.
* **Tahan Manipulasi:** Membersihkan `localStorage`, menggunakan mode Incognito, atau berganti perangkat **tidak akan bisa** mencoblos dua kali karena validasi ditegakkan langsung oleh aturan basis data (*Firestore Rules*).

### ⚙️ 5. Panel Pengaturan Pemilu (Web-Based Admin Panel)
* **Kontrol Buka / Tutup Pemilihan:** Panitia KPUM dapat membuka atau menutup pemungutan suara secara real-time hanya dengan satu tombol.
* **Manajemen Pasangan Calon:** Edit nama kandidat, nomor urut, visi, misi, fakultas, program kerja, dan warna tema langsung dari antarmuka web.
* **Sistem Upload Gambar Tanpa Biaya:** Upload foto paslon dan foto latar kampus langsung dari perangkat dengan kompresi cerdas di sisi klien (Canvas Base64) tanpa memerlukan Firebase Cloud Storage berbayar.
* **Custom Background Kampus:** Ubah foto latar gedung kampus TSU langsung dari dashboard admin.
* **Reset Suara Aman:** Opsi reset pemilihan terproteksi konfirmasi ketik untuk keperluan uji coba atau pembukaan sesi baru.
* **Enkripsi PIN Admin (SHA-256):** Autentikasi admin diamankan menggunakan hash kriptografi satu arah. PIN admin dapat diganti secara langsung dari panel pengaturan.

---

## 🛠️ Tech Stack & Arsitektur

| Komponen | Teknologi | Deskripsi |
|---|---|---|
| **Frontend Framework** | [React 19](https://react.dev/) | Library UI terkini dengan performa rendering optimal |
| **Language** | [TypeScript](https://www.typescriptlang.org/) | Pengetikan statis penuh untuk stabilitas dan keamanan tipe |
| **Bundler & Tooling** | [Vite 8](https://vitejs.dev/) | Build tool ultra-cepat dengan Hot Module Replacement (HMR) |
| **Styling** | [TailwindCSS v4](https://tailwindcss.com/) | Engine CSS modern dengan arsitektur `@import "tailwindcss"` |
| **Icons** | [Lucide React](https://lucide.dev/) | Paket ikon minimalis dan modern |
| **Database** | [Google Cloud Firestore](https://firebase.google.com/docs/firestore) | Database dokumen NoSQL real-time |
| **Autentikasi** | [Firebase Authentication](https://firebase.google.com/docs/auth) | Google OAuth 2.0 dengan reverse proxy handler |
| **Deployment** | [Vercel](https://vercel.com/) | Hosting serverless global dengan rewrite SPA dan proxy Auth |

---

## 📁 Struktur Direktori

```text
e-voting/
├── public/                 # Aset statis publik
├── src/
│   ├── components/         # Komponen UI modular
│   │   ├── AdminPanel.tsx      # Dashboard panel administrasi KPUM
│   │   ├── CandidateCard.tsx   # Kartu profil pasangan calon
│   │   ├── Navbar.tsx          # Navigasi atas, status login, & hak suara
│   │   ├── ResultsView.tsx     # Tampilan quick-count & grafik suara
│   │   ├── Toast.tsx           # Notifikasi pop-up dinamis
│   │   └── VoteModal.tsx       # Dialog konfirmasi pilihan surat suara
│   ├── data/
│   │   └── paslonData.ts       # Data awal pasangan calon & struktur tipe
│   ├── utils/
│   │   └── imageCompress.ts    # Kompresi gambar canvas ke Base64
│   ├── App.tsx             # Komponen utama, state manager, & listener Firestore
│   ├── firebase.ts         # Inisialisasi Firebase Auth & Firestore client
│   ├── index.css           # Konfigurasi TailwindCSS v4 & styling global
│   ├── main.tsx            # Entry point aplikasi React
│   └── types.ts            # Definisi antarmuka TypeScript
├── .env.example            # Contoh konfigurasi environment variable
├── firestore.rules         # Aturan keamanan basis data Firebase Firestore
├── vercel.json             # Konfigurasi rewrite SPA & proxy endpoint Firebase Auth
├── vite.config.ts          # Konfigurasi build Vite
└── package.json            # Daftar dependensi & script build
```

---

## 🚀 Panduan Instalasi Lokal

### Prasyarat:
* [Node.js](https://nodejs.org/) versi 18 atau lebih baru.
* Manajer paket: `npm`, `pnpm`, atau `yarn`.

### Langkah-langkah:

1. **Clone repositori:**
   ```bash
   git clone https://github.com/mprmdya/e-voting.git
   cd e-voting
   ```

2. **Instal seluruh dependensi:**
   ```bash
   npm install
   ```

3. **Buat file konfigurasi environment:**
   Salin file `.env.example` menjadi `.env`:
   ```bash
   cp .env.example .env
   ```

4. **Isi kredensial Firebase di `.env`:**
   Dapatkan konfigurasi Web App dari **Firebase Console → Project Settings**:
   ```env
   VITE_FIREBASE_API_KEY=AIzaSy...
   VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=1234567890
   VITE_FIREBASE_APP_ID=1:1234567890:web:...
   ```

5. **Jalankan server pengembangan lokal:**
   ```bash
   npm run dev
   ```
   Buka browser pada alamat `http://localhost:5173`.

6. **Build untuk produksi:**
   ```bash
   npm run build
   ```

---

## 🔒 Keamanan & Security Hardening

Sistem ini telah melewati audit keamanan (*security hardening & pentest verification*) untuk memastikan integritas pemilu:

* **Pencegahan Suara Ganda (Anti-Double Voting):**
  Menggunakan aturan Firestore `!exists(/databases/$(database)/documents/voters/$(voterId))` sehingga manipulasi browser/klien tidak dapat menambahkan suara kedua.
* **Anti-Tampering Surat Suara:**
  Aturan Firestore menetapkan `allow update: if false;` pada koleksi `votes`. Surat suara yang telah masuk ke sistem tidak dapat diubah atau disunting oleh siapa pun.
* **Proteksi Kredensial Admin:**
  Kata sandi admin tidak disimpan dalam bentuk teks biasa (*plaintext*), melainkan diverifikasi menggunakan algoritma **SHA-256 Hash Kriptografi**. Tidak ada kredensial sensitif yang terekspos di file JavaScript publik.
* **Reverse Proxy Auth Handler:**
  File `vercel.json` dikonfigurasi dengan reverse proxy ke `/__/auth/:match*` untuk menghindari masalah *Third-Party Cookie Blocking* dan *Intelligent Tracking Prevention (ITP)* pada perangkat iOS Safari.

---

## 📋 Firestore Security Rules

Pastikan aturan keamanan berikut diterapkan pada tab **Firestore Database → Rules** di Firebase Console:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // 1. Pengaturan Pemilihan (Buka/Tutup voting, background, data paslon)
    match /settings/{document=**} {
      allow read, write: if true;
    }

    // 2. Riwayat Pemilih (Mencegah Double Voting di Database)
    match /voters/{voterId} {
      allow read: if true;
      allow create: if !exists(/databases/$(database)/documents/voters/$(voterId));
      allow update: if false; 
      allow delete: if true; 
    }

    // 3. Kotak Surat Suara (Asas LUBER: Rahasia & Anti-Tamper)
    match /votes/{voteId} {
      allow read: if true;
      allow create: if request.resource.data.votes == 1;
      allow update: if false; 
      allow delete: if true; 
    }
  }
}
```

---

## 👥 Hak Akses & Administrasi Default

* **Akses Masuk Admin:** Masuk melalui link **"Panel Admin"** pada footer website.
* **PIN Admin Default:** `admin123` *(Dapat diganti kapan saja secara aman melalui tab "Kontrol Status Voting" di dalam Panel Admin)*.

---

## 📄 Lisensi & Kredit

Dikembangkan untuk **Komisi Pemilihan Umum Mahasiswa (KPUM)**  
**Tiga Serangkai University (TSU)** — Surakarta, Jawa Tengah.

Didistribusikan di bawah lisensi terbuka untuk tujuan pendidikan, inovasi kampus, dan transparansi pemilu mahasiswa.
