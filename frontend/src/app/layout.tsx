import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  metadataBase: new URL("https://nobartvgratis.afasya.com"),
  title: {
    default: "NobarTV PRO - Nonton TV Online Indonesia Terlengkap & Gratis",
    template: "%s | NobarTV PRO"
  },
  description: "Streaming TV Online Indonesia terlengkap kualitas HD tanpa buffering. Nonton RCTI, SCTV, Indosiar, Trans7, TransTV, ANTV, MNCTV secara live dan gratis.",
  keywords: [
    "tv online", "streaming tv", "nonton tv gratis", "iptv indonesia", "nobartv",
    "rcti streaming", "sctv streaming", "indosiar online", "video player",
    "live streaming bola", "tv indonesia online", "aplikasi nonton tv"
  ],
  authors: [{ name: "NobarTV Team" }],
  creator: "NobarTV PRO",
  publisher: "NobarTV PRO",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "NobarTV PRO - Nonton TV Online Indonesia Terlengkap",
    description: "Platform streaming TV Indonesia gratis dan terlengkap. Nikmati siaran langsung berkualitas HD tanpa iklan yang mengganggu.",
    url: "https://nobartvgratis.afasya.com",
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
    title: "NobarTV PRO - Streaming TV Indonesia Gratis",
    description: "Nonton TV Indonesia gratis kualitas HD. Akses ribuan channel sekarang!",
    images: ["/logo.png"],
    creator: "@nobartv",
  },
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
  verification: {
    google: "KZmY-0-PQCpScurHFFYGfw5nWzQ8Rp7mLewiXBCFsW0",
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
    "url": "https://nobartvgratis.afasya.com",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://nobartvgratis.afasya.com/?search={search_term_string}",
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
      </body>
    </html>
  );
}
