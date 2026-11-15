# 🚄 Dashboard SCADA & Pemantauan Aset UPT Resor LAA 1.9 Jatinegara
### PT Kereta Api Indonesia (Persero) & Danantara Indonesia Sovereign Fund

Aplikasi Web Dashboard Fullstack modern untuk monitoring, kontrol operasional sakelar pemutus beban (*Disconnecting Switch* / DS), dan pemeliharaan prasarana **Listrik Aliran Atas (LAA / Catenary 1500 V DC)** wilayah **UPT Resor LAA 1.9 Jatinegara** (Lintas: Kramat / Manggarai — Jatinegara — Bekasi).

---

## 🌟 Fitur Utama

1. **Peta Skematik Interaktif LAA (Dual Mode)**:
   - **Mode Skematik Vektor Dinamis**: Render SVG interaktif dengan animasi aliran daya listrik traksi 1500 V DC, visualisasi warna jalur hulu (HI) & hilir (HU), kompleks jalur emplasemen St. Jatinegara & St. Bekasi (Jalur 1 - 8), titik wesel elektrik, Air Joint (AJ), Air Section (AS), dan FRP Isolator.
   - **Mode Dokumen Cetak Asli (High Resolution)**: Tampilan visual dokumen blueprint skematik asli dilengkapi pin hotspot interaktif dengan fungsi zoom dan pan bebas.
2. **Matriks Kontrol Pemutus Beban (DS 1 s/d DS 20)**:
   - Kontrol status sakelar *Normally Closed* (NC - Mengalir) dan *Normally Open* (NO - Terbuka/Isolasi).
   - Fitur proteksi keselamatan **Safety Interlock** (mencegah sakelar digeser saat terkunci perawatan).
   - Indikator telemetri per sakelar: Tegangan (V DC), Arus beban (Ampere), Suhu kontak pisau (°C), dan riwayat operator.
3. **Telemetri Gardu Traksi (Substations)**:
   - Monitoring live 4 Gardu Traksi utama:
     - **Gardu Traksi Jatinegara (GTR-JNG)** - KM 11+750
     - **Gardu Traksi Buaran (GTR-BUA)** - KM 17+500
     - **Gardu Traksi Cakung (GTR-CUK)** - KM 20+943
     - **Gardu Traksi Bekasi (GTR-BKS)** - KM 26+403
   - Parameter: Tegangan DC 1500V, Arus beban (A), Daya aktif (kW), Suhu trafo, Frekuensi input 50Hz, dan status feeder.
4. **Inventaris Aset & Isolator LAA**:
   - Filter & pencarian Air Joint (AJ), Air Section (AS), FRP Section Insulator, dan Seksi Rentangan (NASPAN 1 - 13).
5. **Log Perawatan & Pengoperasian (Maintenance Log)**:
   - Pencatatan tiket otomatis setiap terjadi perubahan posisi sakelar.
   - Formulir input manual untuk teknisi/petugas inspeksi di lapangan.
6. **Panel Alarm SCADA**:
   - Peringatan trip beban, anomali tegangan, dan tombol konfirmasi (*Acknowledge*).
7. **Keterangan & Simbol Teknik Resmi**:
   - Panduan simbol kelistrikan perkeretaapian LAA sesuai standar KAI.
8. **Unit Testing Jest Otomatis**:
   - 12 Unit test lengkap menguji seluruh endpoint API, operasi sakelar, proteksi interlock, dan database Prisma.

---

## 🏗️ Arsitektur Teknologi

- **Frontend**: React 19, Vite, Tailwind CSS v4, Lucide Icons.
- **Backend API**: Node.js, Express.js, CORS.
- **Database & ORM**: SQLite dengan Prisma ORM v6.
- **Testing**: Jest & Supertest.

---

## 💻 Panduan Menjalankan di Visual Studio Code (Langkah Demi Langkah)

### Prasyarat
Pastikan di komputer Anda telah terinstal:
- **Node.js** (versi 18 ke atas) & **npm** (cek dengan perintah `node -v` dan `npm -v`).
- **Visual Studio Code** (VS Code).
- **Git** (cek dengan `git --version`).

---

