"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase"
import Link from "next/link"
import { useRouter } from "next/navigation"
import styles from "@/styles/pages/Auth.module.css"
import { useLanguage } from "@/contexts/LanguageContext"
import { validate, signupSchema } from "@/lib/validation"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"

export default function SignupPage() {
    const { t } = useLanguage()
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
    })
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [errors, setErrors] = useState<Record<string, string>>({})
    const router = useRouter()

    const validateForm = () => {
        const result = validate(signupSchema, formData)
        setErrors(result.errors)
        return result.success
    }

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        const isValid = await validateForm()
        if (!isValid) {
            setLoading(false)
            return
        }

        try {
            const { data, error } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
                options: {
                    data: {
                        username: formData.username,
                    }
                }
            })

            if (error) {
                if (error.message.includes('already registered') || error.status === 422) {
                    router.push("/login?message=Check your email to confirm your account")
                    return
                }
                throw error
            }

            router.push("/login?message=Check your email to confirm your account")
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'An error occurred'
            setErrors({ general: message })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className={styles.container}>
            <div className={`card ${styles.card_override}`} style={{ maxWidth: '450px', width: '100%', padding: '2rem' }}>
                <div className={styles.header}>
                    <h2 className={styles.title}>{t('auth.signup.title')}</h2>
                    <p className={styles.subtitle}>
                        {t('auth.signup.subtitle')}{" "}
                        <Link href="/login" className={styles.footer_link}>
                            {t('auth.signup.cta')}
                        </Link>
                    </p>
                </div>
                <form className={styles.form} onSubmit={handleSignup}>
                    {errors.general && (
                        <div className={styles.error}>{errors.general}</div>
                    )}

                    <div className={styles.field}>
                        <Input
                            label={t('auth.form.username')}
                            id="username"
                            name="username"
                            type="text"
                            required
                            value={formData.username}
                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                            placeholder="johndoe"
                            error={errors.username}
                        />
                    </div>

                    <div className={styles.field}>
                        <Input
                            label={t('auth.form.email')}
                            id="email-address"
                            name="email"
                            type="email"
                            autoComplete="email"
                            required
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            placeholder="you@example.com"
                            error={errors.email}
                        />
                    </div>

                    <div className={styles.field}>
                        <div style={{ position: 'relative' }}>
                            <Input
                                label={t('auth.form.password')}
                                id="password"
                                name="password"
                                type={showPassword ? "text" : "password"}
                                autoComplete="new-password"
                                required
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                placeholder="••••••••"
                                error={errors.password}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                style={{
                                    position: 'absolute',
                                    right: '12px',
                                    top: '38px',
                                    background: 'none',
                                    border: 'none',
                                    color: 'var(--color-muted-foreground)',
                                    cursor: 'pointer'
                                }}
                                aria-label={showPassword ? "Hide password" : "Show password"}
                            >
                                {showPassword ? <i className='bx bx-hide'></i> : <i className='bx bx-show'></i>}
                            </button>
                        </div>
                    </div>

                    <div className={styles.field}>
                        <Input
                            label={t('auth.form.confirm_password')}
                            id="confirm-password"
                            name="confirmPassword"
                            type="password"
                            autoComplete="new-password"
                            required
                            value={formData.confirmPassword}
                            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                            placeholder="••••••••"
                            error={errors.confirmPassword}
                        />
                    </div>

                    <Button
                        type="submit"
                        className={styles.submit_button} // keeping logic class if needed, or replace
                        style={{ width: '100%', marginTop: '1rem' }}
                        disabled={loading}
                        variant="primary"
                        isLoading={loading}
                    >
                        {loading ? t('auth.signup.creating') : t('auth.signup.button')}
                    </Button>
                </form>
            </div>
        </div>
    )
}
