import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-white font-sans p-6 text-center">
      <h1 className="text-8xl font-black text-blue-500 mb-4 drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]">404</h1>
      <h2 className="text-3xl font-bold mb-4">Waduh, Halaman Tidak Ditemukan!</h2>
      <p className="text-slate-400 max-w-md mb-8">
        Sepertinya Anda tersesat atau channel yang Anda cari sudah dipindahkan. Yuk, kembali ke halaman utama untuk mulai menonton TV online gratis.
      </p>
      <Link 
        href="/" 
        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-600/30 transition-all hover:scale-105 active:scale-95"
      >
        Kembali ke Beranda
      </Link>
    </div>
  );
}
