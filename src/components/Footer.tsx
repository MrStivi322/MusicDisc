"use client"

import Link from "next/link"
import { useLanguage } from "@/contexts/LanguageContext"
import styles from "@/styles/components/Footer.module.css"

export function Footer() {
    const { t } = useLanguage()
    const currentYear = new Date().getFullYear()

    const footerLinks = [
        { label: t('footer.contact') || 'Contact', href: '/contact' },
        { label: t('footer.privacy') || 'Privacy', href: '/privacy' },
        { label: t('footer.terms') || 'Terms', href: '/terms' },
    ]

    return (
        <footer className={styles.footer}>
            <div className={styles.container}>
                <div className={styles.left}>
                    <h3 className={styles.brand_title}>MusicDisc</h3>
                    <p className={styles.copyright}>
                        © {currentYear} {t('footer.rights') || 'All rights reserved.'}
                    </p>
                </div>

                <div className={styles.center}>
                    {footerLinks.map((link) => (
                        <Link key={link.href} href={link.href} className={styles.footer_link}>
                            {link.label}
                        </Link>
                    ))}
                </div>
            </div>
        </footer>
    )
}
