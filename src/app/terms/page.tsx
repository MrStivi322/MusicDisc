"use client"

import { useLanguage } from "@/contexts/LanguageContext"
import styles from "@/styles/pages/Legal.module.css"

export default function TermsPage() {
    const { t } = useLanguage()

    return (
        <main className="page-main">
            <div className={styles.legal_container}>
                <h1 className={styles.title}>Terms of Service</h1>
                <p className={styles.updated}>Last updated: November 25, 2025</p>

                <section className={styles.section}>
                    <h2>1. Acceptance of Terms</h2>
                    <p>By accessing and using MusicDisc, you accept and agree to be bound by the terms and provision of this agreement.</p>
                </section>

                <section className={styles.section}>
                    <h2>2. Use License</h2>
                    <p>Permission is granted to temporarily access the materials (information or software) on MusicDisc for personal, non-commercial transitory viewing only.</p>
                </section>

                <section className={styles.section}>
                    <h2>3. User Accounts</h2>
                    <p>You are responsible for maintaining the confidentiality of your account and password.</p>
                </section>

                <section className={styles.section}>
                    <h2>4. Prohibited Uses</h2>
                    <p>You may not use the platform in any way that causes damage to the platform or impairs the availability or accessibility of MusicDisc.</p>
                </section>

                <section className={styles.section}>
                    <h2>5. Limitation of Liability</h2>
                    <p>MusicDisc shall not be liable for any damages that may occur to you as a result of your use of the platform.</p>
                </section>

                <section className={styles.section}>
                    <h2>6. Modifications</h2>
                    <p>We reserve the right to modify these terms at any time. We will notify users of any changes.</p>
                </section>
            </div>
        </main>
    )
}
