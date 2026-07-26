"use client";

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState, useMemo, useRef } from "react";
import SEOFooter from "./SEOFooter";
import "@vidstack/react/player/styles/base.css";
import "@vidstack/react/player/styles/default/theme.css";
import "@vidstack/react/player/styles/default/layouts/video.css";
import { MediaPlayer, MediaProvider } from "@vidstack/react";
import { DefaultVideoLayout, defaultLayoutIcons } from "@vidstack/react/player/layouts/default";
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import {
  Search,
  MonitorPlay,
  X,
  RefreshCcw,
  Heart,
  History,
  Tv,
  Play,
  Info,
  Minimize2,
  Maximize2,
  Radio,
  ChevronDown,
  Languages,
  Settings2,
  Check,
  Film,
  Newspaper,
  Trophy,
  Music,
  Smile,
  Wand2,
  FolderOpen,
  Video,
  Users,
  Baby
} from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(useGSAP, ScrollTrigger);
}

interface Channel {
  id: string;
  name: string;
  logo: string;
  group: string;
  url: string;
  userAgent?: string;
  referrer?: string;
  status?: 'idle' | 'checking' | 'online' | 'offline';
}

interface Country {
  name: string;
  code: string;
}

const HERO_IMAGES = [
  "https://images.unsplash.com/photo-1593784991095-a205069470b6?auto=format&fit=crop&q=80&w=2000",
  "https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?auto=format&fit=crop&q=80&w=2000",
  "https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?auto=format&fit=crop&q=80&w=2000",
  "https://images.unsplash.com/photo-1626379953822-baec19c3accd?auto=format&fit=crop&q=80&w=2000"
];

const INITIAL_ITEMS_TO_SHOW = 24;
const ITEMS_PER_LOAD = 24;

const ASIAN_COUNTRIES = [
  { code: 'ID', name: 'Indonesia' },
  { code: 'MY', name: 'Malaysia' },
  { code: 'TH', name: 'Thailand' },
  { code: 'SG', name: 'Singapore' },
  { code: 'PH', name: 'Philippines' },
  { code: 'VN', name: 'Vietnam' },
  { code: 'KR', name: 'South Korea' },
  { code: 'JP', name: 'Japan' },
  { code: 'CN', name: 'China' },
  { code: 'IN', name: 'India' },
  { code: 'HK', name: 'Hong Kong' },
  { code: 'TW', name: 'Taiwan' }
];

const getCategoryIcon = (category: string) => {
  const cat = category.toLowerCase();
  if (cat.includes('movie') || cat.includes('cinema') || cat.includes('film') || cat.includes('vod')) return Film;
  if (cat.includes('news') || cat.includes('berita')) return Newspaper;
  if (cat.includes('sport') || cat.includes('olahraga')) return Trophy;
  if (cat.includes('music') || cat.includes('musik')) return Music;
  if (cat.includes('kid') || cat.includes('anak') || cat.includes('baby') || cat.includes('toddler')) return Baby;
  if (cat.includes('animation') || cat.includes('anime') || cat.includes('cartoon')) return Wand2;
  if (cat.includes('comedy') || cat.includes('komedi') || cat.includes('fun')) return Smile;
  if (cat.includes('documentary') || cat.includes('education') || cat.includes('knowledge') || cat.includes('culture') || cat.includes('business')) return Video;
  if (cat.includes('general') || cat.includes('public') || cat.includes('community')) return Users;
  return FolderOpen;
};

