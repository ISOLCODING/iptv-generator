export default function SEOFooter() {
  return (
    <footer className="bg-slate-900 text-slate-400 py-12 px-6 lg:px-20 border-t border-slate-800 mt-20">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <div>
          <h3 className="text-white font-bold text-lg mb-4">NobarTV PRO</h3>
          <p className="text-sm leading-relaxed">
            Platform streaming TV online Indonesia gratis dan terlengkap. Nikmati siaran langsung channel lokal favoritmu seperti RCTI, SCTV, Indosiar, Trans7, dan TransTV dengan kualitas HD tanpa buffering.
          </p>
        </div>
        <div>
          <h3 className="text-white font-bold text-lg mb-4">Channel Populer</h3>
          <ul className="space-y-2 text-sm">
            <li><a href="#" className="hover:text-blue-500 transition-colors">Nonton Garuda Live</a></li>
            <li><a href="#" className="hover:text-blue-500 transition-colors">Streaming Kompas</a></li>
            <li><a href="#" className="hover:text-blue-500 transition-colors">Tran7 Live</a></li>
            <li><a href="#" className="hover:text-blue-500 transition-colors">TransTV Live</a></li>
            <li><a href="#" className="hover:text-blue-500 transition-colors">MNCTV Live</a></li>
          </ul>
        </div>
        <div>
          <h3 className="text-white font-bold text-lg mb-4">Kategori</h3>
          <ul className="space-y-2 text-sm">
            <li><a href="#" className="hover:text-blue-500 transition-colors">TV Nasional</a></li>
            <li><a href="#" className="hover:text-blue-500 transition-colors">Berita & News</a></li>
            <li><a href="#" className="hover:text-blue-500 transition-colors">Olahraga & Sport</a></li>
            <li><a href="#" className="hover:text-blue-500 transition-colors">Film & Hiburan</a></li>
            <li><a href="#" className="hover:text-blue-500 transition-colors">Kartun & Anak</a></li>
          </ul>
        </div>
        <div>
          <h3 className="text-white font-bold text-lg mb-4">Tentang Kami</h3>
          <p className="text-sm leading-relaxed mb-4">
            Kami menyediakan layanan IPTV gratis untuk masyarakat Indonesia. Website ini dioptimalkan untuk akses cepat dan ringan di semua perangkat.
          </p>
          <span className="text-xs text-slate-600">© 2024 NobarTV PRO. All rights reserved.</span>
        </div>
      </div>
    </footer>
  );
}
