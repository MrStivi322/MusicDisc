"use client"

import { useState, useEffect, useRef } from "react"

import { supabase } from "@/lib/supabase"
import { useAuth } from "@/components/AuthProvider"
import { useRouter } from "next/navigation"
import { useSpotify } from "@/contexts/SpotifyContext"
import { useNotification } from "@/contexts/NotificationContext"
import Image from "next/image"
import styles from "@/styles/settings/Settings.module.css"
import "@/app/globals.css"
import Cropper from 'react-easy-crop'
import type { Point, Area } from 'react-easy-crop'
import cropperStyles from '@/styles/settings/ImageCropper.module.css'
import { useCallback } from "react"
import { validate, profileUpdateSchema, passwordChangeSchema, calculatePasswordStrength } from "@/lib/validation"
import { rateLimiter, RATE_LIMITS } from "@/lib/rateLimiter"
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { SectionHeader } from '@/components/ui/SectionHeader'

interface ImageCropperProps {
    imageSrc: string
    onCropComplete: (croppedImage: Blob) => void
    onCancel: () => void
}

function ImageCropper({ imageSrc, onCropComplete, onCancel }: ImageCropperProps) {
    const [crop, setCrop] = useState<Point>({ x: 0, y: 0 })
    const [zoom, setZoom] = useState(1)
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)
    const containerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onCancel()
                return
            }

            if (e.key === 'Tab') {
                const focusableElements = containerRef.current?.querySelectorAll(
                    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
                )

                if (!focusableElements || focusableElements.length === 0) return

                const firstElement = focusableElements[0] as HTMLElement
                const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

                if (e.shiftKey) {
                    if (document.activeElement === firstElement) {
                        e.preventDefault()
                        lastElement.focus()
                    }
                } else {
                    if (document.activeElement === lastElement) {
                        e.preventDefault()
                        firstElement.focus()
                    }
                }
            }
        }

        document.addEventListener('keydown', handleKeyDown)

        const timer = setTimeout(() => {
            const firstInput = containerRef.current?.querySelector('input')
            if (firstInput) firstInput.focus()
        }, 100)

        return () => {
            document.removeEventListener('keydown', handleKeyDown)
            clearTimeout(timer)
        }
    }, [onCancel])

    const onCropChange = (crop: Point) => {
        setCrop(crop)
    }

    const onZoomChange = (zoom: number) => {
        setZoom(zoom)
    }

    const onCropAreaChange = (croppedArea: Area, croppedAreaPixels: Area) => {
        setCroppedAreaPixels(croppedAreaPixels)
    }

    const createImage = (url: string): Promise<HTMLImageElement> =>
        new Promise((resolve, reject) => {
            const image = new window.Image()
            image.addEventListener('load', () => resolve(image))
            image.addEventListener('error', (error: any) => reject(error))
            image.setAttribute('crossOrigin', 'anonymous')
            image.src = url
        })

    const getCroppedImg = async (
        imageSrc: string,
        pixelCrop: Area
    ): Promise<Blob> => {
        const image = await createImage(imageSrc)
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')

        if (!ctx) {
            throw new Error('No 2d context')
        }

        canvas.width = pixelCrop.width
        canvas.height = pixelCrop.height

        ctx.drawImage(
            image,
            pixelCrop.x,
            pixelCrop.y,
            pixelCrop.width,
            pixelCrop.height,
            0,
            0,
            pixelCrop.width,
            pixelCrop.height
        )

        return new Promise((resolve, reject) => {
            canvas.toBlob((blob) => {
                if (!blob) {
                    reject(new Error('Canvas is empty'))
                    return
                }
                resolve(blob)
            }, 'image/jpeg')
        })
    }

    const handleSave = async () => {
        if (croppedAreaPixels) {
            try {
                const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels)
                onCropComplete(croppedImage)
            } catch (e) {
                console.error(e)
            }
        }
    }

    return (
        <div
            className={cropperStyles.cropper_container}
            role="dialog"
            aria-modal="true"
            aria-labelledby="cropper-title"
            ref={containerRef}
        >
            <div className={cropperStyles.cropper_wrapper}>
                <Cropper
                    image={imageSrc}
                    crop={crop}
                    zoom={zoom}
                    aspect={1}
                    onCropChange={onCropChange}
                    onCropComplete={onCropAreaChange}
                    onZoomChange={onZoomChange}
                />
            </div>
            <div className={cropperStyles.controls}>
                <div className={cropperStyles.slider_container}>
                    <label htmlFor="zoom-slider" className={cropperStyles.slider_label}>Zoom</label>
                    <input
                        id="zoom-slider"
                        type="range"
                        value={zoom}
                        min={1}
                        max={3}
                        step={0.1}
                        onChange={(e) => setZoom(Number(e.target.value))}
                        className={cropperStyles.slider}
                    />
                </div>
                <div className={cropperStyles.buttons}>
                    <button onClick={onCancel} className={cropperStyles.btn_cancel}>
                        Cancelar
                    </button>
                    <button onClick={handleSave} className={cropperStyles.btn_save}>
                        Guardar
                    </button>
                </div>
            </div>
        </div>
    )
}



