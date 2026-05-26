import type { Metadata } from "next";
import { Open_Sans } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/Navbar";
import { AuthProvider } from "@/components/AuthProvider";
import { NotificationProvider } from "@/contexts/NotificationContext";

import { PlayerProvider } from "@/contexts/PlayerContext";
import { SpotifyProvider } from "@/contexts/SpotifyContext";
import ClientLayoutContent from "@/components/ClientLayoutContent";
import { AnimatedBackground } from "@/components/AnimatedBackground";
import SmoothScroll from "@/components/SmoothScroll";

const openSans = Open_Sans({
  subsets: ["latin"],
  variable: "--font-open-sans",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://audionauta.vercel.app/'),
  title: {
    template: '%s | Audionauta',
    default: 'Audionauta - Music Discovery',
  },
  description: 'Discover new artists, albums, and music news. Your ultimate platform for exploring the music world.',
  keywords: ['music', 'discovery', 'artists', 'albums', 'news', 'reviews'],
  authors: [{ name: 'Music Discovery Team' }],
  creator: 'Joseph M.',
  publisher: 'Joseph M.',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://audionauta.vercel.app/',
    siteName: 'Audionauta',
    title: 'Audionauta - Music Discovery',
    description: 'Discover new artists, albums, and music news.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Music Discovery Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Audionauta - Music Discovery',
    description: 'Discover new artists, albums, and music news.',
    images: ['/og-image.jpg'],
  },
  icons: {
    icon: '/icon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#cc0a2f" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link href="https://cdn.boxicons.com/3.0.8/fonts/basic/boxicons.min.css" rel="stylesheet" />
        <link href="https://cdn.boxicons.com/3.0.8/fonts/filled/boxicons-filled.min.css" rel="stylesheet" />
        <link href="https://cdn.boxicons.com/3.0.8/fonts/brands/boxicons-brands.min.css" rel="stylesheet" />
        <link rel="preload" as="image" href="/icon.png" />
      </head>
      <body className={`${openSans.variable}`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
          storageKey="musicdisc-theme"
        >
          <NotificationProvider>
            <AuthProvider>
              <PlayerProvider>
                <SpotifyProvider>
                  <SmoothScroll />
                  <AnimatedBackground />
                  <ClientLayoutContent>{children}</ClientLayoutContent>
                </SpotifyProvider>
              </PlayerProvider>
            </AuthProvider>
          </NotificationProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
