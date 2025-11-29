"use client"

import { useLanguage } from "@/contexts/LanguageContext"
import styles from "@/styles/pages/Legal.module.css"

export default function PrivacyPage() {
    const { t } = useLanguage()

    return (
        <main className="page-main">
            <div className={styles.legal_container}>
                <h1 className={styles.title}>{t('privacy.title')}</h1>
                <p className={styles.updated}>{t('privacy.last_updated')}</p>
                <p>{t('privacy.intro')}</p>

                <section className={styles.section}>
                    <h2>{t('privacy.collection')}</h2>
                    <p>{t('privacy.collection.desc')}</p>
                </section>

                <section className={styles.section}>
                    <h2>{t('privacy.use')}</h2>
                    <p>{t('privacy.use.desc')}</p>
                </section>

                <section className={styles.section}>
                    <h2>{t('privacy.sharing')}</h2>
                    <p>{t('privacy.sharing.desc')}</p>
                </section>

                <section className={styles.section}>
                    <h2>{t('privacy.security')}</h2>
                    <p>{t('privacy.security.desc')}</p>
                </section>

                <section className={styles.section}>
                    <h2>{t('privacy.cookies')}</h2>
                    <p>{t('privacy.cookies.desc')}</p>
                </section>

                <section className={styles.section}>
                    <h2>{t('privacy.rights')}</h2>
                    <p>{t('privacy.rights.desc')}</p>
                </section>

                <section className={styles.section}>
                    <h2>{t('privacy.contact')}</h2>
                    <p>{t('privacy.contact.desc')}</p>
                </section>
            </div>
        </main>
    )
}
