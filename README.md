# Antigravity IPTV Generator 🇮🇩

A dynamic Node.js script to generate IPTV playlists (`.m3u`) for Indonesian digital TV channels (Trans7, SCTV, NET TV, etc.).

## 🚀 Features

- **Dynamic Token Extraction**: The `Antigravity` module attempts to bypass geo-blocking and token protections by scraping fresh streams on demand.
- **Express Server**: Serves the playlist locally at `http://localhost:3000/playlist.m3u`.
- **Modular Design**: Easy to update channel configurations and scraping strategies.

## 🛠️ Usage

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/your-username/antigravity-iptv.git
    cd antigravity-iptv
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Run the generator**:
    ```bash
    node server.js
    ```

4.  **Use in IPTV Player**:
    - URL: `http://localhost:3000/playlist.m3u`

## 📺 Channel List (Supported Logic)

- **TransMedia**: Trans 7, Trans TV, CNN Indonesia, CNBC Indonesia
- **Emtek**: SCTV, Indosiar, Moji (Requires valid Vidio regex)
- **VIVA**: ANTV, TVOne
- **Others**: Metro TV, Kompas TV, RTV, TVRI, NET TV

## ⚠️ Disclaimer

This project is for **educational purposes only**. The availability of channels depends on the respective broadcasters' streaming mechanisms. This script does not host any content; it merely aggregates publicly available stream links.

## 📄 License

MIT
