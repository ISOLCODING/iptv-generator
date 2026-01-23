const channels = [
    // --- TransMedia Group ---
    {
        id: "trans7",
        name: "Trans 7",
        logo: "https://upload.wikimedia.org/wikipedia/id/archive/6/6e/20210609071039%21Logo_Trans7_2013-sekarang.png",
        group: "TransMedia",
        strategy: "scrape_generic",
        sourceUrl: "https://www.transtv.co.id/live/trans7",
        // Example regex to find source in standard players
        regex: /file\s*:\s*["']([^"']+\.m3u8[^"']*)["']/,
        headers: {
            "Referer": "https://www.transtv.co.id/",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
        }
    },
    {
        id: "transtv",
        name: "Trans TV",
        logo: "https://upload.wikimedia.org/wikipedia/id/archive/8/87/20220610052745%21Logo_Trans_TV_2013-sekarang.png",
        group: "TransMedia",
        strategy: "scrape_generic",
        sourceUrl: "https://www.transtv.co.id/live",
        regex: /file\s*:\s*["']([^"']+\.m3u8[^"']*)["']/,
        headers: {
            "Referer": "https://www.transtv.co.id/",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
        }
    },
    {
        id: "cnn_id",
        name: "CNN Indonesia",
        logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/CNN_Indonesia_Logo.svg/1200px-CNN_Indonesia_Logo.svg.png",
        group: "TransMedia",
        strategy: "scrape_generic",
        sourceUrl: "https://www.cnnindonesia.com/tv",
        regex: /source\s*:\s*["']([^"']+\.m3u8[^"']*)["']/,
         headers: {
            "Referer": "https://www.cnnindonesia.com/",
            "User-Agent": "Mozilla/5.0"
        }
    },
    {
        id: "cnbc_id",
        name: "CNBC Indonesia",
        logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/59/CNBC_Indonesia_logo.svg/2560px-CNBC_Indonesia_logo.svg.png",
        group: "TransMedia",
        strategy: "scrape_generic",
        sourceUrl: "https://www.cnbcindonesia.com/tv",
        regex: /source\s*:\s*["']([^"']+\.m3u8[^"']*)["']/,
        headers: {
            "Referer": "https://www.cnbcindonesia.com/",
            "User-Agent": "Mozilla/5.0"
        }
    },

    // --- Emtek Group (Often Geo-blocked/Tokenized) ---
    {
        id: "sctv",
        name: "SCTV",
        logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/29/SCTV_Logo.svg/1200px-SCTV_Logo.svg.png",
        group: "Emtek",
        strategy: "vidio_bypass", // Specific logic for Vidio embedded players if needed
        sourceUrl: "https://www.vidio.com/live/204-sctv",
        regex: /"hls_url":"([^"]+)"/, // JSON inside HTML often used by Vidio
        headers: {
            "Referer": "https://www.vidio.com/",
            "User-Agent": "Mozilla/5.0"
        }
    },
    {
        id: "indosiar",
        name: "Indosiar",
        logo: "https://upload.wikimedia.org/wikipedia/id/thumb/0/00/Indosiar_2014.svg/1200px-Indosiar_2014.svg.png",
        group: "Emtek",
        strategy: "vidio_bypass",
        sourceUrl: "https://www.vidio.com/live/205-indosiar",
        regex: /"hls_url":"([^"]+)"/,
        headers: {
            "Referer": "https://www.vidio.com/",
            "User-Agent": "Mozilla/5.0"
        }
    },
     {
        id: "sc_mnc",
        name: "Moji / O Channel", 
        logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Moji_Logo.svg/1200px-Moji_Logo.svg.png",
        group: "Emtek",
        strategy: "vidio_bypass",
        sourceUrl: "https://www.vidio.com/live/206-moji",
         regex: /"hls_url":"([^"]+)"/,
         headers: {
            "Referer": "https://www.vidio.com/",
            "User-Agent": "Mozilla/5.0"
        }
    },

    // --- Media Group ---
    {
        id: "metrotv",
        name: "Metro TV",
        logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c0/Metro_TV_2020.svg/1200px-Metro_TV_2020.svg.png",
        group: "Media Group",
        strategy: "direct", // Usually readily available or static
        sourceUrl: "https://b2cdan1-metrotv-live.cdn.jmn.net.id/hls/metrotv/playlist.m3u8", // Example direct link
        headers: {
            "Referer": "https://www.metrotvnews.com/", 
             "User-Agent": "Mozilla/5.0"
        }
    },

    // --- Net Visi Media ---
    {
        id: "net_tv",
        name: "NET TV",
        logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/82/NET_TV_2013-sekarang.svg/2048px-NET_TV_2013-sekarang.svg.png",
        group: "Net Visi",
        strategy: "youtube_live", // NET often streams on YT, or we can scrape their site
        sourceUrl: "https://www.netmedia.co.id/live", 
        regex: /file:\s*"([^"]+\.m3u8[^"]*)"/,
        headers: {
             "Referer": "https://www.netmedia.co.id/",
              "User-Agent": "Mozilla/5.0"
        }
    },

    // --- VIVA Group ---
    {
        id: "antv",
        name: "ANTV",
        logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/ANTV_2013-sekarang.svg/1200px-ANTV_2013-sekarang.svg.png",
        group: "VIVA",
        strategy: "scrape_generic",
        sourceUrl: "https://www.antvklik.com/livestream",
        regex: /source\s*:\s*["']([^"']+\.m3u8[^"']*)["']/,
         headers: {
             "Referer": "https://www.antvklik.com/",
              "User-Agent": "Mozilla/5.0"
        }
    },
    {
        id: "tvone",
        name: "TVOne",
        logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/TvOne_2008-sekarang.svg/1200px-TvOne_2008-sekarang.svg.png",
        group: "VIVA",
        strategy: "direct",
        sourceUrl: "https://stream.tvonenews.com/live/tvone/playlist.m3u8", // Placeholder direct if known
         headers: {
             "Referer": "https://www.tvonenews.com/",
              "User-Agent": "Mozilla/5.0"
        }
    },

    // --- Others ---
    {
        id: "kompas",
        name: "Kompas TV",
        logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/Kompas_TV_2018-sekarang.svg/1200px-Kompas_TV_2018-sekarang.svg.png",
        group: "KG Media",
        strategy: "direct",
        sourceUrl: "https://ad-site.kompas.id/eds/live/kompastv.m3u8",
         headers: {
             "User-Agent": "Mozilla/5.0"
        }
    },
    {
        id: "rtv",
        name: "RTV",
        logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/RTV_2014-sekarang.svg/1200px-RTV_2014-sekarang.svg.png",
        group: "Rajawali",
        strategy: "scrape_generic",
        sourceUrl: "https://www.rtv.co.id/live",
        regex: /file\s*:\s*["']([^"']+\.m3u8[^"']*)["']/,
        headers: {
             "Referer": "https://www.rtv.co.id/",
              "User-Agent": "Mozilla/5.0"
        }
    },
    {
        id: "tvri_nasional",
        name: "TVRI Nasional",
        logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/03/Logo_TVRI_2019.svg/1200px-Logo_TVRI_2019.svg.png",
        group: "TVRI",
        strategy: "direct",
        sourceUrl: "http://stream.tvri.co.id/live/TVRI_Nasional/playlist.m3u8", // Example
         headers: {
             "User-Agent": "Mozilla/5.0"
        }
    }
];

module.exports = channels;