### Langkah 1: Buka Project di VS Code
1. Buka aplikasi **Visual Studio Code**.
2. Klik menu **File** > **Open Folder...** (atau tekan `Ctrl + K Ctrl + O`).
3. Pilih folder project:
   ```
   C:\Users\YOGA\.gemini\antigravity\scratch\laa-jatinegara-dashboard
   ```
4. Buka Terminal Terintegrasi di VS Code:
   - Tekan shortcut: `` Ctrl + ` `` (Backtick) atau melalui menu **Terminal** > **New Terminal**.

---

### Langkah 2: Install Dependensi & Setup Database

Jalankan perintah berikut di terminal VS Code:

#### Opsi Otomatis (Satu Perintah):
```powershell
npm run install:all
```

#### Opsi Manual (Per Folder):
1. Masuk ke folder backend dan install dependensi:
   ```powershell
   cd backend
   npm install
   ```

2. Jalankan migrasi Prisma dan seed database (mengisi 8 stasiun, 20 DS, AJ, AS, FRP, dan telemetri):
   ```powershell
   npx prisma generate
   npx prisma db push
   npm run seed
   ```

3. Masuk ke folder frontend dan install dependensi:
   ```powershell
   cd ../frontend
   npm install
   ```

---

### Langkah 3: Menjalankan Unit Testing (Jest)

Untuk memverifikasi seluruh endpoint backend dan logika sakelar:
```powershell
cd backend
npm test
```
*Hasil pengujian akan menampilkan 4 Test Suite & 12 Unit Test PASSED.*

---

### Langkah 4: Menjalankan Aplikasi

Buka dua tab terminal di VS Code (atau jalankan terpisah):

#### Terminal 1 — Menjalankan Backend API:
```powershell
cd backend
npm run dev
```
*Backend akan aktif di: `http://localhost:5000` (API: `http://localhost:5000/api`)*

#### Terminal 2 — Menjalankan Frontend Web:
```powershell
cd frontend
npm run dev
```
*Frontend akan aktif di: `http://localhost:3000` (atau port yang tertera di terminal).*

Buka browser Anda dan akses:
👉 **`http://localhost:3000`**

---

## 🚀 Panduan Meng-upload ke GitHub

Ikuti langkah-langkah mudah berikut untuk mengunggah project ini ke akun GitHub Anda:

