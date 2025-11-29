"use client"

import { useState, Suspense } from "react"
import { supabase } from "@/lib/supabase"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import styles from "@/styles/pages/Auth.module.css"
import { useLanguage } from "@/contexts/LanguageContext"

function LoginForm() {
    const { t } = useLanguage()
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()
    const searchParams = useSearchParams()
    const message = searchParams.get('message')

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            })

            if (error) throw error

            router.push("/")
            router.refresh()
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <div className={styles.header}>
                    <h2 className={styles.title}>{t('auth.login.title')}</h2>
                    <p className={styles.subtitle}>
                        {t('auth.login.subtitle')}{" "}
                        <Link href="/signup" className={styles.footer_link}>
                            {t('auth.login.cta')}
                        </Link>
                    </p>
                </div>
                <form className={styles.form} onSubmit={handleLogin}>
                    <div className={styles.field}>
                        <label htmlFor="email-address" className={styles.label}>
                            {t('auth.form.email')}
                        </label>
                        <input
                            id="email-address"
                            name="email"
                            type="email"
                            autoComplete="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className={styles.input}
                            placeholder="email@example.com"
                        />
                    </div>
                    <div className={styles.field}>
                        <label htmlFor="password" className={styles.label}>
                            {t('auth.form.password')}
                        </label>
                        <div className={styles.password_field}>
                            <input
                                id="password"
                                name="password"
                                type={showPassword ? "text" : "password"}
                                autoComplete="current-password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className={styles.input}
                                placeholder="••••••••"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className={styles.password_toggle}
                                aria-label={showPassword ? "Hide password" : "Show password"}
                            >
                                {showPassword ? <i className='bx bx-eye'></i> : <i className='bx bx-eye-slash'></i>}
                            </button>
                        </div>
                    </div>

                    {message && (
                        <div className={styles.success_message} style={{ marginBottom: '1rem', padding: '0.75rem', backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10B981', borderRadius: '0.5rem', fontSize: '0.875rem', textAlign: 'center' }}>
                            {message}
                        </div>
                    )}

                    {error && (
                        <div className={styles.error}>
                            <span className={styles.error_text}>{error}</span>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className={styles.button}
                    >
                        {loading ? t('auth.login.signing_in') : t('auth.login.button')}
                    </button>
                </form>
            </div>
        </div>
    )
}

export default function LoginPage() {
    return (
        <Suspense fallback={<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>Loading...</div>}>
            <LoginForm />
        </Suspense>
    )
}
