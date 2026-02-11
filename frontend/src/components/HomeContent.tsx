"use client";

import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "@vidstack/react/player/styles/base.css";
import "@vidstack/react/player/styles/default/theme.css";
import "@vidstack/react/player/styles/default/layouts/video.css";
import { MediaPlayer, MediaProvider } from "@vidstack/react";
import { DefaultVideoLayout, defaultLayoutIcons } from "@vidstack/react/player/layouts/default";
import {
  Search,
  MonitorPlay,
  X,
  RefreshCcw,
  Heart,
  History,
  Tv,
  Menu,
  Play,
  ChevronRight,
  Info,
  Minimize2,
  Maximize2
} from "lucide-react"; 

interface Channel {
  id: string;
  name: string;
  logo: string;
  group: string;
  url: string;
  userAgent?: string;
  referrer?: string;
}

export default function HomeContent() {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [history, setHistory] = useState<string[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);

  // --- Persistence ---
  useEffect(() => {
    try {
      const savedFavs = localStorage.getItem("favorites");
      if (savedFavs) setFavorites(JSON.parse(savedFavs));

      const savedHistory = localStorage.getItem("history");
      if (savedHistory) setHistory(JSON.parse(savedHistory));
    } catch (e) {
      console.error("Failed to load local storage", e);
    }
  }, []);

  const toggleFavorite = (e: React.MouseEvent, channelId: string) => {
    e.stopPropagation();
    let newFavs;
    if (favorites.includes(channelId)) {
      newFavs = favorites.filter(id => id !== channelId);
    } else {
      newFavs = [...favorites, channelId];
    }
    setFavorites(newFavs);
    localStorage.setItem("favorites", JSON.stringify(newFavs));
  };

  const addToHistory = (channelId: string) => {
    const newHistory = [channelId, ...history.filter(id => id !== channelId)].slice(0, 20);
    setHistory(newHistory);
    localStorage.setItem("history", JSON.stringify(newHistory));
  };

  // --- Parsing M3U ---
  const parseM3U = (content: string): Channel[] => {
    const lines = content.split('\n');
    const result: Channel[] = [];
    let currentItem: Partial<Channel> = {};

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
      if (line.startsWith('#EXTINF:')) {
            const tvgId = line.match(/tvg-id="([^"]*)"/)?.[1];
            const tvgName = line.match(/tvg-name="([^"]*)"/)?.[1];
            const tvgLogo = line.match(/tvg-logo="([^"]*)"/)?.[1];
            const group = line.match(/group-title="([^"]*)"/)?.[1];
            const name = line.split(',').pop()?.trim() || "Unknown Channel";

            currentItem = {
                id: tvgId || `ch-${i}`,
                name: tvgName || name,
                logo: tvgLogo || "",
                group: group || 'Uncategorized',
            };
      } else if (line && !line.startsWith('#')) {
            if (currentItem.name) {
                currentItem.url = line;
                result.push(currentItem as Channel);
              currentItem = {}; 
            }
        }
    }
    return result;
  };

  const fetchChannels = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/playlist");
      if (!res.ok) throw new Error(`Failed to fetch: ${res.statusText}`);
      
      const text = await res.text();
      const parsedChannels = parseM3U(text);

      const uniqueMap = new Map();
      parsedChannels.forEach(ch => {
        const normalizeName = ch.name.toLowerCase().trim();
        if (!uniqueMap.has(normalizeName)) uniqueMap.set(normalizeName, ch);
      });
      const uniqueChannels = Array.from(uniqueMap.values()) as Channel[];
      uniqueChannels.sort((a, b) => a.name.localeCompare(b.name));
      
      setChannels(uniqueChannels);
    } catch (error) {
      console.error("Failed to fetch channels", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChannels();
  }, []);

  // --- Derived State ---
  const categories = useMemo(() => {
    const groups = Array.from(new Set(channels.map((c) => c.group || "Uncategorized"))).sort();
    return ["All", "Favorites", "Recent", ...groups];
  }, [channels]);

  const filteredChannels = useMemo(() => {
    let result = channels;
    if (selectedCategory === "Favorites") {
      result = result.filter(c => favorites.includes(c.id));
    } else if (selectedCategory === "Recent") {
      result = result.filter(c => history.includes(c.id));
      result.sort((a, b) => history.indexOf(a.id) - history.indexOf(b.id));
    } else if (selectedCategory !== "All") {
      result = result.filter((c) => c.group === selectedCategory);
    }
    if (search) {
      result = result.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()));
    }
    return result;
  }, [channels, selectedCategory, search, favorites, history]);

  const handleChannelSelect = (channel: Channel) => {
    setSelectedChannel(channel);
    addToHistory(channel.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <main className="min-h-screen bg-background text-slate-900 selection:bg-blue-600/30">

      {/* Dynamic Glass Navbar */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="fixed top-0 w-full z-50 glass-sidebar flex items-center px-4 lg:px-10 h-20 justify-between transition-all duration-300"
      >
        <div className="flex items-center gap-6">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2.5 hover:bg-slate-100 rounded-xl transition-all active:scale-95"
          >
            <Menu className="w-6 h-6 text-slate-600" />
          </button>

          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => window.location.reload()}
          >
            <div className="relative w-10 h-10">
              <div className="absolute inset-0 bg-blue-600 blur-lg opacity-20 group-hover:opacity-50 transition-opacity"></div>
              <img src="/logo.png" alt="Logo" className="relative w-full h-full object-contain logo-glow" />
            </div>
            <h1 className="text-2xl font-black tracking-tighter text-slate-900">
              NobarTV<span className="text-blue-600">PRO</span>
            </h1>
          </motion.div>
        </div>

        <div className="flex items-center gap-6">
          <div className="relative hidden md:block w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text" 
              placeholder="Cari hiburanmu di sini..."
              className="w-full bg-slate-100 border border-slate-200 rounded-2xl py-3 pl-11 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:bg-white transition-all placeholder:text-slate-500 text-slate-800"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button onClick={fetchChannels} className="p-3 hover:bg-slate-100 rounded-full transition active:rotate-180 duration-500">
            <RefreshCcw className={`w-5 h-5 text-slate-500 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </motion.nav>

      <div className="flex pt-20 h-screen overflow-hidden">
        
        {/* Modern Sidebar */}
        <AnimatePresence mode="wait">
          {isSidebarOpen && (
            <motion.aside
              initial={{ x: -300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -300, opacity: 0 }}
              className="fixed lg:relative z-40 inset-y-0 w-80 glass-sidebar flex flex-col"
            >
              <div className="p-6 flex-1 overflow-y-auto custom-scrollbar">
                <div className="space-y-8">
                  {/* Quick Filters */}
                  <div>
                    <h2 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4 ml-2">Exploration</h2>
                    <div className="space-y-1.5">
                      {[
                        { id: 'All', icon: Tv, label: 'Semua Channel' },
                        { id: 'Favorites', icon: Heart, label: 'Favorit Saya' },
                        { id: 'Recent', icon: History, label: 'Baru Diputar' }
                      ].map(cat => (
                        <button
                          key={cat.id}
                          onClick={() => setSelectedCategory(cat.id)}
                          className={`w-full group flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all
                            ${selectedCategory === cat.id
                              ? "bg-blue-600 shadow-lg shadow-blue-600/20 text-white"
                              : "text-slate-500 hover:bg-slate-100/50 hover:text-slate-900"}`}
                        >
                          <div className="flex items-center gap-3">
                            <cat.icon className={`w-5 h-5 ${selectedCategory === cat.id ? "text-white" : "group-hover:text-blue-600 transition-colors"}`} />
                            <span className="text-sm font-semibold">{cat.label}</span>
                          </div>
                          <ChevronRight className={`w-4 h-4 opacity-0 group-hover:opacity-100 transition-all ${selectedCategory === cat.id ? 'opacity-100' : ''}`} />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Dynamic Categories */}
                  <div>
                    <h2 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4 ml-2">Kategori</h2>
                    <div className="grid grid-cols-1 gap-1.5">
                      {categories.filter(c => !['All', 'Favorites', 'Recent'].includes(c)).map((cat) => (
                        <button
                          key={cat}
                          onClick={() => setSelectedCategory(cat)}
                          className={`text-left px-5 py-3 rounded-2xl text-sm transition-all truncate font-medium
                                ${selectedCategory === cat
                              ? "bg-blue-50 text-blue-700 border-l-4 border-blue-600 pl-4 font-bold"
                              : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"}`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Content Explorer */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-10 custom-scrollbar pb-32">

          <AnimatePresence mode="wait">
            {selectedChannel ? (
              <motion.div
                key="player"
                initial={false}
                layout
                className={`transition-all duration-300 ${isMinimized ? 'minimized-player' : 'mb-12'}`}
              >
                <div className={`relative group overflow-hidden bg-black shadow-2xl ring-1 ring-white/10 ${isMinimized ? 'h-full w-full' : 'rounded-[2.5rem] aspect-video lg:aspect-21/9'}`}>
                  <MediaPlayer 
                    title={selectedChannel.name} 
                    src={{ src: selectedChannel.url, type: 'application/x-mpegurl' }}
                    aspectRatio="16/9"
                    load="eager"
                    autoPlay
                    crossOrigin="anonymous"
                    className="w-full h-full"
                    key={selectedChannel.id}
                  >
                    <MediaProvider />
                    <DefaultVideoLayout icons={defaultLayoutIcons} />
                  </MediaPlayer>

                  {!isMinimized && (
                    <div className="absolute top-8 left-8 flex gap-3 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="bg-blue-600 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest flex items-center gap-2 text-white">
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                        Live
                      </span>
                    </div>
                  )}

                  <div className="absolute top-4 right-4 lg:top-8 lg:right-8 flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => { e.stopPropagation(); setIsMinimized(!isMinimized); }}
                      className="p-3 bg-black/40 hover:bg-blue-600 transition-all rounded-full backdrop-blur-xl border border-white/10 text-white"
                      title={isMinimized ? "Maximize" : "Minimize"}
                    >
                      {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => { setSelectedChannel(null); setIsMinimized(false); }}
                      className="p-3 bg-black/40 hover:bg-slate-700 transition-all rounded-full backdrop-blur-xl border border-white/10 text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {!isMinimized && (
                  <div className="mt-8 flex flex-wrap items-center justify-between gap-6 px-4">
                    <div className="flex items-center gap-6">
                      <motion.img
                        initial={{ rotate: -10, opacity: 0 }}
                        animate={{ rotate: 0, opacity: 1 }}
                        src={selectedChannel.logo || "/logo.png"}
                        className="w-20 h-20 object-contain p-3 bg-white rounded-3xl border border-slate-100 shadow-xl"
                      />
                      <div>
                        <h2 className="text-4xl font-black mb-2 tracking-tight text-slate-800">{selectedChannel.name}</h2>
                        <div className="flex items-center gap-3 text-slate-500">
                          <span className="text-sm font-bold px-3 py-1 bg-slate-100 rounded-lg border border-slate-200">{selectedChannel.group}</span>
                          <div className="w-1 h-1 rounded-full bg-slate-300"></div>
                          <span className="text-xs flex items-center gap-1.5"><Play className="w-3 h-3 fill-current" /> Sedang Streaming</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <button
                        onClick={(e) => toggleFavorite(e, selectedChannel.id)}
                        className={`p-4 rounded-2xl transition-all shadow-xl
                            ${favorites.includes(selectedChannel.id)
                            ? "bg-blue-600 text-white shadow-blue-600/30"
                            : "bg-white hover:bg-slate-50 border border-slate-100 text-slate-400 hover:text-blue-600"}`}
                      >
                        <Heart className={`w-6 h-6 ${favorites.includes(selectedChannel.id) ? "fill-current" : ""}`} />
                      </button>
                      <button className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-3 hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20">
                        <Info className="w-5 h-5" /> Detail
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            ) : (
              /* Spotlight / Hero like Vidio */
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative w-full h-[400px] mb-12 rounded-[3rem] overflow-hidden group cursor-pointer"
                >
                  <img src="https://images.unsplash.com/photo-1593784991095-a205069470b6?auto=format&fit=crop&q=80&w=2000" className="absolute inset-0 w-full h-full object-cover scale-105 group-hover:scale-100 transition-transform duration-1000" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent" />
                  <div className="absolute bottom-12 left-6 lg:left-12 max-w-2xl px-4 lg:px-0">
                    <h2 className="text-4xl lg:text-6xl font-black mb-4 tracking-tighter leading-tight text-white">Nonton TV Sat Gak Pake Ribet.</h2>
                    <p className="text-lg lg:text-xl text-slate-200 mb-8 font-medium">Banyak channel lokal dan internasional terbanyak di kelasnya. Cobain NobarTV PRO sekarang!</p>
                    <div className="flex gap-4">
                      <button className="bg-blue-600 hover:bg-blue-700 px-10 py-4 rounded-2xl font-black flex items-center gap-3 transition-all shadow-2xl shadow-blue-600/30 text-white">
                        <MonitorPlay className="w-6 h-6" /> MULAI NONTON
                      </button>
                    </div>
                  </div>
                </motion.div>
            )}
          </AnimatePresence>

          {/* Channels Grid Section */}
          <div className="flex items-center justify-between mb-8 px-2">
            <div>
              <h2 className="text-2xl font-black flex items-center gap-3 tracking-tight lowercase first-letter:uppercase">
                <span className="w-2 h-8 bg-blue-600 rounded-full"></span>
                {selectedCategory} <span className="text-slate-400 font-medium tracking-normal text-lg">({filteredChannels.length})</span>
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-8">
             {loading ? (
                [...Array(10)].map((_, i) => (
                  <div key={i} className="aspect-video rounded-[2.5rem] bg-slate-100 animate-pulse border border-slate-200" />
                ))
             ) : (
                filteredChannels.map((channel, idx) => (
                  <motion.div 
                    key={channel.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      type: "spring",
                      stiffness: 260,
                      damping: 20,
                      delay: Math.min(idx * 0.05, 0.5)
                    }}
                    onClick={() => handleChannelSelect(channel)}
                    className="group premium-card relative aspect-video rounded-[2.5rem] cursor-pointer"
                  >
                    {/* Channel Thumbnail/Logo */}
                    <div className="absolute inset-0 flex items-center justify-center p-8 lg:p-12 bg-white transition-all duration-700">
                       {channel.logo ? (
                        <img
                          src={channel.logo}
                          alt={channel.name}
                          className="w-full h-full object-contain filter grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700"
                        />
                       ) : (
                          <span className="text-5xl font-black text-slate-100 group-hover:text-blue-600/20 transition-colors uppercase">{channel.name.substring(0, 2)}</span>
                       )}
                    </div>
                    
                    {/* Hover UI */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />

                    <div className="absolute top-6 right-6 z-10 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-2 group-hover:translate-y-0">
                      <button
                        onClick={(e) => toggleFavorite(e, channel.id)}
                        className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-2xl text-white hover:bg-blue-600 transition-all active:scale-90"
                      >
                        <Heart className={`w-5 h-5 ${favorites.includes(channel.id) ? "fill-current" : ""}`} />
                      </button>
                    </div>

                    <div className="absolute bottom-0 left-0 w-full p-8 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                      <div className="flex items-center gap-2 mb-2 opacity-0 group-hover:opacity-100 transition-all delay-100">
                        <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
                        <span className="text-[10px] font-black uppercase tracking-widest text-blue-400">Streaming Sekarang</span>
                      </div>
                      <h3 className="text-xl font-bold text-white truncate group-hover:text-blue-400 transition-colors">{channel.name}</h3>
                      <p className="text-xs text-slate-300 font-medium">{channel.group}</p>
                    </div>

                    <div className="absolute inset-x-0 bottom-0 h-1 bg-blue-600 scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-700" />
                  </motion.div>
                ))
             )}
          </div>
          
          {/* Empty State */}
          {!loading && filteredChannels.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-40 bg-slate-50 rounded-[4rem] border border-slate-200 border-dashed"
            >
              <div className="w-24 h-24 bg-blue-600/10 rounded-full flex items-center justify-center mb-6">
                <MonitorPlay className="w-12 h-12 text-blue-600" />
              </div>
              <h3 className="text-2xl font-black text-slate-400 mb-2">Gak ada channel-nya :(</h3>
              <p className="text-slate-500 font-medium">Coba ganti kategori atau kata kunci pencarianmu.</p>
            </motion.div>
          )}

        </div>
      </div>
    </main>
  );
}
