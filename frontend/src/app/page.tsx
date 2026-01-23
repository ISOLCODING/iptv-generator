"use client";

import { useEffect, useState } from "react";
import "@vidstack/react/player/styles/base.css";
import "@vidstack/react/player/styles/default/theme.css";
import "@vidstack/react/player/styles/default/layouts/video.css";

import { MediaPlayer, MediaProvider } from "@vidstack/react";
import { DefaultVideoLayout, defaultLayoutIcons } from "@vidstack/react/player/layouts/default";
import { Search, MonitorPlay, X, RefreshCcw } from "lucide-react"; 

interface Channel {
  id: string;
  name: string;
  logo: string;
  group: string;
  url: string;
  userAgent?: string;
  referrer?: string;
}

export default function Home() {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [filteredChannels, setFilteredChannels] = useState<Channel[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  // M3U Parser Function
  const parseM3U = (content: string): Channel[] => {
    const lines = content.split('\n');
    const result: Channel[] = [];
    let currentItem: Partial<Channel> = {};

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line.startsWith('#EXTINF:')) {
            // Parse Attributes
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
            // URL line
            if (currentItem.name) {
                currentItem.url = line;
                result.push(currentItem as Channel);
                currentItem = {}; // Reset
            }
        }
    }
    return result;
  };

  const fetchChannels = async () => {
    setLoading(true);
    try {
      // Direct Fetch from your GitHub Pages
      const res = await fetch("https://isolcoding.github.io/iptv-generator/playlist.m3u");
      
      if (!res.ok) throw new Error(`Failed to fetch: ${res.statusText}`);
      
      const text = await res.text();
      const parsedChannels = parseM3U(text);
      
      // Deduplicate by Name (keep first occurrence)
      const uniqueMap = new Map();
      parsedChannels.forEach(ch => {
        // Normalize name to avoid case sensitivity issues
        const normalizeName = ch.name.toLowerCase().trim();
        if (!uniqueMap.has(normalizeName)) {
          uniqueMap.set(normalizeName, ch);
        }
      });
      const uniqueChannels = Array.from(uniqueMap.values()) as Channel[];

      // Sort: Put "Manual" or popular channels first if possible, otherwise alphabetical
      // For now, simple alphabetical sort by name
      uniqueChannels.sort((a, b) => a.name.localeCompare(b.name));

      setChannels(uniqueChannels);
      setFilteredChannels(uniqueChannels);

      // Extract unique groups
      const groups = Array.from(new Set(uniqueChannels.map((c) => c.group || "Uncategorized"))) as string[];
      // Filter out empty groups and sort
      const cleanedGroups = groups.filter(g => g).sort();
      setCategories(["All", ...cleanedGroups]);
      
    } catch (error) {
      console.error("Failed to fetch channels", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChannels();
  }, []);

  // Filter Logic
  useEffect(() => {
    let result = channels;

    if (selectedCategory !== "All") {
      result = result.filter((c) => c.group === selectedCategory);
    }

    if (search) {
      result = result.filter((c) => 
        c.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    setFilteredChannels(result);
  }, [search, selectedCategory, channels]);

  return (
    <main className="min-h-screen bg-[#0f0f0f] text-white font-sans selection:bg-red-900 selection:text-white">
      {/* Header */}
      <nav className="fixed top-0 w-full z-50 bg-[#0f0f0f]/90 backdrop-blur-md border-b border-white/10 h-16 flex items-center px-6 justify-between">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.location.reload()}>
          <img src="/logo.png" alt="NobarTV Logo" className="w-8 h-8 object-contain" />
          <h1 className="text-xl font-bold tracking-tight">NobarTVGratis<span className="text-red-600">ID</span></h1>
        </div>
        
        <div className="flex items-center gap-4">
            <div className="relative w-64 md:w-96 hidden md:block">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            <input 
                type="text" 
                placeholder="Search channels..." 
                className="w-full bg-[#1a1a1a] border border-white/10 rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-red-600 transition-colors"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
            />
            </div>
            <button onClick={fetchChannels} className="p-2 hover:bg-white/10 rounded-full transition" title="Refresh Playlist">
                <RefreshCcw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
        </div>
      </nav>

      <div className="pt-20 px-6 pb-10 flex gap-6">
        
        {/* Sidebar / Categories */}
        <aside className="w-64 flex-shrink-0 hidden lg:block h-[calc(100vh-100px)] overflow-y-auto sticky top-20 scrollbar-thin scrollbar-thumb-white/10 hover:scrollbar-thumb-red-600/50">
          <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 px-2">Categories</h2>
          <div className="flex flex-col gap-1">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`text-left px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  selectedCategory === cat 
                    ? "bg-red-600 text-white shadow-lg shadow-red-600/20" 
                    : "hover:bg-white/5 text-gray-400 hover:text-white"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </aside>

        {/* Content */}
        <div className="flex-1">
          {selectedChannel && (
            <div className="mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
               <div className="relative aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl shadow-red-900/20 border border-white/10">
                 <button 
                  onClick={() => setSelectedChannel(null)} 
                  className="absolute top-4 right-4 z-[60] bg-black/50 hover:bg-black/80 backdrop-blur rounded-full p-2 transition"
                 >
                   <X className="w-5 h-5 text-white" />
                 </button>
                 
                 <MediaPlayer 
                    title={selectedChannel.name} 
                    src={{
                        src: selectedChannel.url,
                        type: 'application/x-mpegurl'
                    }}
                    aspectRatio="16/9"
                    load="eager"
                    autoPlay
                    crossOrigin="anonymous" 
                 >
                    <MediaProvider />
                    <DefaultVideoLayout icons={defaultLayoutIcons} />
                 </MediaPlayer>
               </div>
               <div className="mt-4 flex items-center gap-4 px-2">
                  {selectedChannel.logo && (
                    <img src={selectedChannel.logo} alt="logo" className="w-12 h-12 object-contain bg-white/5 rounded-lg p-1" />
                  )}
                  <div>
                    <h2 className="text-2xl font-bold">{selectedChannel.name}</h2>
                    <span className="text-sm text-gray-400 bg-white/10 px-2 py-0.5 rounded text-xs">{selectedChannel.group}</span>
                    {/* Debug Info for User */}
                    <p className="text-xs text-gray-600 mt-1 font-mono">{selectedChannel.url}</p>
                  </div>
               </div>
            </div>
          )}

          {/* Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
             {loading ? (
                [...Array(10)].map((_, i) => (
                  <div key={i} className="aspect-video bg-white/5 rounded-xl animate-pulse" />
                ))
             ) : (
                filteredChannels.map((channel) => (
                  <div 
                    key={channel.id}
                    onClick={() => {
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                        setSelectedChannel(channel);
                    }}
                    className="group relative aspect-video bg-[#1a1a1a] rounded-xl overflow-hidden cursor-pointer border border-white/5 hover:border-red-600/50 hover:shadow-xl hover:shadow-red-900/10 transition-all duration-300"
                  >
                    <div className="absolute inset-0 flex items-center justify-center p-8 group-hover:scale-110 transition-transform duration-300">
                       {channel.logo ? (
                         <img src={channel.logo} alt={channel.name} className="w-full h-full object-contain opacity-80 group-hover:opacity-100" onError={(e) => (e.currentTarget.style.display = 'none')} />
                       ) : (
                         <span className="text-xl font-bold text-gray-700">{channel.name.substring(0,2)}</span>
                       )}
                    </div>
                    
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-60 group-hover:opacity-100 transition-opacity" />

                    <div className="absolute bottom-0 left-0 w-full p-4">
                       <h3 className="font-semibold text-white truncate">{channel.name}</h3>
                       <p className="text-xs text-gray-400 truncate">{channel.group}</p>
                    </div>

                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                        <div className="bg-red-600 rounded-full p-3 shadow-lg transform scale-50 group-hover:scale-100 transition-transform">
                             <MonitorPlay className="w-6 h-6 text-white fill-current" />
                        </div>
                    </div>
                  </div>
                ))
             )}
          </div>
          
          {!loading && filteredChannels.length === 0 && (
             <div className="text-center py-20 text-gray-500">
                <MonitorPlay className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p>No channels found. Check your internet connection or playlist URL.</p>
                <p className="text-xs mt-2 text-red-500">Source: https://isolcoding.github.io/iptv-generator/playlist.m3u</p>
             </div>
          )}

        </div>
      </div>
    </main>
  );
}
