"use client"

import Link from "next/link"
import styles from "@/styles/pages/Legal.module.css"
import { useLanguage } from "@/contexts/LanguageContext"

export default function TermsPage() {
    const { t } = useLanguage()

    return (
        <main className="page-main">
            <div className={styles.error_container}>
                <div className={styles.error_icon}>
                    <i className='bx bx-shield-x'></i>
                </div>
                <h1 className={styles.error_title}>{t('legal.not_available_title')}</h1>
                <p className={styles.error_message}>
                    {t('legal.terms_restricted_msg')}
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
