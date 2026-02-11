"use client";

import dynamic from 'next/dynamic';
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
  Radio,
  Menu,
  Play,
  Star,
  ChevronRight,
  Info
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

function HomeContent() {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [history, setHistory] = useState<string[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // --- Persistence ---
  useEffect(() => {
    const savedFavs = localStorage.getItem("favorites");
    if (savedFavs) setFavorites(JSON.parse(savedFavs));

    const savedHistory = localStorage.getItem("history");
    if (savedHistory) setHistory(JSON.parse(savedHistory));
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

  // --- Animation Variants ---
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  } as const;

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 260,
        damping: 20
      }
    }
  } as const;

  return (
    <main className="min-h-screen bg-background text-white selection:bg-red-600/50">

      {/* Dynamic Glass Navbar */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="fixed top-0 w-full z-50 glass-sidebar flex items-center px-4 lg:px-10 h-20 justify-between"
      >
        <div className="flex items-center gap-6">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2.5 hover:bg-white/5 rounded-xl transition-all active:scale-95"
          >
            <Menu className="w-6 h-6 text-gray-300" />
          </button>

          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => window.location.reload()}
          >
            <div className="relative w-10 h-10">
              <div className="absolute inset-0 bg-red-600 blur-lg opacity-40 group-hover:opacity-100 transition-opacity"></div>
              <img src="/logo.png" alt="Logo" className="relative w-full h-full object-contain logo-glow" />
            </div>
            <h1 className="text-2xl font-black tracking-tighter">
              NobarTV<span className="text-red-600">PRO</span>
            </h1>
          </motion.div>
        </div>

        <div className="flex items-center gap-6">
          <div className="relative hidden md:block w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text" 
              placeholder="Cari hiburanmu di sini..."
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-11 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-red-600/50 focus:bg-white/10 transition-all placeholder:text-gray-600"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button onClick={fetchChannels} className="p-3 hover:bg-white/5 rounded-full transition active:rotate-180 duration-500">
            <RefreshCcw className={`w-5 h-5 text-gray-400 ${loading ? 'animate-spin' : ''}`} />
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
                    <h2 className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-4 ml-2">Exploration</h2>
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
                              ? "bg-red-600 shadow-lg shadow-red-600/20 text-white"
                              : "text-gray-400 hover:bg-white/5 hover:text-white"}`}
                        >
                          <div className="flex items-center gap-3">
                            <cat.icon className={`w-5 h-5 ${selectedCategory === cat.id ? "text-white" : "group-hover:text-red-500 transition-colors"}`} />
                            <span className="text-sm font-semibold">{cat.label}</span>
                          </div>
                          <ChevronRight className={`w-4 h-4 opacity-0 group-hover:opacity-100 transition-all ${selectedCategory === cat.id ? 'opacity-100' : ''}`} />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Dynamic Categories */}
                  <div>
                    <h2 className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-4 ml-2">Kategori</h2>
                    <div className="grid grid-cols-1 gap-1.5">
                      {categories.filter(c => !['All', 'Favorites', 'Recent'].includes(c)).map((cat) => (
                        <button
                          key={cat}
                          onClick={() => setSelectedCategory(cat)}
                          className={`text-left px-5 py-3 rounded-2xl text-sm transition-all truncate font-medium
                                ${selectedCategory === cat
                              ? "bg-white/10 text-white border-l-4 border-red-600 pl-4"
                              : "text-gray-500 hover:text-gray-300 hover:bg-white/5"}`}
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
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="mb-12"
              >
                <div className="relative group rounded-[2.5rem] overflow-hidden bg-black shadow-2xl ring-1 ring-white/10 aspect-video lg:aspect-21/9">
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

                  <div className="absolute top-8 left-8 flex gap-3 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="bg-red-600 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                      Live
                    </span>
                  </div>

                  <button
                    onClick={() => setSelectedChannel(null)}
                    className="absolute top-8 right-8 p-3 bg-black/40 hover:bg-red-600 transition-all rounded-full backdrop-blur-xl border border-white/10"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="mt-8 flex flex-wrap items-center justify-between gap-6 px-4">
                  <div className="flex items-center gap-6">
                    <motion.img
                      initial={{ rotate: -10, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      src={selectedChannel.logo || "/logo.png"}
                      className="w-20 h-20 object-contain p-3 bg-white/5 rounded-3xl border border-white/10 shadow-2xl"
                    />
                    <div>
                      <h2 className="text-4xl font-black mb-2 tracking-tight">{selectedChannel.name}</h2>
                      <div className="flex items-center gap-3 text-gray-400">
                        <span className="text-sm font-bold px-3 py-1 bg-white/5 rounded-lg border border-white/10">{selectedChannel.group}</span>
                        <div className="w-1 h-1 rounded-full bg-gray-600"></div>
                        <span className="text-xs flex items-center gap-1.5"><Play className="w-3 h-3 fill-current" /> Sedang Streaming</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <button
                      onClick={(e) => toggleFavorite(e, selectedChannel.id)}
                      className={`p-4 rounded-2xl transition-all shadow-xl
                          ${favorites.includes(selectedChannel.id)
                          ? "bg-red-600 text-white shadow-red-600/30"
                          : "bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 hover:text-white"}`}
                    >
                      <Heart className={`w-6 h-6 ${favorites.includes(selectedChannel.id) ? "fill-current" : ""}`} />
                    </button>
                    <button className="bg-white text-black px-8 py-4 rounded-2xl font-bold flex items-center gap-3 hover:bg-gray-200 transition-all">
                      <Info className="w-5 h-5" /> Detail
                    </button>
                  </div>
                </div>
              </motion.div>
            ) : (
              /* Spotlight / Hero like Vidio */
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative w-full h-[400px] mb-12 rounded-[3rem] overflow-hidden group cursor-pointer"
                >
                  <img src="https://images.unsplash.com/photo-1593784991095-a205069470b6?auto=format&fit=crop&q=80&w=2000" className="absolute inset-0 w-full h-full object-cover scale-105 group-hover:scale-100 transition-transform duration-1000" />
                  <div className="absolute inset-0 bg-linear-to-t from-background via-background/40 to-transparent" />
                  <div className="absolute bottom-12 left-12 max-w-2xl">
                    <h2 className="text-6xl font-black mb-4 tracking-tighter leading-tight">Nonton TV Sat Gak Pake Ribet.</h2>
                    <p className="text-xl text-gray-300 mb-8 font-medium">Banyak channel lokal dan internasional terbanyak di kelasnya. Cobain NobarTV PRO sekarang!</p>
                    <div className="flex gap-4">
                      <button className="bg-red-600 hover:bg-red-700 px-10 py-4 rounded-2xl font-black flex items-center gap-3 transition-all shadow-2xl shadow-red-600/30">
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
                <span className="w-2 h-8 bg-red-600 rounded-full"></span>
                {selectedCategory} <span className="text-gray-600 font-medium tracking-normal text-lg">({filteredChannels.length})</span>
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-5 gap-8">
             {loading ? (
                [...Array(10)].map((_, i) => (
                  <div key={i} className="aspect-video rounded-[2.5rem] bg-white/5 animate-pulse" />
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
                    <div className="absolute inset-0 flex items-center justify-center p-12 bg-[#050505] transition-all duration-700">
                       {channel.logo ? (
                        <img
                          src={channel.logo}
                          alt={channel.name}
                          className="w-full h-full object-contain filter grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-700"
                        />
                       ) : (
                          <span className="text-5xl font-black text-white/10 group-hover:text-red-600/40 transition-colors uppercase">{channel.name.substring(0, 2)}</span>
                       )}
                    </div>
                    
                    {/* Hover UI */}
                    <div className="absolute inset-0 bg-linear-to-t from-black via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />

                    <div className="absolute top-6 right-6 z-10 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-2 group-hover:translate-y-0">
                      <button
                        onClick={(e) => toggleFavorite(e, channel.id)}
                        className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-2xl text-white hover:bg-red-600 transition-all active:scale-90"
                      >
                        <Heart className={`w-5 h-5 ${favorites.includes(channel.id) ? "fill-current" : ""}`} />
                      </button>
                    </div>

                    <div className="absolute bottom-0 left-0 w-full p-8 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                      <div className="flex items-center gap-2 mb-2 opacity-0 group-hover:opacity-100 transition-all delay-100">
                        <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span>
                        <span className="text-[10px] font-black uppercase tracking-widest text-red-500">Streaming Sekarang</span>
                      </div>
                      <h3 className="text-xl font-bold text-white truncate group-hover:text-red-500 transition-colors">{channel.name}</h3>
                      <p className="text-xs text-gray-500 font-medium group-hover:text-gray-300 transition-colors">{channel.group}</p>
                    </div>

                    <div className="absolute inset-x-0 bottom-0 h-1 bg-red-600 scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-700" />
                  </motion.div>
                ))
             )}
          </div>
          
          {/* Empty State */}
          {!loading && filteredChannels.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-40 bg-white/5 rounded-[4rem] border border-white/5 border-dashed"
            >
              <div className="w-24 h-24 bg-red-600/10 rounded-full flex items-center justify-center mb-6">
                <MonitorPlay className="w-12 h-12 text-red-600" />
              </div>
              <h3 className="text-2xl font-black text-gray-400 mb-2">Gak ada channel-nya :(</h3>
              <p className="text-gray-600 font-medium">Coba ganti kategori atau kata kunci pencarianmu.</p>
            </motion.div>
          )}

        </div>
      </div>
    </main>
  );
}

const Home = dynamic(() => Promise.resolve(HomeContent), { ssr: false });

export default Home;
