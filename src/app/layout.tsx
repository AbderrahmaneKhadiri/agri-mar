import type { Metadata } from "next";
import { Inter, Geist_Mono, Geist } from "next/font/google"; // Use Geist from next/font/google
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AGRIMAR - Plateforme Agricole",
  description: "La plateforme de mise en relation entre agriculteurs et entreprises.",
};

import { Toaster } from "@/components/ui/sonner";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" crossOrigin="" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/leaflet.draw/1.0.4/leaflet.draw.css" />
        <link rel="stylesheet" href="https://unpkg.com/leaflet-geosearch@3.11.1/dist/geosearch.css" />
      </head>
      <body
        className={`${inter.variable} ${geist.variable} ${geistMono.variable} font-sans antialiased`}
        suppressHydrationWarning
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
