"use client"

import { useLanguage } from "@/contexts/LanguageContext"
import styles from "@/styles/pages/Legal.module.css"

export default function TermsPage() {
    const { t } = useLanguage()

    return (
        <main className="page-main">
            <div className={styles.legal_container}>
                <h1 className={styles.title}>{t('terms.title')}</h1>
                <p className={styles.updated}>{t('terms.last_updated')}</p>
                <p>{t('terms.intro')}</p>

                <section className={styles.section}>
                    <h2>{t('terms.acceptance')}</h2>
                    <p>{t('terms.acceptance.desc')}</p>
                </section>

                <section className={styles.section}>
                    <h2>{t('terms.accounts')}</h2>
                    <p>{t('terms.accounts.desc')}</p>
                </section>

                <section className={styles.section}>
                    <h2>{t('terms.content')}</h2>
                    <p>{t('terms.content.desc')}</p>
                </section>

                <section className={styles.section}>
                    <h2>{t('terms.intellectual_property')}</h2>
                    <p>{t('terms.intellectual_property.desc')}</p>
                </section>

                <section className={styles.section}>
                    <h2>{t('terms.termination')}</h2>
                    <p>{t('terms.termination.desc')}</p>
                </section>

                <section className={styles.section}>
                    <h2>{t('terms.limitation')}</h2>
                    <p>{t('terms.limitation.desc')}</p>
                </section>

                <section className={styles.section}>
                    <h2>{t('terms.changes')}</h2>
                    <p>{t('terms.changes.desc')}</p>
                </section>

                <section className={styles.section}>
                    <h2>{t('terms.contact')}</h2>
                    <p>{t('terms.contact.desc')}</p>
                </section>
            </div>
        </main>
    )
}
