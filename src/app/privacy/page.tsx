"use client"

import { useLanguage } from "@/contexts/LanguageContext"
import styles from "@/styles/pages/Legal.module.css"

export default function PrivacyPage() {
    const { t } = useLanguage()

    return (
        <main className="page-main">
            <div className={styles.legal_container}>
                <h1 className={styles.title}>Privacy Policy</h1>
                <p className={styles.updated}>Last updated: November 25, 2025</p>

                <section className={styles.section}>
                    <h2>1. Information We Collect</h2>
                    <p>We collect information you provide directly to us when you create an account, update your profile, or interact with our platform.</p>
                </section>

                <section className={styles.section}>
                    <h2>2. How We Use Your Information</h2>
                    <p>We use the information we collect to provide, maintain, and improve our services, to develop new features, and to protect MusicDisc and our users.</p>
                </section>

                <section className={styles.section}>
                    <h2>3. Information Sharing</h2>
                    <p>We do not share your personal information with third parties except as described in this privacy policy.</p>
                </section>

                <section className={styles.section}>
                    <h2>4. Data Security</h2>
                    <p>We implement appropriate security measures to protect your personal information.</p>
                </section>

                <section className={styles.section}>
                    <h2>5. Your Rights</h2>
                    <p>You have the right to access, update, or delete your personal information at any time.</p>
                </section>

                <section className={styles.section}>
                    <h2>6. Contact Us</h2>
                    <p>If you have questions about this Privacy Policy, please contact us at privacy@musicdisc.com</p>
                </section>
            </div>
        </main>
    )
}
