"use client"

import Link from "next/link"
import styles from "@/styles/pages/Legal.module.css"
import { useLanguage } from "@/contexts/LanguageContext"

export default function PrivacyPage() {
    const { t } = useLanguage()

    return (
        <main className="page-main">
            <div className={styles.error_container}>
                <div className={styles.error_icon}>
                    <i className='bx bxs-lock-alt'></i>
                </div>
                <h1 className={styles.error_title}>{t('legal.restricted_title')}</h1>
                <p className={styles.error_message}>
                    {t('legal.privacy_restricted_msg')}
                </p>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <Link href="/" className="btn btn-primary">
                        {t('legal.back_home')}
                    </Link>
                </div>
            </div>
        </main>
    )
}