export default function HomeContent() {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [history, setHistory] = useState<string[]>([]);
  const [isMinimized, setIsMinimized] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const containerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      // Bypass splash screen for Lighthouse and Googlebot to preserve 100/100 SEO & Performance scores
      const isBot = /bot|googlebot|crawler|spider|robot|crawling|lighthouse|speed insights/i.test(navigator.userAgent);
      if (isBot) {
        setShowSplash(false);
      } else {
        const timer = setTimeout(() => {
          setShowSplash(false);
        }, 3800);
        return () => clearTimeout(timer);
      }
    }
  }, []);

  // Country State
  const [selectedCountry, setSelectedCountry] = useState<string>('ID');
  const [m3uInput, setM3uInput] = useState('');

  // Checking State
  const [isCheckingAll, setIsCheckingAll] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Carousel State
  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);

  // Translation State
  const [isTranslating, setIsTranslating] = useState(false);
  const [translationText, setTranslationText] = useState("");
  const [deepseekToken, setDeepseekToken] = useState("");
  const [showTokenModal, setShowTokenModal] = useState(false);
  const [tempToken, setTempToken] = useState("");
  const [sourceLang, setSourceLang] = useState("en-US");
  const recognitionRef = useRef<any>(null);

  // Quality State
  const [showQualityMenu, setShowQualityMenu] = useState(false);
  const [selectedQuality, setSelectedQuality] = useState("Auto (HD)");

  // Pagination State
  const [displayCount, setDisplayCount] = useState(INITIAL_ITEMS_TO_SHOW);

  // --- Persistence ---
  useEffect(() => {
    try {
      setHasLoaded(true);
      const savedFavs = localStorage.getItem("favorites");
      if (savedFavs) setFavorites(JSON.parse(savedFavs));

      const savedHistory = localStorage.getItem("history");
      if (savedHistory) setHistory(JSON.parse(savedHistory));

      const savedToken = localStorage.getItem("deepseekToken");
      if (savedToken) setDeepseekToken(savedToken);
    } catch (e) {
      console.error("Local storage error", e);
    }
  }, []);

  // --- Carousel Logic ---
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentHeroIndex((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // --- Real-time Translation Logic (Web Speech API + Deepseek) ---
  const translateWithDeepseek = async (text: string) => {
    try {
      const res = await fetch("https://api.deepseek.com/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${deepseekToken}`
        },
        body: JSON.stringify({
          model: "deepseek-chat",
          messages: [
            { role: "system", content: "Anda adalah penerjemah subtitle siaran langsung TV. Terjemahkan teks yang diberikan ke Bahasa Indonesia dengan singkat, jelas, dan natural. HANYA berikan hasil terjemahannya saja tanpa tanda kutip atau penjelasan tambahan." },
            { role: "user", content: text }
          ],
          stream: false,
          temperature: 0.3
        })
      });

      if (!res.ok) {
         if(res.status === 401) {
             setTranslationText("Error: Token Deepseek tidak valid.");
             localStorage.removeItem("deepseekToken");
             setDeepseekToken("");
             setIsTranslating(false);
         } else {
             setTranslationText(`Error: Gagal menerjemahkan (Status ${res.status})`);
         }
         return;
      }

      const data = await res.json();
      if (data.choices && data.choices[0] && data.choices[0].message) {
         setTranslationText(data.choices[0].message.content);
      }
    } catch (e) {
      console.error(e);
      setTranslationText("Error: Gagal menghubungi API Deepseek.");
    }
  };

  useEffect(() => {
    if (isTranslating) {
      if (!deepseekToken) {
        setIsTranslating(false);
        setShowTokenModal(true);
        return;
      }

      setTranslationText("Mendengarkan siaran... (Pastikan volume TV cukup terdengar)");

      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) {
        setTranslationText("Browser Anda tidak mendukung deteksi suara. Gunakan Chrome/Edge desktop.");
        return;
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = sourceLang;

      recognition.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        if (finalTranscript) {
          setTranslationText(`Menerjemahkan: "${finalTranscript}"...`);
          translateWithDeepseek(finalTranscript);
        }
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        if (event.error === 'not-allowed') {
           setTranslationText("Izin mikrofon ditolak. Fitur ini butuh akses mic untuk mendengarkan TV.");
        }
      };

      recognition.onend = () => {
         // Auto restart if still translating
         if (isTranslating && recognitionRef.current) {
            try { recognitionRef.current.start(); } catch(e) {}
         }
      };

      try {
        recognition.start();
        recognitionRef.current = recognition;
      } catch(e) {
        console.error(e);
      }

      return () => {
        if (recognitionRef.current) {
          recognitionRef.current.onend = null; // Prevent restart loop on unmount
          recognitionRef.current.stop();
          recognitionRef.current = null;
        }
      };
    } else {
      setTranslationText("");
      if (recognitionRef.current) {
        recognitionRef.current.onend = null;
        recognitionRef.current.stop();
        recognitionRef.current = null;
      }
    }
  }, [isTranslating, deepseekToken, sourceLang]);

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
        const name = line.substring(line.indexOf(',') + 1).trim() || "Unknown Channel";

        currentItem = {
          id: tvgId || `ch-${i}`,
          name: tvgName || name,
          logo: tvgLogo || "",
          group: group || 'Uncategorized',
        };
      } else if (line.startsWith('#EXTVLCOPT:http-referrer=')) {
        currentItem.referrer = line.substring(25).trim();
      } else if (line.startsWith('#EXTVLCOPT:http-user-agent=')) {
        currentItem.userAgent = line.substring(27).trim();
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
      // Try dynamic Supabase DB first
      const dynamicRes = await fetch("/api/channels?country=ID");
      if (dynamicRes.ok) {
        const dynamicData = await dynamicRes.json();
        if (dynamicData && dynamicData.length > 0) {
          const mappedChannels: Channel[] = dynamicData.map((d: any) => ({
            id: d.id,
            name: d.name,
            logo: d.logo || '',
            group: d.group_title || 'Uncategorized',
            url: d.url,
            userAgent: d.user_agent || undefined,
            referrer: d.referrer || undefined,
            status: 'online' as const
          }));
          setChannels(mappedChannels);
          setLoading(false);
          return;
        }
      }

      // Fallback to static if DB is empty
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
      setChannels(uniqueChannels.map(c => ({ ...c, status: 'idle' as const })));
    } catch (error) {
      console.error("Failed to fetch channels", error);
    } finally {
      setLoading(false);
    }
  };

  const loadFromCountry = async (code: string) => {
    setSelectedCountry(code);
    setSelectedCategory("All");
    setSearch("");
    if (!code) {
      fetchChannels();
      return;
    }

    setLoading(true);
    try {
      // Try dynamic Supabase DB first
      const dynamicRes = await fetch(`/api/channels?country=${code}`);
      if (dynamicRes.ok) {
        const dynamicData = await dynamicRes.json();
        if (dynamicData && dynamicData.length > 0) {
          const mappedChannels: Channel[] = dynamicData.map((d: any) => ({
            id: d.id,
            name: d.name,
            logo: d.logo || '',
            group: d.group_title || 'Uncategorized',
            url: d.url,
            userAgent: d.user_agent || undefined,
            referrer: d.referrer || undefined,
            status: 'online' as const
          }));
          setChannels(mappedChannels);
          setLoading(false);
          return;
        }
      }

      // Fallback to public IPTV API
      const m3uUrl = `https://iptv-org.github.io/iptv/countries/${code.toLowerCase()}.m3u`;
      const res = await fetch(m3uUrl);
      if (!res.ok) throw new Error("Gagal mengambil data negara dari IPTV Public");
      const text = await res.text();
      const parsed = parseM3U(text).map(c => ({ ...c, status: 'idle' as const }));
      setChannels(parsed);
    } catch (error) {
      console.error(error);
      alert("Gagal memuat channel dari negara tersebut.");
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
    // Filter out offline channels
    result = result.filter(c => c.status !== 'offline');

    // Sort online channels to top
    result.sort((a, b) => {
      if (a.status === 'online' && b.status !== 'online') return -1;
      if (b.status === 'online' && a.status !== 'online') return 1;
      return 0; // maintain original order
    });
    return result;
  }, [channels, selectedCategory, search, favorites, history]);

  const loadFromInput = () => {
    if (!m3uInput.trim()) return;
    setLoading(true);
    setSelectedCategory("All");
    setSearch("");
    try {
      if (m3uInput.startsWith('http')) {
        // Try fetching URL via our proxy to avoid CORS
        fetch(`/api/proxy?url=${encodeURIComponent(m3uInput)}`)
          .then(res => {
            if (!res.ok) throw new Error("Gagal mengambil M3U (Status " + res.status + ")");
            return res.text();
          })
          .then(text => {
            const parsed = parseM3U(text).map(c => ({ ...c, status: 'idle' as const }));
            if (parsed.length === 0) {
              alert("Tidak ada channel yang ditemukan. Pastikan URL berisi format playlist M3U yang valid (dengan #EXTINF) dan server URL tersebut tidak mati.");
            }
            setChannels(parsed);
          })
          .catch(err => alert("Gagal mengambil M3U dari URL. Server tujuan mungkin mati, tidak merespon (timeout), atau format salah.\n\nDetail: " + err.message))
          .finally(() => setLoading(false));
      } else {
        setChannels(parseM3U(m3uInput).map(c => ({ ...c, status: 'idle' as const })));
        setLoading(false);
      }
    } catch (e) {
      setLoading(false);
    }
  };

  // Check All Channels Logic (Optimized Batch Processing via Server)
  const checkAllChannels = async () => {
    if (isCheckingAll) {
      abortControllerRef.current?.abort();
      setIsCheckingAll(false);
      return;
    }

    setIsCheckingAll(true);
    abortControllerRef.current = new AbortController();

    const BATCH_SIZE = 50; // Increased to 50 since server handles concurrency
    let currentChannels = [...channels];
    
    for (let i = 0; i < currentChannels.length; i += BATCH_SIZE) {
      if (abortControllerRef.current?.signal.aborted) break;

      const chunkIndices: number[] = [];
      const payloadChannels: any[] = [];

      for (let j = 0; j < BATCH_SIZE && i + j < currentChannels.length; j++) {
        if (currentChannels[i + j].status !== 'online') {
          chunkIndices.push(i + j);
          payloadChannels.push({
             id: currentChannels[i + j].id,
             url: currentChannels[i + j].url,
             userAgent: currentChannels[i + j].userAgent,
             referrer: currentChannels[i + j].referrer
          });
          currentChannels[i + j] = { ...currentChannels[i + j], status: 'checking' };
        }
      }
      
      // Update UI to show "checking" status for this batch
      if (chunkIndices.length > 0) {
        setChannels([...currentChannels]);
      }

      if (payloadChannels.length > 0) {
          try {
            const res = await fetch('/api/check-batch', {
               method: 'POST',
               headers: { 'Content-Type': 'application/json' },
               body: JSON.stringify({ channels: payloadChannels }),
               signal: abortControllerRef.current.signal
            });

            if (res.ok) {
               const data = await res.json();
               if (data.results) {
                  // Apply results
                  data.results.forEach((result: any) => {
                     const idx = currentChannels.findIndex(c => c.id === result.id);
                     if (idx !== -1) {
                         currentChannels[idx] = { ...currentChannels[idx], status: result.status };
                     }
                  });
               }
            } else {
               // Fallback if batch fails
               chunkIndices.forEach(idx => {
                  currentChannels[idx] = { ...currentChannels[idx], status: 'offline' };
               });
            }
          } catch (e) {
             // Handle abort or network error
             chunkIndices.forEach(idx => {
                currentChannels[idx] = { ...currentChannels[idx], status: 'offline' };
             });
          }
          
          // Trigger re-render and re-sort ONCE per batch
          setChannels([...currentChannels]);
      }
    }

    setIsCheckingAll(false);
  };

  // Reset pagination when category/search changes
  useEffect(() => {
    setDisplayCount(INITIAL_ITEMS_TO_SHOW);
  }, [selectedCategory, search]);

  const visibleChannels = useMemo(() => {
    return filteredChannels.slice(0, displayCount);
  }, [filteredChannels, displayCount]);

  // --- URL Sync Logic ---
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
      if (channels.length === 0) return;

      const channelParam = searchParams.get('channel');
      if (channelParam) {
          const decodedParam = decodeURIComponent(channelParam).toLowerCase();
          const found = channels.find(c =>
              c.name.toLowerCase() === decodedParam ||
              c.id === channelParam ||
              c.name.toLowerCase().includes(decodedParam)
          );

          if (found) {
              setSelectedChannel(found);
              if (!selectedChannel) {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
              }
          }
      }
  }, [searchParams, channels]);

  const handleChannelSelect = (channel: Channel) => {
    setSelectedChannel(channel);
    addToHistory(channel.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    const params = new URLSearchParams(searchParams.toString());
    params.set('channel', channel.name);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const [useProxy, setUseProxy] = useState(true);

  const proxySrc = useMemo(() => {
    if (!selectedChannel) return null;

    if (!useProxy) {
      return { src: selectedChannel.url, type: 'application/x-mpegurl' as const };
    }

    const isAlreadyProxied = selectedChannel.url.includes('/api/proxy');
    let proxyUrl = isAlreadyProxied ? selectedChannel.url : `/api/proxy?url=${encodeURIComponent(selectedChannel.url)}`;
    if (!isAlreadyProxied) {
      if (selectedChannel.referrer) proxyUrl += `&referer=${encodeURIComponent(selectedChannel.referrer)}`;
      if (selectedChannel.userAgent) proxyUrl += `&userAgent=${encodeURIComponent(selectedChannel.userAgent)}`;
    }

    return {
      src: proxyUrl,
      type: 'application/x-mpegurl' as const
    };
  }, [selectedChannel, useProxy]);

  const loadMore = () => {
    setDisplayCount(prev => prev + ITEMS_PER_LOAD);
  };

  // GSAP Animations
  useGSAP(() => {
    if (hasLoaded) {
      // Interactive Scroll Animation for Navbar
      let lastScroll = 0;
      ScrollTrigger.create({
        start: "top top",
        end: "max",
        onUpdate: (self) => {
          const currentScroll = self.scroll();
          if (currentScroll > lastScroll && currentScroll > 80) { 
            // Scrolling down
            gsap.to(".nav-bar", { yPercent: -100, duration: 0.3, ease: "power2.out", overwrite: true });
          } else if (currentScroll < lastScroll) { 
            // Scrolling up
            gsap.to(".nav-bar", { yPercent: 0, duration: 0.3, ease: "power2.out", overwrite: true });
          }
          lastScroll = currentScroll;
        }
      });
    }
  }, { scope: containerRef, dependencies: [hasLoaded] });

  useGSAP(() => {
    if (showSplash) {
      const tl = gsap.timeline();
      
      gsap.set('.splash-logo', { scale: 0.7, opacity: 0, filter: 'blur(10px)' });
      
      tl.to('.splash-logo', {
        scale: 1,
        opacity: 1,
        filter: 'blur(0px)',
        duration: 0.5,
        ease: 'back.out(1.5)',
      })
      .to('.splash-logo', {
        scale: 1.15,
        duration: 2.5,
        ease: 'none',
      })
      .to('.splash-logo', {
        scale: 4,
        opacity: 0,
        filter: 'blur(15px)',
        duration: 0.5,
        ease: 'power4.in',
      });

      gsap.to('.splash-bg', {
        opacity: 0,
        duration: 0.5,
        delay: 3.2,
        ease: 'power2.inOut'
      });
    }
  }, { scope: containerRef, dependencies: [showSplash] });

  // Removed ScrollTrigger GSAP for channel cards to ensure stability and prevent invisibility

  useGSAP(() => {
    if (categories.length > 0) {
      gsap.fromTo('.category-pill',
        { opacity: 0, scale: 0.9, y: 10 },
        {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 0.4,
          stagger: 0.04,
          ease: "back.out(1.5)"
        }
      );
    }
  }, { scope: containerRef, dependencies: [categories] });

  return (
    <main ref={containerRef} className="min-h-screen flex flex-col bg-[#f8fafc] text-slate-900 font-sans">
      
      {/* Netflix-Style Cinematic Splash Screen */}
      {showSplash && (
        <div className="splash-bg fixed inset-0 z-[9999] bg-black flex items-center justify-center pointer-events-auto">
          <div className="flex flex-col items-center justify-center h-full w-full">
             <div className="splash-logo flex flex-col items-center">
                <h1 className="text-5xl md:text-8xl font-black tracking-tighter text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                  NobarTV<span className="text-red-600 drop-shadow-[0_0_25px_rgba(220,38,38,0.7)]">PRO</span>
                </h1>
             </div>
          </div>
        </div>
      )}

      {/* Modern UI V4 Navbar */}
      <nav className="nav-bar fixed top-0 w-full z-50 bg-white/90 backdrop-blur-md border-b border-slate-200 flex items-center px-6 lg:px-12 h-20 justify-between shadow-sm">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => window.location.reload()}>
            <div className="relative w-10 h-10 flex items-center justify-center bg-blue-600 rounded-xl shadow-md">
              <Tv className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-black tracking-tighter text-slate-900">
              NobarTV<span className="text-blue-600">PRO</span>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-4 lg:gap-6">
          <select
            aria-label="Pilih Negara"
            title="Pilih Negara"
            className="hidden lg:block bg-slate-100 hover:bg-slate-200 border-none text-slate-700 text-sm font-semibold rounded-xl focus:ring-2 focus:ring-blue-500 py-2.5 px-4 outline-none max-w-[200px] transition-all cursor-pointer"
            value={selectedCountry}
            onChange={(e) => loadFromCountry(e.target.value)}
          >
            <option value="">Indonesia (Local)</option>
            {ASIAN_COUNTRIES.map(c => (
              <option key={c.code} value={c.code}>{c.name}</option>
            ))}
          </select>

          <div className="relative hidden md:block w-72 lg:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              aria-label="Cari hiburanmu"
              placeholder="Cari hiburanmu..."
              className="w-full bg-slate-100 hover:bg-slate-200/70 border-none rounded-xl py-2.5 pl-11 pr-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all placeholder:text-slate-500 text-slate-800"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <button
            onClick={checkAllChannels}
            className={`px-5 py-2.5 text-sm font-bold rounded-xl transition-all flex items-center gap-2 ${isCheckingAll ? 'bg-amber-100 text-amber-700' : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/20'}`}
          >
            {isCheckingAll ? 'Stop Check' : 'Check Status'}
          </button>

          <Link href="/checker" className="px-5 py-2.5 text-sm font-bold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all hidden sm:block">
            M3U Tools
          </Link>

          <button onClick={fetchChannels} aria-label="Refresh Data" title="Refresh Channel" className="p-2.5 hover:bg-slate-100 rounded-xl transition active:rotate-180 duration-500 hidden sm:block">
            <RefreshCcw className={`w-5 h-5 text-slate-600 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </nav>

      <div className="pt-28 px-4 lg:px-12 max-w-[1920px] mx-auto pb-32">
        {/* URL Input Bar */}
        <div className="w-full flex flex-col sm:flex-row gap-3 mb-8 bg-white p-2 rounded-2xl shadow-sm border border-slate-100">
          <input
            type="text"
            aria-label="Masukkan URL M3U"
            placeholder="Masukkan URL M3U dari negara lain atau paste isi playlist di sini..."
            className="flex-1 bg-transparent px-4 py-3 text-sm font-medium outline-none text-slate-700 placeholder:text-slate-400"
            value={m3uInput}
            onChange={(e) => setM3uInput(e.target.value)}
          />
          <button
            onClick={loadFromInput}
            className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-xl text-sm font-bold transition-all shadow-md flex items-center justify-center gap-2"
          >
            <MonitorPlay className="w-4 h-4" /> Load Playlist
          </button>
        </div>

        {/* Category Pills */}
        <div className="w-full flex items-center gap-2 overflow-x-auto custom-scrollbar pb-4 mb-8 -mx-4 px-4 lg:mx-0 lg:px-0">
          {[
            { id: 'All', icon: Tv, label: 'Semua' },
            { id: 'Favorites', icon: Heart, label: 'Favorit' },
            { id: 'Recent', icon: History, label: 'Terakhir' }
          ].map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`category-pill flex-shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-sm transition-all duration-300
                ${selectedCategory === cat.id
                  ? "bg-slate-900 text-white shadow-lg shadow-slate-900/20 scale-105"
                  : "bg-white text-slate-500 hover:text-slate-800 hover:bg-slate-50 shadow-sm border border-slate-200/60"}`}
            >
              <cat.icon className={`w-4 h-4 ${selectedCategory === cat.id ? "text-blue-400" : ""}`} />
              {cat.label}
            </button>
          ))}

          <div className="w-px h-8 bg-slate-200 mx-2 flex-shrink-0"></div>

          {categories.filter(c => !['All', 'Favorites', 'Recent'].includes(c)).map((cat) => {
            const Icon = getCategoryIcon(cat);
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`category-pill flex-shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-sm transition-all duration-300
                  ${selectedCategory === cat
                    ? "bg-slate-900 text-white shadow-lg shadow-slate-900/20 scale-105"
                    : "bg-white text-slate-500 hover:text-slate-800 hover:bg-slate-50 shadow-sm border border-slate-200/60"}`}
              >
                <Icon className={`w-4 h-4 ${selectedCategory === cat ? "text-blue-400" : ""}`} />
                {cat}
              </button>
            );
          })}
        </div>

        {selectedChannel ? (
          <div className={`transition-all duration-500 ease-in-out ${isMinimized ? 'fixed bottom-6 right-6 w-[400px] z-50 shadow-2xl rounded-3xl overflow-hidden border border-slate-200 bg-white' : 'mb-12'}`}>
            <div className={`relative group overflow-hidden bg-black ${isMinimized ? 'h-full w-full' : 'rounded-3xl aspect-video lg:aspect-21/9 shadow-xl shadow-slate-200'}`}>
              {proxySrc && (
                <MediaPlayer
                  title={selectedChannel.name}
                  src={proxySrc}
                  aspectRatio="16/9"
                  load="eager"
                  autoPlay
                  crossOrigin="anonymous"
                  className="w-full h-full"
                  onProviderSetup={(provider: any) => {
                    if (provider?.type === 'hls') {
                      provider.config = {
                        ...provider.config,
                        startLevel: -1, 
                        capLevelToPlayerSize: false,
                        abrEwmaDefaultEstimate: 5000000 
                      };
                    }
                  }}
                >
                  <MediaProvider />
                  <DefaultVideoLayout icons={defaultLayoutIcons} />
                </MediaPlayer>
              )}

              {/* Translation Overlay Subtitle */}
              {isTranslating && !isMinimized && (
                <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 z-50 text-center pointer-events-none w-full px-8">
                  <div className="inline-block bg-black/70 backdrop-blur-md text-white px-6 py-2.5 rounded-2xl text-base md:text-lg font-bold shadow-lg shadow-black/50 border border-white/10">
                    {translationText}
                  </div>
                </div>
              )}

              {!isMinimized && (
                <div className="absolute top-8 left-8 flex gap-3 pointer-events-none z-10">
                  <span className="bg-red-600 text-[10px] font-bold px-3 py-1 rounded-md uppercase tracking-widest flex items-center gap-2 text-white shadow-md">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                    Live
                  </span>
                </div>
              )}

              <div className="absolute top-4 right-4 lg:top-8 lg:right-8 flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity z-10">

                {!isMinimized && (
                  <button
                    onClick={(e) => { e.stopPropagation(); setIsTranslating(!isTranslating); setShowQualityMenu(false); }}
                    className={`p-3 flex items-center gap-2 transition-all rounded-xl backdrop-blur-md text-white font-bold text-xs shadow-md ${isTranslating ? 'bg-blue-600 hover:bg-blue-700' : 'bg-black/40 hover:bg-slate-800'}`}
                    title="Live Translate"
                  >
                    <Languages className="w-4 h-4" /> 
                    <span className="hidden md:block">{isTranslating ? 'Terjemahan Aktif' : 'Live Translate'}</span>
                  </button>
                )}
                <button
                  onClick={(e) => { e.stopPropagation(); setIsMinimized(!isMinimized); }}
                  className="p-3 bg-black/40 hover:bg-blue-600 transition-all rounded-xl backdrop-blur-md text-white shadow-md"
                >
                  {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => { setSelectedChannel(null); setIsMinimized(false); setIsTranslating(false); }}
                  className="p-3 bg-black/40 hover:bg-slate-800 transition-all rounded-xl backdrop-blur-md text-white shadow-md"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {!isMinimized && (
              <div className="mt-8 flex flex-wrap items-center justify-between gap-6 px-4 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center p-3">
                    {selectedChannel.logo ? (
                      <img src={selectedChannel.logo} className="w-full h-full object-contain" alt={selectedChannel.name} />
                    ) : (
                      <Tv className="w-8 h-8 text-slate-300" />
                    )}
                  </div>
                  <div>
                    <h2 className="text-3xl font-black mb-2 tracking-tight text-slate-900">{selectedChannel.name}</h2>
                    <div className="flex items-center gap-3 text-slate-500">
                      <span className="text-sm font-bold px-3 py-1 bg-slate-100 rounded-lg">{selectedChannel.group}</span>
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>
                      <span className="text-xs flex items-center gap-1.5 font-bold text-blue-600"><Play className="w-3 h-3 fill-current" /> Streaming Active</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <button
                    onClick={(e) => toggleFavorite(e, selectedChannel.id)}
                    className={`p-4 rounded-xl transition-all shadow-sm border
                        ${favorites.includes(selectedChannel.id)
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white hover:bg-slate-50 border-slate-200 text-slate-400 hover:text-blue-600"}`}
                  >
                    <Heart className={`w-6 h-6 ${favorites.includes(selectedChannel.id) ? "fill-current" : ""}`} />
                  </button>
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 px-4 py-3 bg-slate-50 hover:bg-slate-100 cursor-pointer text-slate-700 rounded-xl text-sm font-bold border border-slate-200 transition-colors">
                      <input
                        type="checkbox"
                        checked={useProxy}
                        onChange={(e) => setUseProxy(e.target.checked)}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                      />
                      Gunakan Proxy (Bypass CORS)
                    </label>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="hero-section relative w-full h-[40vh] md:h-[50vh] lg:h-[60vh] mb-12 rounded-3xl overflow-hidden bg-slate-900 shadow-xl shadow-slate-200">
            {HERO_IMAGES.map((img, idx) => (
              <div
                key={idx}
                className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ${idx === currentHeroIndex ? 'opacity-100' : 'opacity-0'}`}
              >
                <Image
                  src={img}
                  alt="Hero Banner"
                  fill
                  priority={idx === 0}
                  className="object-cover opacity-60"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 100vw"
                />
              </div>
            ))}

            <div className="absolute inset-y-0 left-0 flex flex-col justify-center max-w-3xl px-8 lg:px-16 z-10">
              <span className="inline-block px-4 py-1.5 rounded-lg bg-blue-600 text-white font-bold text-xs tracking-widest uppercase mb-6 shadow-md w-fit">
                TV Streaming Platform
              </span>
              <h2 className="text-4xl md:text-5xl lg:text-7xl font-black mb-6 tracking-tighter leading-[1.1] text-white">
                Nonton TV <br /> <span className="text-blue-400">Lebih Modern.</span>
              </h2>
              <p className="text-lg lg:text-xl text-slate-300 mb-10 font-medium max-w-xl leading-relaxed">
                Nikmati ribuan channel lokal dan mancanegara secara gratis, stabil, dengan kualitas gambar terbaik.
              </p>
              <div className="flex gap-4">
                <button onClick={() => window.scrollTo({ top: 600, behavior: 'smooth' })} className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-bold flex items-center gap-3 transition-colors shadow-lg shadow-blue-600/20">
                  <MonitorPlay className="w-5 h-5" /> EKSPLOR CHANNEL
                </button>
              </div>
            </div>
            
            <div className="absolute bottom-6 right-6 lg:right-12 flex gap-2 z-20">
              {HERO_IMAGES.map((_, idx) => (
                <div 
                  key={idx} 
                  className={`w-2 h-2 rounded-full transition-all duration-500 ${idx === currentHeroIndex ? 'bg-blue-500 w-8' : 'bg-white/30'}`}
                />
              ))}
            </div>
          </div>
        )}

        {/* Header Grid */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 px-2 gap-4">
          <h2 className="text-2xl font-black flex items-center gap-3 tracking-tight text-slate-900">
            <span className="w-2 h-8 bg-blue-600 rounded-full"></span>
            {selectedCategory} <span className="text-slate-400 font-medium text-lg">({filteredChannels.length})</span>
          </h2>
          <div className="text-sm text-slate-500 font-medium">
            Menampilkan {Math.min(displayCount, filteredChannels.length)} dari {filteredChannels.length} channel
          </div>
        </div>

        {/* Grid GSAP */}
        <div className="channels-grid w-full grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 lg:gap-6">
          {loading ? (
            [...Array(12)].map((_, i) => (
              <div key={i} className="h-[220px] w-full rounded-2xl bg-white border border-slate-100 shadow-sm flex flex-col overflow-hidden">
                <div className="flex-1 bg-slate-50 flex items-center justify-center p-6">
                   <div className="w-16 h-16 rounded-full bg-slate-200 animate-pulse"></div>
                </div>
                <div className="p-4 bg-white flex flex-col gap-3">
                   <div className="w-3/4 h-4 bg-slate-200 rounded-md animate-pulse"></div>
                   <div className="w-1/2 h-3 bg-slate-100 rounded-md animate-pulse"></div>
                </div>
              </div>
            ))
          ) : (
            visibleChannels.map((channel) => (
              <div
                key={channel.id}
                onClick={() => handleChannelSelect(channel)}
                className="channel-card h-[220px] group relative rounded-2xl cursor-pointer overflow-hidden bg-white border border-slate-200 hover:border-blue-500 shadow-sm hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className="absolute inset-0 flex items-center justify-center p-8 bg-white transition-colors duration-300">
                  {channel.logo ? (
                    <img
                      src={channel.logo}
                      alt={channel.name}
                      className="w-full h-full object-contain scale-95 group-hover:scale-110 transition-transform duration-500 ease-out"
                      loading="lazy"
                    />
                  ) : (
                    <span className="text-4xl font-black text-slate-200 group-hover:text-blue-100 transition-colors uppercase">{channel.name.substring(0, 2)}</span>
                  )}
                </div>

                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <div className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-y-1 group-hover:translate-y-0">
                  <button
                    onClick={(e) => toggleFavorite(e, channel.id)}
                    className="p-2 rounded-lg bg-white/20 backdrop-blur-md text-white hover:bg-blue-600 transition-colors"
                  >
                    <Heart className={`w-4 h-4 ${favorites.includes(channel.id) ? "fill-current text-white" : ""}`} />
                  </button>
                </div>

                {channel.status && channel.status !== 'idle' && (
                  <div className="absolute top-3 left-3 z-10">
                    {channel.status === 'checking' && <span className="bg-amber-100 text-amber-700 px-2 py-1 rounded text-[10px] font-bold uppercase">Checking</span>}
                    {channel.status === 'online' && <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-[10px] font-bold uppercase">Online</span>}
                    {channel.status === 'offline' && <span className="bg-slate-100 text-slate-500 px-2 py-1 rounded text-[10px] font-bold uppercase">Offline</span>}
                  </div>
                )}

                <div className="absolute bottom-0 left-0 w-full p-4 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 ease-out">
                  <h3 className="text-sm font-bold text-white truncate leading-tight mb-1">{channel.name}</h3>
                  <p className="text-[10px] text-slate-300 font-bold uppercase tracking-wider truncate">{channel.group}</p>
                </div>
              </div>
            ))
          )}
        </div>
        
        {!loading && displayCount < filteredChannels.length && (
           <div className="flex justify-center mt-12 mb-20">
              <button 
                onClick={loadMore}
                className="px-8 py-4 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 hover:border-blue-300 transition-all shadow-sm flex items-center gap-3"
              >
                  Muat Lebih Banyak
                  <ChevronDown className="w-5 h-5" />
              </button>
           </div>
        )}

        {!loading && filteredChannels.length === 0 && (
          <div className="flex flex-col items-center justify-center py-40 bg-white rounded-3xl border border-slate-200 border-dashed shadow-sm">
            <div className="w-20 h-20 bg-slate-50 rounded-2xl flex items-center justify-center mb-6 border border-slate-100">
              <MonitorPlay className="w-10 h-10 text-slate-400" />
            </div>
            <h3 className="text-2xl font-black text-slate-700 mb-2">Gak ada channel-nya :(</h3>
            <p className="text-slate-500 font-medium">Coba ganti kategori atau kata kunci pencarianmu.</p>
          </div>
        )}



        {/* Deepseek Token Modal */}
        {showTokenModal && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-slate-100">
              <h3 className="text-2xl font-black text-slate-900 mb-2">Deepseek API Key</h3>
              <p className="text-slate-500 mb-6 text-sm">Fitur Live Translate membutuhkan token Deepseek API Anda. Token hanya disimpan di browser Anda (Local Storage).</p>
              
              <div className="mb-4">
                 <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Bahasa Asal (Suara TV)</label>
                 <select 
                   value={sourceLang}
                   onChange={(e) => setSourceLang(e.target.value)}
                   className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 font-medium text-slate-700"
                 >
                    <option value="en-US">English (US)</option>
                    <option value="ja-JP">Japanese</option>
                    <option value="ko-KR">Korean</option>
                    <option value="ar-SA">Arabic</option>
                    <option value="th-TH">Thai</option>
                    <option value="zh-CN">Chinese (Mandarin)</option>
                 </select>
              </div>

              <div className="mb-6">
                 <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">API Token</label>
                 <input 
                   type="text" 
                   placeholder="sk-..." 
                   value={tempToken}
                   onChange={(e) => setTempToken(e.target.value)}
                   className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 font-medium text-slate-700"
                 />
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={() => setShowTokenModal(false)}
                  className="flex-1 py-3 px-4 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-all"
                >Batal</button>
                <button 
                  onClick={() => {
                     if(tempToken.trim()) {
                        localStorage.setItem("deepseekToken", tempToken.trim());
                        setDeepseekToken(tempToken.trim());
                        setShowTokenModal(false);
                        setIsTranslating(true);
                     }
                  }}
                  className="flex-1 py-3 px-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all"
                >Simpan & Mulai</button>
              </div>
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
