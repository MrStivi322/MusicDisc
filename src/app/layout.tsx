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
  title: "Music Discovery",
  description: "Discover new artists and music news",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link href='https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap' rel='stylesheet' />
        <link href='https://fonts.googleapis.com/css2?family=Comfortaa:wght@400;500;600;700&display=swap' rel='stylesheet' />
        <link href='https://cdn.boxicons.com/3.0.4/fonts/basic/boxicons.min.css' rel='stylesheet' />
        <link href='https://cdn.boxicons.com/3.0.4/fonts/brands/boxicons-brands.min.css' rel='stylesheet' />
      </head>
      <body className={`${inter.variable} ${comfortaa.variable}`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
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
      </body>
    </html>
  );
}
