"use client"

import { usePathname } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export default function ClientLayoutContent({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const showFooter = ['/', '/contact', '/privacy', '/terms'].includes(pathname);

    return (
        <>
            <Navbar />
            {children}
            {showFooter && <Footer />}
        </>
    );
}
