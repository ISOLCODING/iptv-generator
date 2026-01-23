# IPTV Playlist Generator 🇮🇩 (V2)

Tool canggih berbasis Node.js untuk membuat playlist IPTV (`.m3u`) saluran TV Indonesia. Versi ini menggabungkan data otomatis dari [IPTV-Org](https://github.com/iptv-org/api) dengan daftar kurasi manual untuk saluran-saluran populer yang membutuhkan penanganan khusus.

## 🚀 Fitur V2

- **Double-Source Strategy**:
    1.  **Otomatis (IPTV-Org)**: Mengambil semua saluran ID publik yang tersedia di database global (13.000+ streams, ~180 saluran ID aktif).
    2.  **Manual (Custom)**: Menyediakan link langsung untuk saluran premium/nasional yang sering hilang dari database publik.
- **Support EPG**: Mengintegrasikan data jadwal acara (Electronic Program Guide) jika tersedia.
- **Header Injection**: Menambahkan `User-Agent` dan `Referer` otomatis agar stream berjalan lancar di player seperti TiviMate/VLC.

## 📋 Prasyarat

1.  **Node.js**: Unduh dan instal [nodejs.org](https://nodejs.org/).
2.  **Git**: Untuk clone repository.

## 🛠️ Cara Penggunaan

### 1. Instalasi

```bash
git clone https://github.com/ISOCODING/iptv-generator.git
cd iptv-generator
npm install
```

### 2. Generate Playlist

Jalankan script utama:

```bash
node generate.js
```

Hasilnya adalah file `playlist.m3u` yang berisi gabungan saluran dari semua sumber.

### 3. Cara Nonton

Gunakan link **Raw** dari file `playlist.m3u` di GitHub Anda setelah melakukan push:
```
https://raw.githubusercontent.com/<USERNAME>/iptv-generator/master/playlist.m3u
```
Atau aktifkan **GitHub Pages** di settings repository untuk link yang lebih stabil.

## 📺 Daftar Saluran Unggulan (Updated)

Berikut adalah beberapa saluran utama yang sudah dikurasi dan diperbaiki link streaming-nya di versi ini:

| Kategori | Saluran | Status |
| :--- | :--- | :--- |
| **TransMedia** | Trans 7, Trans TV, CNN Indonesia, CNBC Indonesia | ✅ Aktif (HD) |
| **VIVA** | ANTV, tvOne | ✅ Aktif |
| **Media Group** | Metro TV, Magna Channel, BN Channel | ✅ Aktif |
| **Lainnya** | Kompas TV, RTV, TVRI Nasional, Mentari TV | ✅ Aktif |
| **Emtek** | SCTV, Indosiar, Moji | ⚠️ Terbatas (Vidio Exclusive) |

*Catatan: Saluran Emtek (SCTV/Indosiar) sangat ketat dengan token keamanan. Link statis mungkin sering berubah/mati.*

## ⚠️ Disclaimer

Aplikasi ini hanya **mengagregasi tautan** yang tersedia secara publik di internet. Kami tidak menghosting konten apapun. Ketersediaan saluran sepenuhnya tergantung pada penyedia layanan streaming aslinya.

## 📄 Lisensi

MIT
