"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import { useAuth } from "@/components/AuthProvider"

import { useEffect, useState, useRef } from "react"
import { useTheme } from "next-themes"
import { supabase } from "@/lib/supabase"
import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import styles from "@/styles/components/Navbar.module.css"
import userMenuStyles from "@/styles/components/UserMenu.module.css"
import themeStyles from "@/styles/components/ThemeToggle.module.css"

export function ThemeProvider({
    children,
    ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
    return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}

function ThemeToggle({ className }: { className?: string }) {
    const { setTheme, theme } = useTheme()

    return (
        <button
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            className={`${themeStyles.toggle_btn} ${className || ''}`}
        >
            <i className={`bx bx-sun bx-remove-padding ${themeStyles.sun_icon}`}></i>
            <i className={`bx bx-moon bx-remove-padding ${themeStyles.moon_icon}`}></i>
            <span className={themeStyles.sr_only}>Toggle theme</span>
        </button>
    )
}

function UserMenu({ userEmail }: { userEmail: string }) {
    const [isOpen, setIsOpen] = useState(false)
    const [avatarUrl, setAvatarUrl] = useState<string>("")
    const [username, setUsername] = useState<string>("")
    const dropdownRef = useRef<HTMLDivElement>(null)
    const router = useRouter()


    useEffect(() => {
        async function loadProfile() {
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                const { data } = await supabase
                    .from('profiles')
                    .select('avatar_url, username')
                    .eq('id', user.id)
                    .single()

                if (data) {
                    setAvatarUrl(data.avatar_url || "")
                    setUsername(data.username || "")
                }
            }
        }
        loadProfile()
    }, [])

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside)
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [isOpen])

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.push("/")
        router.refresh()
    }

    const getInitial = () => {
        if (username) return username.charAt(0).toUpperCase()
        return userEmail?.charAt(0).toUpperCase() || 'U'
    }

    return (
        <div className={userMenuStyles.dropdown_container} ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={userMenuStyles.avatar_button}
                aria-label="User menu"
            >
                {avatarUrl ? (
                    <Image
                        src={avatarUrl}
                        alt="Avatar"
                        className={userMenuStyles.avatar_image}
                        width={40}
                        height={40}
                        style={{ objectFit: 'cover' }}
                    />
                ) : (
                    getInitial()
                )}
            </button>

            {isOpen && (
                <div className={userMenuStyles.dropdown_menu}>
                    <Link
                        href="/settings"
                        className={userMenuStyles.dropdown_item}
                        onClick={() => setIsOpen(false)}
                    >
                        <i className={`bx bx-cog bx-remove-padding ${userMenuStyles.dropdown_icon}`}></i>
                        Ajustes
                    </Link>

                    <div className={userMenuStyles.dropdown_divider} />

                    <button
                        onClick={handleLogout}
                        className={userMenuStyles.dropdown_item}
                    >
                        <i className={`bx bx-arrow-out-right-square-half bx-remove-padding ${userMenuStyles.dropdown_icon}`}></i>
                        Cerrar sesión
                    </button>
                </div>
            )}
        </div>
    )
}

export function Navbar() {
    const pathname = usePathname()
    const { user } = useAuth()
    const [scrolled, setScrolled] = useState(false)
    const [isMenuOpen, setIsOpen] = useState(false)

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20)
        }

        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    useEffect(() => {
        setIsOpen(false)
    }, [pathname])

    useEffect(() => {
        if (isMenuOpen) {
            document.body.style.overflow = 'hidden'
            const mobileMenu = document.querySelector(`.${styles.mobile_menu}`) as HTMLElement
            if (mobileMenu) {
                const focusableElements = mobileMenu.querySelectorAll('a[href], button, textarea, input, [tabindex]:not([tabindex="-1"])')
                const firstElement = focusableElements[0] as HTMLElement
                const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

                const handleTab = (e: KeyboardEvent) => {
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

                mobileMenu.addEventListener('keydown', handleTab as any)
                firstElement?.focus()

                return () => {
                    document.body.style.overflow = 'unset'
                    mobileMenu.removeEventListener('keydown', handleTab as any)
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
                            href="/auth?mode=login"
                            className={`${styles.btn} ${styles.btn_login}`}
                        >
                            <i className="bx bx-user-circle bx-remove-padding"></i>
                        </Link>
                    )}
                </div>
            </div>

            <div className={`${styles.mobile_menu} ${isMenuOpen ? styles.open : ''}`}>
                <nav className={styles.mobile_nav} role="navigation" aria-label="Mobile navigation">
                    {navLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`${styles.mobile_nav_link} ${pathname === link.href ? styles.mobile_nav_link_active : ''}`}
                            onClick={() => setIsOpen(false)}
                            aria-current={pathname === link.href ? 'page' : undefined}
                        >
                            {link.label}
                        </Link>
                    ))}
                </nav>
            </div>
        </header>
    )
}
