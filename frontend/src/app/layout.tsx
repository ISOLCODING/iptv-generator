import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: "#2563eb",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://nobartv-pro.vercel.app"),
  title: {
    default: "NobarTV PRO - Nonton TV Online & Live Streaming Bola Gratis",
    template: "%s | NobarTV PRO - TV Online Indonesia"
  },
  description: "Nonton TV online Indonesia dan live streaming bola gratis kualitas HD tanpa buffering. NobarTV PRO sediakan siaran langsung RCTI, SCTV, Indosiar, MNC TV, Trans7, Liga 1, hingga Timnas terlengkap.",
  keywords: [
    "tv online", "streaming tv", "nonton tv gratis", "iptv indonesia", "nobartv",
    "nobartv pro", "live streaming bola", "streaming timnas indonesia", "nobar bola",
    "rcti streaming", "sctv online", "indosiar live", "mnc tv streaming",
    "nonton liga 1", "piala asia", "yandex bola", "tv digital online", 
    "m3u8 player indonesia", "iptv gratis 2024", "siaran langsung bola",
    "aplikasi nonton tv", "streaming anime", "film indonesia"
  ],
  authors: [{ name: "NobarTV Team" }],
  creator: "NobarTV PRO",
  publisher: "NobarTV PRO",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "NobarTV PRO - TV Online & Live Streaming Sepakbola Terlengkap",
    description: "Nikmati pengalaman nonton TV online dan live streaming bola gratis dengan server tercepat kualitas Full HD. NobarTV PRO pilihan terbaik hiburan digital Anda.",
    url: "https://nobartv-pro.vercel.app",
    siteName: "NobarTV PRO",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "NobarTV PRO Preview",
      },
    ],
    locale: "id_ID",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "NobarTV PRO - Live Streaming Bola & TV Indonesia",
    description: "Akses siaran langsung TV Indonesia dan pertandingan bola favoritmu secara gratis dalam resolusi HD. Nonton di mana saja dan kapan saja!",
    images: ["/logo.png"],
    creator: "@nobartv",
  },
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
  verification: {
    google: "b9gqEOE7oU2xUoTXsoBZGiHXD5RRfij543GBO0ScXM0",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "NobarTV PRO",
    "url": "https://nobartv-pro.vercel.app",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://nobartv-pro.vercel.app/?search={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };

  const softwareAppSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "NobarTV PRO",
    "applicationCategory": "EntertainmentApplication",
    "operatingSystem": "Web",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "IDR"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "ratingCount": "1250"
    }
  };

  return (
    <html lang="id">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning={true}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareAppSchema) }}
        />
        {children}
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}
