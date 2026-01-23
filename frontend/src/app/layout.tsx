import type { Metadata } from "next";
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

export const metadata: Metadata = {
  title: "NobarTV Gratis ID - Nonton TV Online Indonesia Terlengkap",
  description: "Nonton TV Online Indonesia Gratis. Streaming Trans7, TransTV, RCTI, SCTV, Indosiar, dan banyak lagi. Tanpa Iklan, Tanpa Buffer, Kualitas HD.",
  keywords: ["tv online", "streaming tv", "nonton tv gratis", "iptv indonesia", "nobartv", "trans7 streaming", "transtv online"],
  openGraph: {
    title: "NobarTV Gratis ID - Streaming TV Indonesia",
    description: "Platform streaming TV Indonesia gratis dan terlengkap. Nikmati siaran langsung favoritmu sekarang.",
    url: "https://nobartvgratis.afasya.com",
    siteName: "NobarTV Gratis ID",
    images: [
      {
        url: "/logo.png",
        width: 800,
        height: 600,
      },
    ],
    locale: "id_ID",
    type: "website",
  },
  verification: {
    google: "KZmY-0-PQCpScurHFFYGfw5nWzQ8Rp7mLewiXBCFsW0",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
