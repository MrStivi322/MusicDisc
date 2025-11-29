"use client"

import Link from "next/link"
import { ThemeToggle } from "@/components/theme-toggle"
import { UserMenu } from "@/components/UserMenu"
import { usePathname } from "next/navigation"
import { useAuth } from "@/components/AuthProvider"
import styles from "@/styles/components/Navbar.module.css"
import { useLanguage } from "@/contexts/LanguageContext"
import { useEffect, useState } from "react"

export function Navbar() {
    const pathname = usePathname()
    const { user } = useAuth()
    const { t } = useLanguage()
    const [scrolled, setScrolled] = useState(false)
    const [isMenuOpen, setIsMenuOpen] = useState(false)

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20)
        }

        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    // Close menu when route changes
    useEffect(() => {
        setIsMenuOpen(false)
    }, [pathname])

    // Prevent scrolling when menu is open
    useEffect(() => {
        if (isMenuOpen) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = 'unset'
        }
        return () => { document.body.style.overflow = 'unset' }
    }, [isMenuOpen])

    const navLinks = [
        { href: "/", label: t('nav.home') },
        { href: "/artists", label: t('nav.artists') },
        { href: "/news", label: t('nav.news') },
    ]

    return (
        <header className={`${styles.header} ${scrolled ? styles.scrolled : ''}`}>
            <div className={styles.container}>
                <button
                    className={styles.mobile_menu_btn}
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    aria-label="Toggle menu"
                >
                    <i className={`bx ${isMenuOpen ? 'bx-x' : 'bx-menu'}`}></i>
                </button>

                <Link href="/" className={styles.logo}>
                    <div className={styles.logo_image}>
                        <img
                            src="/icono.png"
                            alt="MusicDisc Logo"
                            width={40}
                            height={40}
                        />
                    </div>
                    <span className={styles.logo_text}>MusicDisc</span>
                </Link>

                <nav className={styles.nav}>
                    {navLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`${styles.nav_link} ${pathname === link.href ? styles.nav_link_active : ''}`}
                        >
                            {link.label}
                            {pathname === link.href && <span className={styles.active_indicator}></span>}
                        </Link>
                    ))}
                </nav>

                <div className={styles.actions}>
                    <ThemeToggle />
                    {user ? (
                        <UserMenu userEmail={user.email || ""} />
                    ) : (
                        <Link
                            href="/login"
                            className={`${styles.btn} ${styles.btn_login}`}
                        >
                            <i className="bx bx-user-circle"></i>
                            <span>{t('nav.login')}</span>
                        </Link>
                    )}
                </div>
            </div>

            {/* Mobile Menu */}
            <div className={`${styles.mobile_menu} ${isMenuOpen ? styles.open : ''}`}>
                <nav className={styles.mobile_nav}>
                    {navLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={styles.mobile_nav_link}
                            onClick={() => setIsMenuOpen(false)}
                        >
                            {link.label}
                        </Link>
                    ))}
                </nav>
            </div>
        </header>
    )
}
