import type { Metadata } from "next";
import { Inter, Comfortaa } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/components/AuthProvider";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { PlayerProvider } from "@/contexts/PlayerContext";
import ClientLayoutContent from "@/components/ClientLayoutContent";
import { AnimatedBackground } from "@/components/AnimatedBackground";
import SmoothScroll from "@/components/SmoothScroll";
import { ErrorBoundary } from "@/components/ErrorBoundary";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const comfortaa = Comfortaa({
  subsets: ["latin"],
  variable: "--font-comfortaa",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    template: '%s | Music Discovery',
    default: 'Music Discovery',
  },
  description: 'Discover new artists, albums, and music news. Your ultimate platform for exploring the music world.',
  keywords: ['music', 'discovery', 'artists', 'albums', 'news', 'reviews'],
  authors: [{ name: 'Music Discovery Team' }],
  creator: 'Music Discovery',
  publisher: 'Music Discovery',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://music-discovery.com',
    siteName: 'Music Discovery',
    title: 'Music Discovery',
    description: 'Discover new artists, albums, and music news.',
    images: [
      {
        url: '/og-image.jpg', // We should ensure this exists or use a placeholder
        width: 1200,
        height: 630,
        alt: 'Music Discovery Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Music Discovery',
    description: 'Discover new artists, albums, and music news.',
    images: ['/og-image.jpg'],
  },
  icons: {
    icon: '/icon.png',
    apple: '/apple-icon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#FF6F3D" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link href='https://cdn.boxicons.com/3.0.4/fonts/basic/boxicons.min.css' rel='stylesheet' />
        <link href='https://cdn.boxicons.com/3.0.4/fonts/brands/boxicons-brands.min.css' rel='stylesheet' />
        <link rel="preload" as="image" href="/icon.png" />
      </head>
      <body className={`${inter.variable} ${comfortaa.variable}`}>
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <ErrorBoundary>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
            storageKey="musicdisc-theme"
          >
            <LanguageProvider>
              <AuthProvider>
                <PlayerProvider>
                  <SmoothScroll />
                  <AnimatedBackground />
                  <ClientLayoutContent>{children}</ClientLayoutContent>
                </PlayerProvider>
              </AuthProvider>
            </LanguageProvider>
          </ThemeProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
