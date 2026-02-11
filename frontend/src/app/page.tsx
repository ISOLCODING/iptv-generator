"use client";

import dynamic from 'next/dynamic';
import { useEffect, useState, useMemo } from "react";
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
  Star
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
  const [history, setHistory] = useState<string[]>([]); // Store Channel IDs
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
    const newHistory = [channelId, ...history.filter(id => id !== channelId)].slice(0, 20); // Keep last 20
    setHistory(newHistory);
    localStorage.setItem("history", JSON.stringify(newHistory));
  };

  // --- Fetching & Parsing ---
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
        } else if (line.startsWith('#EXTVLCOPT:http-user-agent=')) {
            currentItem.userAgent = line.split('=')[1];
        } else if (line.startsWith('#EXTVLCOPT:http-referrer=')) {
            currentItem.referrer = line.split('=')[1];
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
      const res = await fetch("http://localhost:3000/playlist.m3u");
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
      // Sort by history order
      result.sort((a, b) => history.indexOf(a.id) - history.indexOf(b.id));
    } else if (selectedCategory !== "All") {
      result = result.filter((c) => c.group === selectedCategory);
    }

    if (search) {
      result = result.filter((c) => 
        c.name.toLowerCase().includes(search.toLowerCase())
      );
    }
    return result;
  }, [channels, selectedCategory, search, favorites, history]);

  const handleChannelSelect = (channel: Channel) => {
    setSelectedChannel(channel);
    addToHistory(channel.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <main className="min-h-screen text-white font-sans selection:bg-red-500/30 selection:text-red-200">

      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none z-[-1] bg-black/50" />

      {/* Header */}
      <nav className="fixed top-0 w-full z-50 glass h-16 flex items-center px-4 lg:px-8 justify-between shadow-2xl shadow-black/50">
        <div className="flex items-center gap-4">
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="lg:hidden p-2 hover:bg-white/10 rounded-full transition">
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => window.location.reload()}>
            <div className="relative">
              <div className="absolute inset-0 bg-red-600 blur opacity-50 group-hover:opacity-80 transition"></div>
              <img src="/logo.png" alt="Logo" className="relative w-8 h-8 object-contain" />
            </div>
            <h1 className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
              NobarTV<span className="text-red-500">PRO</span>
            </h1>
          </div>
        </div>
        
        <div className="flex items-center gap-3 md:gap-6">
          <div className="relative w-40 md:w-80 group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-red-600 to-blue-600 rounded-full opacity-20 group-hover:opacity-60 blur transition duration-500"></div>
            <div className="relative flex items-center bg-[#0a0a0a] rounded-full border border-white/10 overflow-hidden">
              <Search className="w-4 h-4 text-gray-400 ml-3" />
              <input
                type="text" 
                placeholder="Cari channel..."
                className="w-full bg-transparent border-none py-2 px-3 text-sm focus:outline-none text-gray-200 placeholder-gray-500"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <button onClick={fetchChannels} className="p-2 hover:bg-white/10 rounded-full transition relative group" title="Refresh">
            <RefreshCcw className={`w-5 h-5 text-gray-400 group-hover:text-white transition ${loading ? 'animate-spin' : ''}`} />
            </button>
        </div>
      </nav>

      <div className="pt-16 flex h-screen overflow-hidden">
        
        {/* Sidebar */}
        <aside className={`
            fixed lg:static z-40 inset-y-0 left-0 w-72 glass border-r-0 border-white/5 
            transform transition-transform duration-300 ease-in-out flex flex-col pt-16 lg:pt-0
            ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0 lg:w-0 lg:opacity-0 lg:overflow-hidden'}
        `}>
          <div className="p-4 flex-1 overflow-y-auto scrollbar-thin">
            <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 px-2 mt-2">Library</h2>
            <div className="space-y-1 mb-6">
              {['All', 'Favorites', 'Recent'].map(cat => (
                <button
                  key={cat}
                  onClick={() => { setSelectedCategory(cat); if (window.innerWidth < 1024) setIsSidebarOpen(false); }}
                  className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-3
                        ${selectedCategory === cat
                      ? "bg-gradient-to-r from-red-600/20 to-transparent border-l-2 border-red-500 text-white"
                      : "text-gray-400 hover:text-white hover:bg-white/5"}`}
                >
                  {cat === 'All' && <Tv className="w-4 h-4" />}
                  {cat === 'Favorites' && <Heart className="w-4 h-4" />}
                  {cat === 'Recent' && <History className="w-4 h-4" />}
                  {cat}
                </button>
              ))}
            </div>

            <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 px-2">Categories</h2>
            <div className="space-y-1">
              {categories.filter(c => !['All', 'Favorites', 'Recent'].includes(c)).map((cat) => (
                <button
                  key={cat}
                  onClick={() => { setSelectedCategory(cat); if (window.innerWidth < 1024) setIsSidebarOpen(false); }}
                  className={`w-full text-left px-4 py-2.5 rounded-lg text-sm transition-all duration-200 truncate
                        ${selectedCategory === cat
                      ? "bg-white/10 text-white"
                      : "text-gray-500 hover:text-gray-300 hover:bg-white/5"}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Backdrop for Mobile Sidebar */}
        {isSidebarOpen && (
          <div className="fixed inset-0 bg-black/60 z-30 lg:hidden backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)} />
        )}

        {/* Main Content Area */}
        <div className={`flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 p-4 lg:p-8 transition-all duration-300 pb-24`}>

          {/* Player Container */}
          {selectedChannel && (
            <div className="mb-10 animate-in fade-in slide-in-from-top-8 duration-700">
              <div className="relative aspect-video xl:aspect-[21/9] bg-black rounded-3xl overflow-hidden shadow-2xl shadow-red-900/20 ring-1 ring-white/10 group">
                 <MediaPlayer 
                    title={selectedChannel.name} 
                  src={{ src: selectedChannel.url, type: 'application/x-mpegurl' }}
                    aspectRatio="16/9"
                    load="eager"
                    autoPlay
                  crossOrigin="anonymous"
                  className="w-full h-full"
                  key={selectedChannel.id} // Add key to force re-mount on channel change
                 >
                    <MediaProvider />
                    <DefaultVideoLayout icons={defaultLayoutIcons} />
                 </MediaPlayer>

                {/* Top overlay controls */}
                <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-start opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                  <div className="pointer-events-auto">
                    <span className="px-3 py-1 bg-red-600 text-white text-xs font-bold rounded-full uppercase tracking-wider shadow-lg">Live</span>
                  </div>
                  <button
                    onClick={() => setSelectedChannel(null)}
                    className="pointer-events-auto bg-black/40 hover:bg-black/60 backdrop-blur-xl text-white rounded-full p-2 transition border border-white/10"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="mt-6 flex flex-col md:flex-row md:items-center gap-6 px-2">
                <div className="relative">
                  <div className="absolute inset-0 bg-red-500 blur-lg opacity-20 rounded-full"></div>
                  {selectedChannel.logo ? (
                    <img src={selectedChannel.logo} alt="logo" className="relative w-16 h-16 object-contain bg-[#1a1a1a] rounded-2xl p-2 border border-white/10 shadow-xl" />
                  ) : (
                    <div className="relative w-16 h-16 bg-[#1a1a1a] rounded-2xl flex items-center justify-center border border-white/10">
                      <Radio className="w-8 h-8 text-gray-600" />
                      </div>
                  )}
                  </div>
                <div className="flex-1">
                  <h2 className="text-3xl font-bold text-white mb-1">{selectedChannel.name}</h2>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold text-gray-400 bg-white/5 border border-white/10 px-2 py-1 rounded-md uppercase tracking-wider">{selectedChannel.group}</span>
                    {selectedChannel.userAgent && <span className="text-[10px] text-gray-600 font-mono hidden md:inline-block">UA: {selectedChannel.userAgent}</span>}
                  </div>
                </div>
                <button
                  onClick={(e) => toggleFavorite(e, selectedChannel.id)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-medium transition-all shadow-lg
                    ${favorites.includes(selectedChannel.id)
                      ? "bg-red-600 text-white shadow-red-600/30 hover:bg-red-700"
                      : "bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300"}`}
                >
                  <Heart className={`w-4 h-4 ${favorites.includes(selectedChannel.id) ? "fill-current" : ""}`} />
                  {favorites.includes(selectedChannel.id) ? "Favorited" : "Favorite"}
                </button>
               </div>
            </div>
          )}

          {/* Grid Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              {selectedCategory === 'Favorites' ? <Star className="w-5 h-5 text-yellow-500 fill-current" /> :
                selectedCategory === 'Recent' ? <History className="w-5 h-5 text-blue-400" /> :
                  <Tv className="w-5 h-5 text-red-500" />}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-500">
                {selectedCategory} Channels
              </span>
              <span className="text-sm font-normal text-gray-600 ml-2">({filteredChannels.length})</span>
            </h2>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
             {loading ? (
                [...Array(10)].map((_, i) => (
                  <div key={i} className="aspect-video bg-white/5 rounded-2xl animate-pulse" />
                ))
             ) : (
                filteredChannels.map((channel) => (
                  <div 
                    key={channel.id}
                    onClick={() => handleChannelSelect(channel)}
                    className="group glass-card relative aspect-video rounded-2xl overflow-hidden cursor-pointer transition-all duration-300"
                  >
                    {/* Thumbnail / Logo Area */}
                    <div className="absolute inset-0 flex items-center justify-center p-8 bg-[#121212] group-hover:scale-105 transition-transform duration-500">
                       {channel.logo ? (
                        <img src={channel.logo} alt={channel.name} className="w-full h-full object-contain opacity-70 group-hover:opacity-100 transition-opacity duration-300"
                          onError={(e) => (e.currentTarget.style.display = 'none')} />
                       ) : (
                          <span className="text-3xl font-bold text-gray-800 select-none group-hover:text-gray-700 transition-colors">{channel.name.substring(0, 2)}</span>
                       )}
                    </div>
                    
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-60 group-hover:opacity-90 transition-opacity duration-300" />

                    {/* Content */}
                    <div className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                      <button
                        onClick={(e) => toggleFavorite(e, channel.id)}
                        className="p-2 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur text-white transition hover:scale-110"
                      >
                        <Heart className={`w-4 h-4 ${favorites.includes(channel.id) ? "fill-red-500 text-red-500" : ""}`} />
                      </button>
                    </div>

                    <div className="absolute bottom-0 left-0 w-full p-4 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                      <h3 className="font-semibold text-white truncate text-shadow-sm pr-8">{channel.name}</h3>
                       <p className="text-xs text-gray-400 truncate">{channel.group}</p>
                    </div>

                    {/* Play Button Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="bg-gradient-to-br from-red-600 to-red-800 rounded-full p-4 shadow-xl shadow-red-900/40 transform scale-75 group-hover:scale-100 transition-transform duration-300">
                        <Play className="w-6 h-6 text-white fill-current ml-1" />
                        </div>
                    </div>
                  </div>
                ))
             )}
          </div>
          
          {!loading && filteredChannels.length === 0 && (
            <div className="text-center py-20">
              <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                <MonitorPlay className="w-10 h-10 text-gray-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-300 mb-2">No channels found</h3>
              <p className="text-gray-500">Try adjusting your search or category filters.</p>
             </div>
          )}

        </div>
      </div>
    </main>
  );
}

const Home = dynamic(() => Promise.resolve(HomeContent), { ssr: false });

export default Home;