### 1. Buat Repository Baru di GitHub
1. Buka peramban dan login ke akun [GitHub](https://github.com/).
2. Klik ikon **+** di pojok kanan atas, lalu pilih **New repository**.
3. Beri nama repository, misalnya: `laa-jatinegara-dashboard`.
4. Pilih opsi **Public** atau **Private**.
5. **Jangan centang** "Initialize this repository with a README" (karena project lokal kita sudah memiliki README dan Git).
6. Klik **Create repository**.
7. Salin URL repositori Anda, misalnya:
   `https://github.com/USERNAME_ANDA/laa-jatinegara-dashboard.git`

### 2. Hubungkan Repositori Lokal dan Push ke GitHub
Buka terminal VS Code di root project (`laa-jatinegara-dashboard`), lalu jalankan:

```powershell
# 1. Pastikan branch utama bernama main
git branch -M main

# 2. Tambahkan URL remote GitHub (ganti USERNAME_ANDA dengan username Anda)
git remote add origin https://github.com/USERNAME_ANDA/laa-jatinegara-dashboard.git

# 3. Unggah seluruh kode ke GitHub
git push -u origin main
```

Jika diminta autentikasi, lakukan login browser atau gunakan *Personal Access Token (PAT)* GitHub Anda. Repository Anda kini sudah online di GitHub!

---

## 📂 Struktur Direktori Project

```text
laa-jatinegara-dashboard/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma          # Model database SQLite (Station, Switch, Asset, Log, Alert, Telemetry)
│   │   ├── seed.js                # Data inisialisasi resmi LAA 1.9 (DS 1-20, Stasiun, Aset)
│   │   └── dev.db                 # Database SQLite lokal
│   ├── src/
│   │   ├── controllers/           # Logika bisnis (station, switch, telemetry, log, alert, stats)
│   │   ├── routes/api.js          # Routing REST API Express
│   │   ├── app.js                 # Konfigurasi Express & static file serving
│   │   ├── db.js                  # Koneksi Prisma Client
│   │   └── server.js              # Entry point backend server (Port 5000)
│   └── tests/                     # Unit test Jest & Supertest
│       ├── stations.test.js
│       ├── switches.test.js
│       ├── telemetry.test.js
│       └── logs.test.js
├── frontend/
│   ├── public/
│   │   ├── kai-logo.webp          # Logo resmi PT Kereta Api Indonesia
│   │   ├── danantara-logo.png     # Logo Danantara Indonesia Sovereign Fund
│   │   └── schematic-map-web.png  # Peta cetak resolusi tinggi UPT Resor LAA 1.9
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.jsx                 # Navigasi atas, jam real-time, status tegangan
│   │   │   ├── SchematicViewer.jsx        # Peta interaktif dual-mode (Vektor SVG & Asli)
│   │   │   ├── SwitchControlPanel.jsx     # Matriks kontrol 20 sakelar DS dengan interlocking
│   │   │   ├── TelemetryDashboard.jsx     # Pemantauan 4 Gardu Traksi 1500 V DC
│   │   │   ├── AssetListModal.jsx         # Daftar AJ, AS, FRP, dan Seksi
│   │   │   ├── MaintenanceLogModal.jsx    # Riwayat & input tiket pemeliharaan
│   │   │   ├── AlarmsPanel.jsx            # Panel notifikasi & konfirmasi alarm SCADA
│   │   │   ├── StationDetailModal.jsx     # Detail stasiun, peron, dan jalur
│   │   │   └── LegendGuide.jsx            # Keterangan simbol teknis resmi LAA
│   │   ├── services/api.js        # Klien pemanggil API backend
│   │   ├── App.jsx                # Komponen induk & auto-polling real-time
│   │   └── main.jsx
│   ├── index.html
│   └── vite.config.js
├── .gitignore
├── package.json                   # Script root monorepo
└── README.md                      # Dokumentasi & panduan lengkap
```

---

## 📡 Daftar Endpoint REST API Backend

| Metode | Endpoint | Deskripsi |
| :--- | :--- | :--- |
| `GET` | `/api/stats` | Statistik agregat sistem (Tegangan rata-rata, jumlah DS aktif, alarm) |
| `GET` | `/api/stations` | Daftar 8 stasiun (Pondok Jati s/d Bekasi) berserta detail jalur |
| `GET` | `/api/stations/:id` | Detail spesifik stasiun berdasarkan ID atau kode (mis. `JNG`, `BKS`) |
| `GET` | `/api/switches` | Daftar 20 Disconnecting Switches (DS 1 - DS 20) |
| `GET` | `/api/switches/:id` | Detail teknis pemutus beban spesifik |
| `PATCH`| `/api/switches/:id/toggle` | Mengalihkan status sakelar (NO ⟷ NC) & otomatis mencatat log |
| `PATCH`| `/api/switches/:id/interlock` | Mengunci / membuka fitur keselamatan Interlock |
| `GET` | `/api/assets` | Daftar Air Joint (AJ), Air Section (AS), dan FRP Isolator |
| `GET` | `/api/sections` | Daftar seksi rentangan kawat kontak (NASPAN 1 s/d 13) |
| `GET` | `/api/telemetry` | Data telemetri real-time 4 Gardu Traksi (Tegangan, Arus, Daya, Suhu) |
| `GET` | `/api/logs` | Riwayat log pengoperasian sakelar & pemeliharaan teknisi |
| `POST`| `/api/logs` | Membuat catatan tiket pemeliharaan baru |
| `GET` | `/api/alerts` | Daftar alarm dan notifikasi sistem SCADA |
| `PATCH`| `/api/alerts/:id/ack` | Mengonfirmasi (*Acknowledge*) alarm yang aktif |

---

## 📜 Hak Cipta & Lisensi
Dikembangkan untuk kebutuhan simulasi, pemantauan, dan manajemen aset kelistrikan **UPT Resor LAA 1.9 Jatinegara**, **PT Kereta Api Indonesia (Persero)** & **Danantara Indonesia Sovereign Fund**.
