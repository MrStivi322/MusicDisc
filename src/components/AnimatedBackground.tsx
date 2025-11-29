"use client"

import { usePathname } from 'next/navigation'
import styles from "@/styles/components/AnimatedBackground.module.css"
import { useEffect, useState } from 'react'

export function AnimatedBackground() {
    const pathname = usePathname()
    const [variant, setVariant] = useState<'default' | 'artists' | 'news' | 'profile' | 'newsDetail' | 'settings'>('default')

    useEffect(() => {
        if (pathname === '/') {
            setVariant('default')
        } else if (pathname === '/artists') {
            setVariant('artists')
        } else if (pathname === '/news') {
            setVariant('news')
        } else if (pathname?.startsWith('/artist/')) {
            setVariant('profile')
        } else if (pathname?.startsWith('/news/')) {
            setVariant('newsDetail')
        } else if (pathname === '/settings') {
            setVariant('settings')
        } else {
            setVariant('default')
        }
    }, [pathname])

    return (
        <div className={`${styles.background} ${styles[variant]}`}>
            <div className={styles.gradient_orb_1}></div>
            <div className={styles.gradient_orb_2}></div>
            <div className={styles.gradient_orb_3}></div>
        </div>
    )
}
