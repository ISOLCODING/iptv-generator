# 📺 NobarTV PRO - IPTV Generator & Player

![NobarTV PRO](https://raw.githubusercontent.com/afasyazynex/iptv-generator/main/public/logo.png)

NobarTV PRO adalah platform streaming TV Indonesia modern yang menggabungkan kemudahan akses, tampilan mewah (Modern UI), dan performa tinggi menggunakan Next.js. Aplikasi ini tidak hanya berfungsi sebagai Web Player, tetapi juga sebagai **API-driven IPTV Generator** yang kompatibel dengan berbagai aplikasi pihak ketiga.

## ✨ Fitur Unggulan

- 💎 **Modern Luxury UI**: Desain mewah terinspirasi dari Vidio & Netflix menggunakan Framer Motion.
- 🚀 **Built on Next.js 15**: Performa super cepat dengan Server-side Rendering & API Routes.
- 📡 **Universal Proxy**: Melewati kendala CORS secara otomatis sehingga stream murni m3u8 bisa diputar di browser.
- 📲 **Multi-Platform Support**: Bisa digunakan di Browser, OTT Navigator, TiviMate, dan VLC.
- � **Auto-Sync**: Selalu sinkron dengan database IPTV-org untuk daftar channel terbaru.

---

## 🛠️ Cara Menggunakan di Aplikasi IPTV (TiviMate / OTT Navigator)

Sekarang Anda bisa menggunakan playlist NobarTV PRO langsung di aplikasi Android TV atau Smartphone favorit Anda.

### 🔗 URL Playlist Anda:
Gunakan URL di bawah ini untuk aplikasi IPTV Anda:

1. **Link Utama (Vercel - Dengan Proxy):**
   `https://nobartvgratis.afasya.com/api/playlist` (Terbaik untuk Browser/Web)

2. **Link Backup (GitHub - Statis):**
   `https://raw.githubusercontent.com/ISOLCODING/iptv-generator/master/playlist.m3u` (Terbaik untuk TiviMate/OTT Navigator)

### Langkah-langkah:
1.  Buka aplikasi **TiviMate**, **OTT Navigator**, atau **VLC**.
2.  Pilih **Add Playlist** atau **New Playlist**.
3.  Pilih tipe **M3U Playlist**.
4.  Masukkan salah satu URL di atas.
5.  Selesai! Daftar channel Indonesia akan otomatis muncul lengkap dengan Logo dan Kategori.

---

## �‍💻 Instalasi Lokal (Development)

Jika ingin menjalankan aplikasi ini di komputer sendiri:

1. **Clone repositori**:
   ```bash
   git clone https://github.com/usernamemu/iptv-generator.git
   cd iptv-generator/frontend
   ```

2. **Install dependensi**:
   ```bash
   npm install
   ```

3. **Jalankan aplikasi**:
   ```bash
   npm run dev
   ```

4. **Buka di browser**:
   Akses `http://localhost:3000`

---

## 🚀 Deployment ke Vercel

Aplikasi ini sudah dioptimalkan untuk Vercel (Serverless):

1. Hubungkan akun GitHub ke **Vercel**.
2. Pilih folder `frontend` sebagai Root Directory.
3. Klik **Deploy**.
4. Nikmati link streaming permanen Anda sendiri!

---

## 🛡️ Disclaimer
Aplikasi ini hanya alat bantu untuk mengumpulkan (agregator) link streaming yang tersedia secara publik di internet melalui API IPTV-org. Kami tidak menghosting konten video apapun di server kami. Segala hak cipta konten adalah milik masing-masing stasiun televisi.

---

**Developed with ❤️ by orangindo**
