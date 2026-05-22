"use client"

import { useState, Suspense, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { useNotification } from "@/contexts/NotificationContext"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import styles from "@/styles/auth/Auth.module.css"

import { validate, loginSchema, signupSchema } from "@/lib/validation"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"

function AuthForm() {

    const router = useRouter()
    const searchParams = useSearchParams()

    const initialMode = searchParams.get('mode') === 'signup' ? 'signup' : 'login'
    const [mode, setMode] = useState<'login' | 'signup'>(initialMode)

    useEffect(() => {
        const currentMode = searchParams.get('mode') === 'signup' ? 'signup' : 'login'
        setMode(currentMode)
    }, [searchParams])

    const message = searchParams.get('message')

    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")

    const [username, setUsername] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")

    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [errors, setErrors] = useState<Record<string, string>>({})
    const { showNotification } = useNotification()
    const setGeneralError = (msg: string | null) => { if (msg) showNotification(msg, 'error') }

    const switchMode = (newMode: 'login' | 'signup') => {
        setMode(newMode)
        setErrors({})
        setGeneralError(null)
        const params = new URLSearchParams(searchParams.toString())
        params.set('mode', newMode)
        router.replace(`/auth?${params.toString()}`)
    }

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setGeneralError(null)
        setErrors({})

        const result = validate(loginSchema, { email, password })

        if (!result.success) {
            const firstError = Object.values(result.errors)[0]
            setGeneralError(firstError || 'Invalid form data')
            setLoading(false)
            return
        }

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            })

            if (error) throw error

            router.push("/")
            router.refresh()
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'An error occurred'
            setGeneralError(message)
        } finally {
            setLoading(false)
        }
    }

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setGeneralError(null)
        setErrors({})

        const formData = { username, email, password, confirmPassword }
        const result = validate(signupSchema, formData)

        if (!result.success) {
            setErrors(result.errors)
            setLoading(false)
            return
        }

        try {
            const { error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: { username }
                }
            })

            if (error) {
                if (error.message.includes('already registered') || error.status === 422) {
                    setGeneralError("Ya existe un usuario con ese correo electrónico")
                    return
                }
                throw error
            }

            router.push("/auth?mode=login&message=Check your email to confirm your account")
            setMode('login')
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'An error occurred'
            setGeneralError(message)
        } finally {
            setLoading(false)
        }
    }

    const isLogin = mode === 'login'

    return (
        <div className={styles.container}>
            <div className={styles.card} style={mode === 'signup' ? { maxWidth: '450px' } : {}}>
                <div className={styles.header}>
                    <h2 className={styles.title}>
                        {isLogin ? 'Iniciar sesión' : 'Registrarse'}
                    </h2>
                    <p className={styles.subtitle}>
                        {isLogin ? 'Inicia sesión para continuar' : 'Regístrate para continuar'}{" "}
                        <button
                            onClick={() => switchMode(isLogin ? 'signup' : 'login')}
                            className={styles.footer_link}
                            style={{ background: 'none', border: 'none', padding: 0, font: 'inherit', cursor: 'pointer', textDecoration: 'underline' }}
                        >
                            {isLogin ? 'Registrarse' : 'Iniciar sesión'}
                        </button>
                    </p>
                </div>

                <form className={styles.form} onSubmit={isLogin ? handleLogin : handleSignup}>
                    {message && isLogin && (
                        <div className={styles.success}>
                            {message}
                        </div>
                    )}

                    {errors.general && (
                        <div className={styles.error}>
                            <span className={styles.error_text}>{errors.general}</span>
                        </div>
                    )}

                    {!isLogin && (
                        <div className={styles.field}>
                            <Input
                                label="Nombre de usuario"
                                id="username"
                                name="username"
                                type="text"
                                required
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="johndoe"
                                error={errors.username}
                            />
                        </div>
                    )}

                    <div className={styles.field}>
                        <Input
                            label="Correo electrónico"
                            id="email-address"
                            name="email"
                            type="email"
                            autoComplete="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="email@example.com"
                            error={errors.email}
                        />
                    </div>

                    <div className={styles.field}>
                        <div style={{ position: 'relative' }}>
                            <Input
                                label="Contraseña"
                                id="password"
                                name="password"
                                type={showPassword ? "text" : "password"}
                                autoComplete={isLogin ? "current-password" : "new-password"}
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                error={errors.password}
                            />
                            <button
                                type="button"
                                className={styles.password_toggle}
                                onClick={() => setShowPassword(!showPassword)}
                                aria-label={showPassword ? "Hide password" : "Show password"}
                            >
                                {showPassword ? <i className='bx bx-eye bx-remove-padding'></i> : <i className='bx bx-eye-slash bx-remove-padding'></i>}
                            </button>
                        </div>
                    </div>

                    {!isLogin && (
                        <div className={styles.field}>
                            <Input
                                label="Confirmar contraseña"
                                id="confirm-password"
                                name="confirmPassword"
                                type="password"
                                autoComplete="new-password"
                                required
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="••••••••"
                                error={errors.confirmPassword}
                            />
                        </div>
                    )}

                    <Button
                        type="submit"
                        disabled={loading}
                        variant="primary"
                        isLoading={loading}
                        style={{ marginTop: '.5rem', width: '100%' }}
                    >
                        {loading
                            ? (isLogin ? 'Iniciando sesión' : 'Registrando')
                            : (isLogin ? 'Iniciar sesión' : 'Registrarse')
                        }
                    </Button>
                </form>
            </div>
        </div>
    )
}

export default function AuthPage() {
    return (
        <Suspense fallback={<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>Loading...</div>}>
            <AuthForm />
        </Suspense>
    )
}
