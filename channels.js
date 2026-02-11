const channels = [
    // --- TransMedia Group ---
    {
        id: "trans7",
        name: "Trans 7",
        logo: "https://upload.wikimedia.org/wikipedia/id/archive/6/6e/20210609071039%21Logo_Trans7_2013-sekarang.png",
        sourceUrl: "https://video.detik.com/trans7/smil:trans7.smil/index.m3u8",
        headers: {
            "User-Agent": "Mozilla/5.0"
        }
    },
    {
        id: "transtv",
        name: "Trans TV",
        logo: "https://upload.wikimedia.org/wikipedia/id/archive/8/87/20220610052745%21Logo_Trans_TV_2013-sekarang.png",
        sourceUrl: "https://video.detik.com/transtv/smil:transtv.smil/playlist.m3u8",
        headers: {
            "User-Agent": "Mozilla/5.0"
        }
    },
    {
        id: "cnn_id",
        name: "CNN Indonesia",
        logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/CNN_Indonesia_Logo.svg/1200px-CNN_Indonesia_Logo.svg.png",
        sourceUrl: "https://live.cnnindonesia.com/livecnn/smil:cnntv.smil/playlist.m3u8",
        headers: {
            "User-Agent": "Mozilla/5.0"
        }
    },
    {
        id: "cnbc_id",
        name: "CNBC Indonesia",
        logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/59/CNBC_Indonesia_logo.svg/2560px-CNBC_Indonesia_logo.svg.png",
        sourceUrl: "https://live.cnbcindonesia.com/livecnbc/smil:cnbctv.smil/playlist.m3u8",
        headers: {
            "User-Agent": "Mozilla/5.0"
        }
    },

    // --- Emtek Group (Vidio links often expire, using updated static ones if available) ---
    {
        id: "sctv",
        name: "SCTV",
        logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/29/SCTV_Logo.svg/1200px-SCTV_Logo.svg.png",
        // Often needs token/cookie from Vidio
        sourceUrl: "", 
    },
    {
        id: "indosiar",
        name: "Indosiar",
        logo: "https://upload.wikimedia.org/wikipedia/id/thumb/0/00/Indosiar_2014.svg/1200px-Indosiar_2014.svg.png",
        sourceUrl: "",
    },
    {
        id: "moji",
        name: "Moji",
        logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Moji_Logo.svg/1200px-Moji_Logo.svg.png",
        sourceUrl: "",
    },

    // --- Mentari TV (Example link provided by user) ---
    {
        id: "mentari_tv",
        name: "Mentari TV",
        logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/Mentari_TV.svg/1200px-Mentari_TV.svg.png",
        sourceUrl: "https://app-etslive-2.vidio.com/live/8237/master.m3u8",
        headers: {
            "Referer": "https://www.vidio.com/",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        }
    },

    // --- Media Group ---
    {
        id: "metrotv",
        name: "Metro TV",
        logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c0/Metro_TV_2020.svg/1200px-Metro_TV_2020.svg.png",
        sourceUrl: "https://edge.medcom.id/live-edge/smil:metro.smil/playlist.m3u8",
        headers: {
            "User-Agent": "Mozilla/5.0"
        }
    },

    // --- VIVA Group ---
    {
        id: "antv",
        name: "ANTV",
        logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/ANTV_2013-sekarang.svg/1200px-ANTV_2013-sekarang.svg.png",
        sourceUrl: "https://op-group1-swiftservehd-1.dens.tv/s/s07/index.m3u8",
        headers: {
            "User-Agent": "Mozilla/5.0"
        }
    },
    {
        id: "tvone",
        name: "TVOne",
        logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/TvOne_2008-sekarang.svg/1200px-TvOne_2008-sekarang.svg.png",
        sourceUrl: "https://op-group1-swiftservehd-1.dens.tv/h/h40/index.m3u8",
        headers: {
            "User-Agent": "Mozilla/5.0"
        }
    },

    // --- Others ---
    {
        id: "kompas",
        name: "Kompas TV",
        logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/Kompas_TV_2018-sekarang.svg/1200px-Kompas_TV_2018-sekarang.svg.png",
        sourceUrl: "https://op-group1-swiftservehd-1.dens.tv/s/s104/index.m3u8",
        headers: {
            "User-Agent": "Mozilla/5.0"
        }
    },
    {
        id: "rtv",
        name: "RTV",
        logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/RTV_2014-sekarang.svg/1200px-RTV_2014-sekarang.svg.png",
        sourceUrl: "https://op-group1-swiftservehd-1.dens.tv/h/h10/index.m3u8",
        headers: {
            "User-Agent": "Mozilla/5.0"
        }
    },
    {
        id: "tvri_nasional",
        name: "TVRI Nasional",
        logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/03/Logo_TVRI_2019.svg/1200px-Logo_TVRI_2019.svg.png",
        sourceUrl: "https://ott-balancer.tvri.go.id/live/eds/Nasional/hls/Nasional.m3u8",
        headers: {
            "User-Agent": "Mozilla/5.0"
        }
    }
];

module.exports = channels;
