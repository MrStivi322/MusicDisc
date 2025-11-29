"use client"

import { useState } from "react"
import styles from "@/styles/pages/Contact.module.css"
import { useLanguage } from "@/contexts/LanguageContext"

export default function ContactPage() {
    const { t } = useLanguage()
    const [formData, setFormData] = useState({ name: "", email: "", message: "" })
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle")

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)
        setSubmitStatus("idle")

        try {
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Error al enviar el mensaje')
            }

            setSubmitStatus("success")
            setFormData({ name: "", email: "", message: "" })

            setTimeout(() => setSubmitStatus("idle"), 5000)
        } catch (error) {
            console.error('Error:', error)
            setSubmitStatus("error")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <main className={styles.main}>
            <div className="page-container">
                <div className={styles.grid}>

                    <div className={styles.section}>
                        <div className={styles.section_header}>
                            <i className={`bx bx-link ${styles.section_icon}`}></i>
                            <div>
                                <h2 className={styles.section_title}>{t('contact.social.title')}</h2>
                            </div>
                        </div>

                        <div className={styles.links_grid}>
                            <a href="" target="_blank" rel="noopener noreferrer" className={`${styles.link_card} ${styles.twitter}`}>
                                <i className='bxl bx-twitter-x'></i>
                                <span>Twitter</span>
                            </a>
                            <a href="" className={`${styles.link_card} ${styles.email}`}>
                                <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="100" height="100" viewBox="0 0 48 48">
                                    <path fill="#4caf50" d="M45,16.2l-5,2.75l-5,4.75L35,40h7c1.657,0,3-1.343,3-3V16.2z"></path>
                                    <path fill="#1e88e5" d="M3,16.2l3.614,1.71L13,23.7V40H6c-1.657,0-3-1.343-3-3V16.2z"></path>
                                    <polygon fill="#e53935" points="35,11.2 24,19.45 13,11.2 12,17 13,23.7 24,31.95 35,23.7 36,17"></polygon>
                                    <path fill="#c62828" d="M3,12.298V16.2l10,7.5V11.2L9.876,8.859C9.132,8.301,8.228,8,7.298,8h0C4.924,8,3,9.924,3,12.298z"></path>
                                    <path fill="#fbc02d" d="M45,12.298V16.2l-10,7.5V11.2l3.124-2.341C38.868,8.301,39.772,8,40.702,8h0 C43.076,8,45,9.924,45,12.298z"></path>
                                </svg>
                                <span>contact@musicdisc.com</span>
                            </a>
                        </div>
                    </div>

                    {/* <div className={styles.section}>
                        <div className={styles.section_header}>
                            <i className={`bx bx-message ${styles.section_icon}`}></i>
                            <div>
                                <h2 className={styles.section_title}>{t('home.contact.title')}</h2>
                            </div>
                        </div>

                        <form className={styles.form} onSubmit={handleSubmit}>
                            <div className={styles.field}>

                                <label className={styles.label} htmlFor="name">{t('contact.form.name')}</label>
                                <input type="text" name="name" value={formData.name} className={styles.input}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="johndoe" required disabled={isSubmitting} />
                                <label className={styles.label} htmlFor="email">{t('contact.form.email')}</label>
                                <input type="email" name="email" value={formData.email} className={styles.input}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    placeholder="email@example.com" required disabled={isSubmitting} />
                                <label className={styles.label} htmlFor="message">{t('contact.form.message')}</label>
                                <textarea name="message" value={formData.message} className={styles.input}
                                    onChange={(e) => setFormData({ ...formData, message: e.target.value })} rows={6}
                                    placeholder={t('contact.form.message_placeholder')} required disabled={isSubmitting} />

                                {submitStatus === "success" && (
                                    <div className={styles.success_message}>
                                        {t('contact.form.success')}
                                    </div>
                                )}

                                {submitStatus === "error" && (
                                    <div className={styles.error_message}>
                                        {t('contact.form.error')}
                                    </div>
                                )}

                                <div className={styles.form_actions}>
                                    <button type="button" className={styles.btn_cancel}>
                                        {t('settings.cancel')}
                                    </button>
                                    <button type="submit" className={styles.submit_button} disabled={isSubmitting}>
                                        {isSubmitting ? t('contact.form.sending') : t('contact.form.send')}
                                    </button>
                                </div>

                            </div>
                        </form>
                    </div> */}
                </div>
            </div>
        </main>
    )
}
