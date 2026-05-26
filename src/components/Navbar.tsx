"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import { useAuth } from "@/components/AuthProvider"

import { useEffect, useState, useRef } from "react"
import { supabase } from "@/lib/supabase"
import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import styles from "@/styles/components/Navbar.module.css"
import userMenuStyles from "@/styles/components/UserMenu.module.css"
import { User } from "@supabase/supabase-js"

export function ThemeProvider({
    children,
    ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
    return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}


function UserMenu({ user }: { user: User }) {
    const [avatarUrl, setAvatarUrl] = useState<string>("")
    const [username, setUsername] = useState<string>("")

    useEffect(() => {
        let isMounted = true

        async function loadProfile() {
            const { data } = await supabase
                .from('profiles')
                .select('avatar_url, username')
                .eq('id', user.id)
                .single()

            if (isMounted && data) {
                setAvatarUrl(data.avatar_url || "")
                setUsername(data.username || "")
            }
        }

        loadProfile()

        // Realtime updates for user profile
        const channel = supabase
            .channel(`public:profiles:id=eq.${user.id}`)
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'profiles',
                    filter: `id=eq.${user.id}`,
                },
                (payload) => {
                    const updated = payload.new as { avatar_url?: string; username?: string }
                    if (isMounted && updated) {
                        setAvatarUrl(updated.avatar_url || "")
                        setUsername(updated.username || "")
                    }
                }
            )
            .subscribe()

        return () => {
            isMounted = false
            supabase.removeChannel(channel)
        }
    }, [user.id])


    const getInitial = () => {
        if (username) return username.charAt(0).toUpperCase()
        return user.email?.charAt(0).toUpperCase() || 'U'
    }

    return (
        <Link href="/settings" className={userMenuStyles.settings_pill}>
                {avatarUrl ? (
                    <Image
                        src={avatarUrl}
                        alt="Avatar"
                        className={userMenuStyles.avatar_image}
                        width={32}
                        height={32}
                        style={{ objectFit: 'cover' }}
                    />
                ) : (
                    getInitial()
                )}
        </Link>
    )
}

export function Navbar() {
    const pathname = usePathname()
    const { user } = useAuth()
    const [scrolled, setScrolled] = useState(false)
    const [isMenuOpen, setIsOpen] = useState(false)
    const mobileMenuRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const handleScroll = () => {
            const isScrolled = window.scrollY > 20
            setScrolled((prev) => (prev !== isScrolled ? isScrolled : prev))
        }

        window.addEventListener('scroll', handleScroll, { passive: true })
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    useEffect(() => {
        setIsOpen(false)
    }, [pathname])

    useEffect(() => {
        if (isMenuOpen) {
            document.body.style.overflow = 'hidden'
            const mobileMenu = mobileMenuRef.current
            if (mobileMenu) {
                const focusableElements = mobileMenu.querySelectorAll('a[href], button, textarea, input, [tabindex]:not([tabindex="-1"])')
                const firstElement = focusableElements[0] as HTMLElement
                const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

                const handleKeyDown = (e: KeyboardEvent) => {
                    if (e.key === 'Escape') {
                        setIsOpen(false)
                        return
                    }
                    if (e.key === 'Tab') {
                        if (e.shiftKey) {
                            if (document.activeElement === firstElement) {
                                e.preventDefault()
                                lastElement.focus()
                            }
                        } else {
                            if (document.activeElement === lastElement) {
                                e.preventDefault()
                                firstElement.focus()
                            }
                        }
                    }
                }

                mobileMenu.addEventListener('keydown', handleKeyDown)
                firstElement?.focus()

                return () => {
                    document.body.style.overflow = 'unset'
                    mobileMenu.removeEventListener('keydown', handleKeyDown)
                }
            }
        } else {
            document.body.style.overflow = 'unset'
        }
        return () => { document.body.style.overflow = 'unset' }
    }, [isMenuOpen])

    const navLinks = [
        { href: "/", label: 'Inicio' },
        { href: "/artists", label: 'Artistas' },
        { href: "/forum", label: 'Comunidad' },
    ]

    return (
        <header className={`${styles.header} ${scrolled ? styles.scrolled : ''}`}>
            <div className={styles.container}>
                <button
                    className={styles.mobile_menu_btn}
                    onClick={() => setIsOpen(!isMenuOpen)}
                    aria-label="Toggle menu"
                >
                    <i className={`bx ${isMenuOpen ? 'bx-x' : 'bx-menu bx-remove-padding'}`}></i>
                </button>

                <Link href="/" className={styles.logo}>
                    <div className={styles.logo_image}>
                        <Image
                            src="/icon.png?v=2"
                            alt="MusicDisc Logo"
                            width={40}
                            height={40}
                            priority
                            unoptimized
                        />
                    </div>
                    <span className={styles.logo_text}>AUDIONAUTA</span>
                </Link>

                <nav className={styles.nav} role="navigation" aria-label="Main navigation">
                    {navLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`${styles.nav_link} ${pathname === link.href ? styles.nav_link_active : ''}`}
                            aria-current={pathname === link.href ? 'page' : undefined}
                        >
                            {link.label}
                        </Link>
                    ))}
                </nav>

                <div className={styles.actions}>
                    {user ? (
                        <UserMenu user={user} />
                    ) : (
                        <Link href="/auth?mode=login"
                            className={`${styles.btn} ${styles.btn_login}`}>
                            <i className="bx bx-user-circle bx-remove-padding"></i>
                        </Link>
                    )}
                </div>
            </div>

            <div ref={mobileMenuRef} className={`${styles.mobile_menu} ${isMenuOpen ? styles.open : ''}`}>
                <nav className={styles.mobile_nav} role="navigation" aria-label="Mobile navigation">
                    {navLinks.map((link) => (
                        <Link key={link.href} href={link.href}
                            className={`${styles.mobile_nav_link} ${pathname === link.href ? styles.mobile_nav_link_active : ''}`}
                            onClick={() => setIsOpen(false)} aria-current={pathname === link.href ? 'page' : undefined}>
                            {link.label}
                        </Link>
                    ))}
                </nav>
            </div>
        </header>
    )
}
