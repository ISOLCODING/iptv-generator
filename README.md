# IPTV Playlist Generator 🇮🇩

Tool sederhana berbasis Node.js untuk membuat playlist IPTV (`.m3u`) saluran TV Indonesia secara otomatis menggunakan data dari [IPTV-Org](https://github.com/iptv-org/api).

## 🚀 Fitur Utama

- **Otomatis & Terupdate**: Mengambil daftar saluran terbaru langsung dari API publik IPTV-Org.
- **Lengkap**: Berisi ratusan saluran TV Indonesia (Nasional, Lokal, dan Khusus).
- **Format Standar**: Menghasilkan file `.m3u` yang kompatibel dengan berbagai player (VLC, TiviMate, OTT Navigator, Kodi, dll).
- **Header Khusus**: Mendukung `User-Agent` dan `Referer` untuk kompatibilitas stream yang lebih baik.

## 📋 Prasyarat

Sebelum memulai, pastikan komputer Anda sudah terinstal:

1.  **Node.js**: Unduh dan instal versi terbaru dari [nodejs.org](https://nodejs.org/).
2.  **Git**: (Opsional) Untuk mengelola kode sumber.

## 🛠️ Cara Penggunaan

### 1. Instalasi

Salin repositori ini ke komputer Anda dan masuk ke foldernya:

```bash
git clone https://github.com/ISOCODING/iptv-generator.git
cd iptv-generator
```

Instal dependensi yang diperlukan:

```bash
npm install
```

### 2. Membuat Playlist

Jalankan perintah berikut untuk menghasilkan file `playlist.m3u`:

```bash
node generate.js
```

Jika berhasil, Anda akan melihat pesan seperti ini:
```
[Generator] Starting playlist generation from IPTV-Org API...
[Antigravity] Fetching channels for country: ID...
[Antigravity] Found 380 channels for ID.
[Antigravity] Fetching streams...
...
[Generator] Success! Playlist saved with 380 channels.
```

### 3. Menggunakan Playlist

File `playlist.m3u` akan muncul di folder proyek. Anda bisa menggunakannya dengan cara:

*   **Lokal**: Buka file `playlist.m3u` langsung di **VLC Media Player**.
*   **Online (GitHub Pages)**:
    1.  Push perubahan ke repository GitHub Anda.
    2.  Aktifkan GitHub Pages di pengaturan repository.
    3.  Akses playlist via URL:
        ```
        https://<USERNAME_GITHUB>.github.io/<NAMA_REPO>/playlist.m3u
        ```
    4.  Masukkan URL tersebut ke aplikasi IPTV di HP atau TV Anda.

## 📺 Daftar Saluran

Playlist yang dihasilkan mencakup berbagai kategori:
- **Nasional**: TVRI, RCTI, SCTV, Indosiar, Trans7, TransTV, dll.
- **Berita**: Metro TV, TVOne, Kompas TV, CNN Indonesia, CNBC Indonesia.
- **Lokal**: JTV, Bali TV, Bandung TV, dan banyak TV daerah lainnya.
- **Religi**: Rodja TV, TV Muhammadiyah, dll.

## ⚠️ Penafian (Disclaimer)

Proyek ini hanya **mengagregasi tautan** yang tersedia secara publik di internet melalui API IPTV-Org.
- **Ketersediaan**: Saluran mungkin tidak selalu aktif tergantung dari sumber aslinya.
- **Hak Cipta**: Hak cipta konten sepenuhnya milik penyiar masing-masing.

## 📄 Lisensi

MIT
