"use client"

import { usePathname } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ScrollToTop } from "@/components/ScrollToTop";

import PageTransition from "@/components/PageTransition";
import SpotifyPlayer from "@/components/player/SpotifyPlayer";

export default function ClientLayoutContent({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const showFooter = ['/', '/privacy', '/terms'].includes(pathname);

    return (
        <>
            <Navbar />
            <PageTransition>{children}</PageTransition>
            {showFooter && <Footer />}
            <ScrollToTop />
            <SpotifyPlayer />
        </>
    );
}