export default function SettingsPage() {
    const { user } = useAuth()
    const router = useRouter()
    const { token, login, logout } = useSpotify()

    const [loading, setLoading] = useState(false)
    const [uploading, setUploading] = useState(false)
    const { showNotification } = useNotification()
    const setSuccess = (msg: string) => { if (msg) showNotification(msg, 'success') }
    const setError = (msg: string) => { if (msg) showNotification(msg, 'error') }

    const [isEditingProfile, setIsEditingProfile] = useState(false)
    const [isChangingPassword, setIsChangingPassword] = useState(false)

    const [formData, setFormData] = useState({
        username: "",
        email: "",
        avatarUrl: "",
    })

    const [passwordData, setPasswordData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    })

    // Theme state (using localStorage)
    const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system')

    const [selectedImage, setSelectedImage] = useState<string | null>(null)
    const [isCropping, setIsCropping] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        if (user) {
            setFormData(prev => ({ ...prev, email: user.email || "" }))
            loadProfile()
        }

        // Load theme from localStorage
        const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | 'system'
        if (savedTheme) {
            setTheme(savedTheme)
        }
    }, [user])

    async function loadProfile() {
        if (!user) return

        try {
            const { data } = await supabase
                .from('profiles')
                .select('username, avatar_url')
                .eq('id', user.id)
                .single()

            if (data) {
                setFormData(prev => ({
                    ...prev,
                    username: data.username || "",
                    avatarUrl: data.avatar_url || "",
                }))
            }
        } catch (err) {
        }
    }

    const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
        setTheme(newTheme)
        localStorage.setItem('theme', newTheme)

        // Apply theme
        if (newTheme === 'system') {
            const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
            document.documentElement.classList.toggle('dark', isDark)
        } else {
            document.documentElement.classList.toggle('dark', newTheme === 'dark')
        }
    }

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0]

            if (file.size > 5 * 1024 * 1024) {
                setError("El archivo supera el tamaño máximo permitido de 5MB")
                return
            }

            const reader = new FileReader()
            reader.addEventListener('load', () => {
                setSelectedImage(reader.result as string)
                setIsCropping(true)
            })
            reader.readAsDataURL(file)

            e.target.value = ''
        }
    }

    const handleCropComplete = async (croppedImageBlob: Blob) => {
        setIsCropping(false)
        setSelectedImage(null)

        await uploadAvatar(croppedImageBlob)
    }

    const handleCropCancel = () => {
        setIsCropping(false)
        setSelectedImage(null)
    }

    const uploadAvatar = async (imageBlob: Blob) => {
        try {
            setUploading(true)
            setError("")

            const fileExt = 'jpg'
            const fileName = `${crypto.randomUUID()}.${fileExt}`
            const filePath = `${user!.id}/${fileName}`

            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, imageBlob, {
                    upsert: true,
                    contentType: 'image/jpeg'
                })

            if (uploadError) throw uploadError

            const { data } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath)

            const { error: updateError } = await supabase
                .from('profiles')
                .update({ avatar_url: data.publicUrl })
                .eq('id', user!.id)

            if (updateError) throw updateError

            setFormData(prev => ({ ...prev, avatarUrl: data.publicUrl }))
            setSuccess("Actualizado Correctamente")
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Error"
            setError(message)
        } finally {
            setUploading(false)
        }
    }

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError("")
        setSuccess("")

        const limitCheck = rateLimiter.check(
            `profile_${user!.id}`,
            RATE_LIMITS.PROFILE_UPDATE
        );

        if (!limitCheck.canProceed) {
            setError(
                "Has superado el límite de intentos. Por favor espera {seconds} segundos."
                    .replace('{seconds}', limitCheck.resetIn.toString())
                    .replace('{max}', RATE_LIMITS.PROFILE_UPDATE.maxAttempts.toString())
            );
            setLoading(false);
            return;
        }

        const result = validate(profileUpdateSchema, {
            username: formData.username,
            email: formData.email
        })

        if (!result.success) {
            const firstError = Object.values(result.errors)[0]
            setError(firstError || "Formulario no válido")
            setLoading(false)
            return
        }

        try {
            const { error: profileError } = await supabase
                .from('profiles')
                .update({
                    username: formData.username,
                })
                .eq('id', user!.id)

            if (profileError) throw profileError

            if (formData.email !== user?.email) {
                const { error: emailError } = await supabase.auth.updateUser({
                    email: formData.email,
                })
                if (emailError) throw emailError
            }

            setSuccess("Actualizado Correctamente")
            setIsEditingProfile(false)
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Error"
            setError(message)
        } finally {
            setLoading(false)
        }
    }

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError("")
        setSuccess("")

        const limitCheck = rateLimiter.check(
            `password_${user!.id}`,
            RATE_LIMITS.PASSWORD_CHANGE
        );

        if (!limitCheck.canProceed) {
            setError(
                "Has superado el límite de intentos. Por favor espera {minutes} minutos."
                    .replace('{minutes}', Math.ceil(limitCheck.resetIn / 60).toString())
                    .replace('{max}', RATE_LIMITS.PASSWORD_CHANGE.maxAttempts.toString())
            );
            setLoading(false);
            return;
        }

        const result = validate(passwordChangeSchema, passwordData)

        if (!result.success) {
            const firstError = Object.values(result.errors)[0]
            setError(firstError || "Formulario no válido")
            setLoading(false)
            return
        }

        try {
            const { error: signInError } = await supabase.auth.signInWithPassword({
                email: user!.email!,
                password: passwordData.currentPassword
            })

            if (signInError) {
                throw new Error("Contraseña Actual Incorrecta")
            }

            const strength = calculatePasswordStrength(passwordData.newPassword)

            const { error: updateError } = await supabase.auth.updateUser({
                password: passwordData.newPassword,
                data: {
                    password_last_changed: new Date().toISOString(),
                    password_strength: strength
                }
            })

            if (updateError) throw updateError

            setSuccess("Actualizada Correctamente")
            setIsChangingPassword(false)
            setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" })
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Error"
            setError(message)
        } finally {
            setLoading(false)
        }
    }

    const renderStrengthMeter = (strength: number) => (
        <div className={`${styles.strength_display} ${styles[`strength_${strength}`]}`}>
            <div className={styles.strength_bars}>
                {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className={styles.strength_bar} style={{ opacity: i <= strength ? 1 : 0.3 }} />
                ))}
            </div>
            <span className={styles.strength_text}>
                {strength === 0 ? '' :
                    strength <= 2 ? "Debil" :
                        strength <= 4 ? "Media" : "Segura"}
            </span>
        </div>
    )

    return (
        <main className={styles.main}>
            {isCropping && selectedImage && (
                <ImageCropper
                    imageSrc={selectedImage}
                    onCropComplete={handleCropComplete}
                    onCancel={handleCropCancel}
                />
            )}

            <div className="page-container">
                <SectionHeader title="Configuración"/>

                <div className={styles.settings_grid}>


                    {/* Appearance Section */}
                    <div className={styles.card}>
                        <div className={styles.card_body}>
                            <div className={styles.section_header}>
                                <i className={`bx bx-contrast bx-remove-padding ${styles.section_icon}`}></i>
                                <div>
                                    <h2 className={styles.section_title}>Apariencia</h2>
                                </div>
                            </div>

                            <div className={styles.theme_grid}>
                                {([
                                    { id: 'light', label: 'Claro' },
                                    { id: 'dark', label: 'Oscuro' },
                                    { id: 'system', label: 'del Sistema' }
                                ] as const).map((option) => (
                                    <button
                                        key={option.id}
                                        onClick={() => handleThemeChange(option.id)}
                                        className={`${styles.theme_card} ${theme === option.id ? styles.theme_card_active : ''}`}
                                    >
                                        <i className={`bx ${option.id === 'light' ? 'bx-brightness bx-remove-padding' :
                                            option.id === 'dark' ? 'bx-moon-star bx-remove-padding' : 'bx-desktop bx-remove-padding'
                                            } ${styles.theme_icon}`}></i>
                                        <span className={styles.theme_name}>Tema {option.label}</span>
                                        {theme === option.id && (
                                            <div className={styles.active_indicator} />
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {user && (
                        <>
                            {/* Profile Section */}
                            <div className={styles.card}>
                                <div className={styles.card_body}>
                                    <div className={styles.section_header}>
                                        <i className={`bx bx-user bx-remove-padding ${styles.section_icon}`}></i>
                                        <div>
                                            <h2 className={styles.section_title}>Perfil</h2>
                                        </div>
                                    </div>

                                    <div className={styles.profile_content}>
                                        <div className={styles.avatar_section}>
                                            <div className={styles.avatar_wrapper}>
                                                {formData.avatarUrl ? (
                                                    <Image
                                                        src={formData.avatarUrl}
                                                        alt="Avatar"
                                                        className={styles.avatar_image}
                                                        width={120}
                                                        height={120}
                                                        style={{ objectFit: 'cover' }}
                                                    />
                                                ) : (
                                                    <div className={styles.avatar_placeholder}>
                                                        {formData.username?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || 'U'}
                                                    </div>
                                                )}
                                                <button
                                                    className={styles.avatar_edit_btn}
                                                    onClick={() => fileInputRef.current?.click()}
                                                    disabled={uploading}
                                                >
                                                    <i className='bx bx-camera bx-remove-padding'></i>
                                                </button>
                                                <input
                                                    ref={fileInputRef}
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handleFileSelect}
                                                    className={styles.file_input}
                                                />
                                            </div>
                                        </div>


                                        <div className={styles.info_group}>
                                            <div className={styles.group_header}>
                                                <h3>Información personal</h3>
                                                {!isEditingProfile && (
                                                    <Button
                                                        onClick={() => setIsEditingProfile(true)}
                                                        variant="ghost"
                                                        size="sm"
                                                    >
                                                        Editar
                                                    </Button>
                                                )}
                                            </div>

                                            {isEditingProfile ? (
                                                <form onSubmit={handleUpdateProfile} className={styles.form}>
                                                    <div className={styles.field}>
                                                        <Input
                                                            label="Nombre de Usuario"
                                                            placeholder="Tu Usuario"
                                                            type="text"
                                                            value={formData.username}
                                                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                                        />
                                                    </div>

                                                    <div className={styles.field}>
                                                        <Input
                                                            label="Correo"
                                                            type="email"
                                                            placeholder="Tu Correo"
                                                            value={formData.email}
                                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                        />
                                                    </div>

                                                    <div className={styles.form_actions}>
                                                        <Button
                                                            type="button"
                                                            onClick={() => setIsEditingProfile(false)}
                                                            variant="outline"
                                                        >
                                                            Cancelar
                                                        </Button>
                                                        <Button
                                                            type="submit"
                                                            disabled={loading}
                                                            variant="primary"
                                                            isLoading={loading}
                                                        >
                                                            Guardar
                                                        </Button>
                                                    </div>
                                                </form>
                                            ) : (
                                                <div className={styles.info_display}>
                                                    <div className={styles.info_item}>
                                                        <span className={styles.info_label}>Nombre de Usuario</span>
                                                        <span className={styles.info_value}>{formData.username || '-'}</span>
                                                    </div>
                                                    <div className={styles.info_item}>
                                                        <span className={styles.info_label}>Correo</span>
                                                        <span className={styles.info_value}>{formData.email}</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <div className={styles.info_group}>
                                            <div className={styles.group_header}>
                                                <h3>Seguridad</h3>
                                                {!isChangingPassword && (
                                                    <Button
                                                        onClick={() => setIsChangingPassword(true)}
                                                        variant="ghost"
                                                        size="sm"
                                                    >
                                                        Editar
                                                    </Button>
                                                )}
                                            </div>

                                            {isChangingPassword ? (
                                                <form onSubmit={handleChangePassword} className={styles.form} autoComplete="off">
                                                    <div className={styles.field}>
                                                        <Input
                                                            label="Contraseña Actual"
                                                            type="password"
                                                            value={passwordData.currentPassword}
                                                            onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                                            placeholder="••••••••"
                                                            autoComplete="off"
                                                        />
                                                    </div>

                                                    <div className={styles.field}>
                                                        <Input
                                                            label="Nueva Contraseña"
                                                            type="password"
                                                            value={passwordData.newPassword}
                                                            onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                                            placeholder="••••••••"
                                                            autoComplete="off"
                                                        />
                                                        {passwordData.newPassword && (
                                                            <div className={styles.form_strength_meter}>
                                                                {renderStrengthMeter(calculatePasswordStrength(passwordData.newPassword))}
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className={styles.field}>
                                                        <Input
                                                            label="Confirmar Nueva Contraseña"
                                                            type="password"
                                                            value={passwordData.confirmPassword}
                                                            onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                                            placeholder="••••••••"
                                                            autoComplete="off"
                                                        />
                                                    </div>

                                                    <div className={styles.form_actions}>
                                                        <Button
                                                            type="button"
                                                            onClick={() => {
                                                                setIsChangingPassword(false)
                                                                setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" })
                                                            }}
                                                            variant="outline"
                                                        >
                                                            Cancelar
                                                        </Button>
                                                        <Button
                                                            type="submit"
                                                            disabled={loading}
                                                            variant="primary"
                                                            isLoading={loading}
                                                        >
                                                            Guardar
                                                        </Button>
                                                    </div>
                                                </form>
                                            ) : (
                                                <div className={styles.info_display}>
                                                    <div className={styles.info_item}>
                                                        <span className={styles.info_label}>Ultimo Cambio</span>
                                                        <span className={styles.info_value}>
                                                            {user.user_metadata?.password_last_changed
                                                                ? new Date(user.user_metadata.password_last_changed).toLocaleDateString()
                                                                : "Nunca"}
                                                        </span>
                                                    </div>
                                                    <div className={styles.info_item}>
                                                        <span className={styles.info_label}>Nivel de Seguridad</span>
                                                        <div className={styles.security_value}>
                                                            {renderStrengthMeter(user.user_metadata?.password_strength || 0)}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Account Stats Section */}
                            <div className={styles.settings_section}>
                                <div className={styles.card}>
                                    <div className={styles.card_body}>
                                        <div className={styles.section_header}>
                                            <i className={`bx bx-file-detail bx-remove-padding ${styles.section_icon}`}></i>
                                            <div>
                                                <h2 className={styles.section_title}>Información de la Cuenta</h2>
                                            </div>
                                        </div>

                                        <div className={styles.info_display}>
                                            <div className={styles.info_item}>
                                                <div className={styles.info_label}>Creación de la Cuenta</div>
                                                <div className={styles.info_value}>
                                                    {new Date(user.created_at).toLocaleDateString()}
                                                </div>
                                            </div>

                                            <div className={styles.info_item}>
                                                <div className={styles.info_label}>Ultimo inicio de sesión</div>
                                                <div className={styles.info_value}>
                                                    {user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString() : '-'}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                {/* Spotify Integration Section */}
                                <div className={styles.card}>
                                    <div className={styles.card_body}>
                                        <div className={styles.section_header}>
                                            <i className={`bxl bx-spotify bx-remove-padding ${styles.section_icon} ${styles.spotify_icon}`}></i>
                                            <div>
                                                <h2 className={styles.section_title}>Integración con Spotify</h2>
                                            </div>
                                        </div>

                                        <div className={styles.info_display}>
                                            <div className={styles.info_item}>
                                                <div className={styles.info_label}>
                                                    {token ? "Conectado" : "No conectado"}
                                                </div>
                                            </div>
                                            <Button
                                                onClick={token ? logout : login}
                                                variant={token ? "outline" : "primary"}
                                                className={!token ? styles.spotify_button : ""}
                                            >
                                                {token ? "Desconectar" : "Conectar"}
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </main>
    )
}
