"use client"

import { useState, useEffect, useRef } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import Link from "next/link"
import styles from "@/styles/components/UserMenu.module.css"
import { useLanguage } from "@/contexts/LanguageContext"

interface UserMenuProps {
    userEmail: string
}

export function UserMenu({ userEmail }: UserMenuProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [avatarUrl, setAvatarUrl] = useState<string>("")
    const [username, setUsername] = useState<string>("")
    const dropdownRef = useRef<HTMLDivElement>(null)
    const router = useRouter()

    const { t } = useLanguage()

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
        <div className={styles.dropdown_container} ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={styles.avatar_button}
                aria-label="User menu"
            >
                {avatarUrl ? (
                    <img src={avatarUrl} alt="Avatar" className={styles.avatar_image} loading="lazy" />
                ) : (
                    getInitial()
                )}
            </button>

            {isOpen && (
                <div className={styles.dropdown_menu}>
                    <Link
                        href="/settings"
                        className={styles.dropdown_item}
                        onClick={() => setIsOpen(false)}
                    >
                        <i className={`bx bx-cog ${styles.dropdown_icon}`}></i>
                        {t('user.settings')}
                    </Link>

                    <div className={styles.dropdown_divider} />

                    <button
                        onClick={handleLogout}
                        className={styles.dropdown_item}
                    >
                        <i className={`bx bx-arrow-in-left-square-half ${styles.dropdown_icon}`}></i>
                        {t('user.logout')}
                    </button>
                </div>
            )}
        </div>
    )
}
