"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { 
  ArrowLeft, 
  Upload, 
  Link as LinkIcon, 
  PlayCircle, 
  CheckCircle2, 
  XCircle, 
  Download,
  RefreshCcw,
  Trash2
} from "lucide-react";
import SEOFooter from "@/components/SEOFooter";

interface CheckerChannel {
  name: string;
  url: string;
  logo: string;
  group: string;
  status: 'idle' | 'checking' | 'online' | 'offline';
}

export default function CheckerPage() {
  const [inputType, setInputType] = useState<'url' | 'text'>('url');
  const [inputValue, setInputValue] = useState("");
  const [channels, setChannels] = useState<CheckerChannel[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [displayCount, setDisplayCount] = useState(100);
  
  const abortControllerRef = useRef<AbortController | null>(null);

  const parseM3u = (content: string) => {
    const lines = content.split('\n');
    const parsedChannels: CheckerChannel[] = [];
    let currentChannel: Partial<CheckerChannel> = {};

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.startsWith('#EXTINF:')) {
        // Match everything after the last comma as the name
        const nameMatch = line.match(/,([^,]+)$/);
        // More robust attribute matching
        const logoMatch = line.match(/tvg-logo="([^"]+)"/);
        const groupMatch = line.match(/group-title="([^"]+)"/);
        
        currentChannel = {
          name: nameMatch ? nameMatch[1].trim() : 'Unknown Channel',
          logo: logoMatch ? logoMatch[1] : '',
          group: groupMatch ? groupMatch[1] : 'Uncategorized',
          status: 'idle'
        };
      } else if (line && !line.startsWith('#') && line.startsWith('http')) {
        if (currentChannel.name) {
          currentChannel.url = line;
          parsedChannels.push(currentChannel as CheckerChannel);
          currentChannel = {};
        } else {
          // Fallback if no EXTINF is found before the URL
          parsedChannels.push({
            name: `Stream ${parsedChannels.length + 1}`,
            url: line,
            logo: '',
            group: 'Uncategorized',
            status: 'idle'
          });
        }
      }
    }
    return parsedChannels;
  };

  const handleProcess = async () => {
    if (!inputValue.trim()) return;
    setIsProcessing(true);
    setChannels([]);
    
    try {
      let parsed: CheckerChannel[] = [];
      if (inputType === 'url') {
        let fetchUrl = inputValue;
        // Check if it's a valid URL format
        if (!fetchUrl.startsWith('http')) {
          throw new Error("URL harus diawali dengan http:// atau https://");
        }
        
        // Use our proxy to bypass CORS, but request raw content so it doesn't rewrite URLs
        const proxyUrl = `/api/proxy?url=${encodeURIComponent(fetchUrl)}&raw=true`;
        const res = await fetch(proxyUrl);
        if (!res.ok) throw new Error("Gagal mengambil file dari URL");
        
        const text = await res.text();
        parsed = parseM3u(text);
      } else {
        parsed = parseM3u(inputValue);
      }

      if (parsed.length === 0) {
        throw new Error("Tidak ada channel yang ditemukan. Format M3U mungkin tidak standar.");
      }
      
      setDisplayCount(100);
      setChannels(parsed);
    } catch (error: any) {
      alert(`Gagal memproses M3U: ${error.message || "Pastikan URL atau format teks benar."}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCheckAll = async () => {
    if (channels.length === 0) return;
    if (isChecking) {
      abortControllerRef.current?.abort();
      setIsChecking(false);
      return;
    }

    setIsChecking(true);
    abortControllerRef.current = new AbortController();
    
    let currentChannels = [...channels];
    currentChannels.forEach(c => { if(c.status === 'idle') c.status = 'checking' });
    setChannels([...currentChannels]);

    // Fast UI Update interval (updates screen every 300ms instead of every single request)
    const uiInterval = setInterval(() => {
      setChannels([...currentChannels]);
    }, 300);

    // High-performance Concurrent Queue
    const MAX_CONCURRENT = 50; 
    let currentIndex = 0;

    const checkNext = async (): Promise<void> => {
      if (!isChecking || currentIndex >= currentChannels.length) return;
      const idx = currentIndex++;
      const channel = currentChannels[idx];
      
      try {
        const proxyUrl = `/api/proxy?url=${encodeURIComponent(channel.url)}`;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000); // 2 seconds strict timeout for "sat set" speed
        
        // Link external abort controller
        const abortHandler = () => controller.abort();
        abortControllerRef.current?.signal.addEventListener('abort', abortHandler);

        const res = await fetch(proxyUrl, { method: 'GET', signal: controller.signal });
        clearTimeout(timeoutId);
        abortControllerRef.current?.signal.removeEventListener('abort', abortHandler);

        currentChannels[idx] = { ...channel, status: res.ok ? 'online' : 'offline' };
      } catch {
        currentChannels[idx] = { ...channel, status: 'offline' };
      }

      // Automatically pull the next task
      return checkNext();
    };

    // Spawn workers
    const workers = [];
    for (let i = 0; i < MAX_CONCURRENT; i++) {
      workers.push(checkNext());
    }

    // Wait for all workers to finish their queues
    await Promise.all(workers);
    
    clearInterval(uiInterval);
    setChannels([...currentChannels]);
    setIsChecking(false);
  };

  const downloadActiveOnly = () => {
    const activeChannels = channels.filter(c => c.status === 'online');
    if (activeChannels.length === 0) return alert("Belum ada channel yang berstatus online!");
    
    let m3uContent = "#EXTM3U\n";
    activeChannels.forEach(c => {
      m3uContent += `#EXTINF:-1 tvg-logo="${c.logo}" group-title="${c.group}",${c.name}\n${c.url}\n`;
    });

    const blob = new Blob([m3uContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'nobartv-active.m3u';
    a.click();
    URL.revokeObjectURL(url);
  };

  const onlineCount = channels.filter(c => c.status === 'online').length;
  const offlineCount = channels.filter(c => c.status === 'offline').length;
  const checkingCount = channels.filter(c => c.status === 'checking').length;

  return (
    <main className="min-h-screen flex flex-col bg-[#f8fafc] text-slate-900 font-sans">
      <nav className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur-md border-b border-slate-200 flex items-center px-6 lg:px-12 h-20 shadow-sm">
        <Link href="/" className="flex items-center gap-2 text-slate-500 hover:text-blue-600 font-bold transition-all mr-8">
          <ArrowLeft className="w-5 h-5" /> Kembali
        </Link>
        <h1 className="text-xl font-black tracking-tight text-slate-800 border-l border-slate-300 pl-8">
          M3U <span className="text-blue-600">Checker</span>
        </h1>
      </nav>

      <div className="pt-28 px-4 lg:px-12 max-w-[1200px] mx-auto w-full pb-20">
        
        {/* Header section */}
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-black mb-4">Validasi Playlist M3U Anda</h2>
          <p className="text-slate-500 font-medium max-w-2xl mx-auto">
            Gunakan alat ini untuk mengecek status hidup/mati saluran dari playlist M3U custom milik Anda sebelum menontonnya secara langsung.
          </p>
        </div>

        {/* Input Card */}
        <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-200 mb-8">
          <div className="flex gap-4 border-b border-slate-100 pb-4 mb-6">
            <button 
              onClick={() => setInputType('url')}
              className={`flex items-center gap-2 font-bold pb-2 border-b-2 transition-all ${inputType === 'url' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
            >
              <LinkIcon className="w-4 h-4" /> URL Link
            </button>
            <button 
              onClick={() => setInputType('text')}
              className={`flex items-center gap-2 font-bold pb-2 border-b-2 transition-all ${inputType === 'text' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
            >
              <Upload className="w-4 h-4" /> Raw Text
            </button>
          </div>

          <div className="mb-6">
            {inputType === 'url' ? (
              <input 
                type="text" 
                placeholder="https://contoh.com/playlist.m3u" 
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-blue-500 text-slate-700 font-medium"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
              />
            ) : (
              <textarea 
                placeholder="#EXTM3U\n#EXTINF:-1, Channel 1\nhttp://link.com/stream.m3u8"
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-blue-500 text-slate-700 font-mono text-sm h-40 resize-none"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
              />
            )}
          </div>

          <div className="flex gap-4">
            <button 
              onClick={handleProcess}
              disabled={isProcessing || !inputValue.trim()}
              className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isProcessing ? <RefreshCcw className="w-5 h-5 animate-spin" /> : <PlayCircle className="w-5 h-5" />}
              {isProcessing ? 'Memproses...' : 'Proses M3U'}
            </button>
            <button 
              onClick={() => { setInputValue(""); setChannels([]); }}
              className="px-6 bg-red-50 text-red-600 font-bold rounded-xl hover:bg-red-100 transition-all flex items-center justify-center"
              title="Bersihkan"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Results Area */}
        {channels.length > 0 && (
          <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-200">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
              <div>
                <h3 className="text-xl font-black">Daftar Saluran ({channels.length})</h3>
                <div className="flex items-center gap-4 mt-2 text-sm font-medium">
                  <span className="flex items-center gap-1.5 text-green-600"><CheckCircle2 className="w-4 h-4" /> {onlineCount} Aktif</span>
                  <span className="flex items-center gap-1.5 text-red-500"><XCircle className="w-4 h-4" /> {offlineCount} Mati</span>
                  <span className="flex items-center gap-1.5 text-blue-500"><RefreshCcw className={`w-4 h-4 ${isChecking ? 'animate-spin' : ''}`} /> {checkingCount} Diproses</span>
                </div>
              </div>
              
              <div className="flex gap-3 w-full sm:w-auto">
                <button 
                  onClick={downloadActiveOnly}
                  disabled={onlineCount === 0}
                  className="flex-1 sm:flex-none px-4 py-2.5 bg-green-50 text-green-700 hover:bg-green-100 font-bold rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Download className="w-4 h-4" /> Unduh yang Aktif
                </button>
                <button 
                  onClick={handleCheckAll}
                  className={`flex-1 sm:flex-none px-6 py-2.5 font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 ${isChecking ? 'bg-amber-100 text-amber-700 shadow-amber-600/20' : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/20'}`}
                >
                  <RefreshCcw className={`w-4 h-4 ${isChecking ? 'animate-spin' : ''}`} />
                  {isChecking ? 'Stop' : 'Cek Status Semua'}
                </button>
              </div>
            </div>

            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
              {channels.slice(0, displayCount).map((c, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-4 overflow-hidden">
                    <div className="w-12 h-12 bg-white rounded-lg border border-slate-200 flex items-center justify-center overflow-hidden shrink-0">
                      {c.logo ? <img src={c.logo} alt="" className="max-w-full max-h-full object-contain p-1" /> : <PlayCircle className="w-5 h-5 text-slate-300" />}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-slate-800 truncate">{c.name}</h4>
                      <p className="text-xs text-slate-500 font-medium truncate">{c.group}</p>
                    </div>
                  </div>
                  
                  <div className="shrink-0 ml-4">
                    {c.status === 'idle' && <span className="px-3 py-1 bg-slate-200 text-slate-600 text-xs font-bold rounded-md">IDLE</span>}
                    {c.status === 'checking' && <span className="px-3 py-1 bg-blue-100 text-blue-600 text-xs font-bold rounded-md flex items-center gap-1"><RefreshCcw className="w-3 h-3 animate-spin" /> CEK</span>}
                    {c.status === 'online' && <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-md flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> ON</span>}
                    {c.status === 'offline' && <span className="px-3 py-1 bg-red-100 text-red-600 text-xs font-bold rounded-md flex items-center gap-1"><XCircle className="w-3 h-3" /> OFF</span>}
                  </div>
                </div>
              ))}
              
              {displayCount < channels.length && (
                <button 
                  onClick={() => setDisplayCount(prev => prev + 100)}
                  className="w-full py-4 mt-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-all"
                >
                  Tampilkan Lebih Banyak ({channels.length - displayCount} tersisa)
                </button>
              )}
            </div>
          </div>
        )}

      </div>

      <div className="mt-auto w-full">
        <SEOFooter />
      </div>
    </main>
  );
}
