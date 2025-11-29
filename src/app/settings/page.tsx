"use client"

import { useState, useEffect, useRef } from "react"
import { useLanguage } from "@/contexts/LanguageContext"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/components/AuthProvider"
import { useRouter } from "next/navigation"
import styles from "@/styles/pages/Settings.module.css"
import { ImageCropper } from "@/components/ImageCropper"

const LANGUAGES = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Español', flag: '🇪🇸' }
]

export default function SettingsPage() {
    const { language, setLanguage, t } = useLanguage()
    const { user } = useAuth()
    const router = useRouter()

    const [loading, setLoading] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [success, setSuccess] = useState("")
    const [error, setError] = useState("")

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

    const [selectedImage, setSelectedImage] = useState<string | null>(null)
    const [isCropping, setIsCropping] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        if (user) {
            setFormData(prev => ({ ...prev, email: user.email || "" }))
            loadProfile()
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

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0]

            if (file.size > 5 * 1024 * 1024) {
                setError(t('settings.error.file_size'))
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
            setSuccess(t('settings.avatar.success'))
        } catch (err: any) {
            setError(err.message)
        } finally {
            setUploading(false)
        }
    }

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError("")
        setSuccess("")

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

            setSuccess(t('settings.profile.success'))
            setIsEditingProfile(false)
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const calculatePasswordStrength = (password: string) => {
        if (!password) return 0
        let score = 0
        if (password.length >= 6) score += 1
        if (password.length >= 10) score += 1
        if (/[A-Z]/.test(password)) score += 1
        if (/[0-9]/.test(password)) score += 1
        if (/[^A-Za-z0-9]/.test(password)) score += 1
        return Math.min(score, 5)
    }

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError("")
        setSuccess("")

        try {
            if (passwordData.newPassword !== passwordData.confirmPassword) {
                throw new Error(t('settings.error.password_mismatch'))
            }
            if (passwordData.newPassword.length < 6) {
                throw new Error(t('settings.error.password_length'))
            }

            const { error: signInError } = await supabase.auth.signInWithPassword({
                email: user!.email!,
                password: passwordData.currentPassword
            })

            if (signInError) {
                throw new Error(t('settings.error.current_password_incorrect'))
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

            setSuccess(t('settings.password.success'))
            setIsChangingPassword(false)
            setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" })
        } catch (err: any) {
            setError(err.message)
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
                    strength <= 2 ? t('settings.security.weak') :
                        strength <= 4 ? t('settings.security.medium') : t('settings.security.strong')}
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
                <div className={styles.grid}>
                    <div className={styles.section}>
                        <div className={styles.section_header}>
                            <i className={`bx bx-globe ${styles.section_icon}`}></i>
                            <div>
                                <h2 className={styles.section_title}>{t('settings.language')}</h2>
                            </div>
                        </div>

                        <div className={styles.language_grid}>
                            {LANGUAGES.map((lang) => (
                                <button
                                    key={lang.code}
                                    onClick={() => setLanguage(lang.code as any)}
                                    className={`${styles.language_card} ${language === lang.code ? styles.language_card_active : ''}`}
                                >
                                    <span className={styles.flag}>{lang.flag}</span>
                                    <span className={styles.language_name}>{lang.name}</span>
                                    {language === lang.code && (
                                        <div className={styles.active_indicator} />
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {user && (
                        <div className={styles.section}>
                            <div className={styles.section_header}>
                                <i className={`bx bx-user ${styles.section_icon}`}></i>
                                <div>
                                    <h2 className={styles.section_title}>{t('user.profile')}</h2>
                                </div>
                            </div>

                            <div className={styles.profile_content}>
                                <div className={styles.avatar_section}>
                                    <div className={styles.avatar_wrapper}>
                                        {formData.avatarUrl ? (
                                            <img src={formData.avatarUrl} alt="Avatar" className={styles.avatar_image} loading="lazy" />
                                        ) : (
                                            <div className={styles.avatar_placeholder}>
                                                {formData.username?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || 'U'}
                                            </div>
                                        )}
                                        <button
                                            className={styles.avatar_edit_btn}
                                            onClick={() => fileInputRef.current?.click()}
                                            disabled={uploading}
                                            title={t('settings.avatar.change')}
                                        >
                                            <i className='bx bx-camera'></i>
                                        </button>
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/*"
                                            onChange={handleFileSelect}
                                            className={styles.file_input}
                                        />
                                    </div>
                                    <div className={styles.avatar_info}>
                                        <h3>{formData.username || t('user.anonymous')}</h3>
                                        <p>{user.email}</p>
                                    </div>
                                </div>

                                {success && <div className={styles.success_message}>{success}</div>}
                                {error && <div className={styles.error_message}>{error}</div>}

                                <div className={styles.info_group}>
                                    <div className={styles.group_header}>
                                        <h3>{t('settings.personal_info')}</h3>
                                        {!isEditingProfile && (
                                            <button
                                                onClick={() => setIsEditingProfile(true)}
                                                className={styles.btn_edit}
                                            >
                                                {t('settings.edit')}
                                            </button>
                                        )}
                                    </div>

                                    {isEditingProfile ? (
                                        <form onSubmit={handleUpdateProfile} className={styles.form}>
                                            <div className={styles.field}>
                                                <label className={styles.label}>{t('settings.form.username')}</label>
                                                <input
                                                    type="text"
                                                    value={formData.username}
                                                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                                    className={styles.input}
                                                    placeholder="johndoe"
                                                />
                                            </div>

                                            <div className={styles.field}>
                                                <label className={styles.label}>{t('settings.form.email')}</label>
                                                <input
                                                    type="email"
                                                    value={formData.email}
                                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                    className={styles.input}
                                                />
                                            </div>

                                            <div className={styles.form_actions}>
                                                <button
                                                    type="button"
                                                    onClick={() => setIsEditingProfile(false)}
                                                    className={styles.btn_cancel}
                                                >
                                                    {t('settings.cancel')}
                                                </button>
                                                <button
                                                    type="submit"
                                                    disabled={loading}
                                                    className={styles.button_primary}
                                                >
                                                    {loading ? t('settings.form.saving') : t('settings.form.save')}
                                                </button>
                                            </div>
                                        </form>
                                    ) : (
                                        <div className={styles.info_display}>
                                            <div className={styles.info_item}>
                                                <span className={styles.info_label}>{t('settings.form.username')}</span>
                                                <span className={styles.info_value}>{formData.username || '-'}</span>
                                            </div>
                                            <div className={styles.info_item}>
                                                <span className={styles.info_label}>{t('settings.form.email')}</span>
                                                <span className={styles.info_value}>{formData.email}</span>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className={styles.info_group}>
                                    <div className={styles.group_header}>
                                        <h3>{t('settings.security')}</h3>
                                        {!isChangingPassword && (
                                            <button
                                                onClick={() => setIsChangingPassword(true)}
                                                className={styles.btn_edit}
                                            >
                                                {t('settings.change_password')}
                                            </button>
                                        )}
                                    </div>

                                    {isChangingPassword ? (
                                        <form onSubmit={handleChangePassword} className={styles.form} autoComplete="off">
                                            <div className={styles.field}>
                                                <label className={styles.label}>{t('settings.form.current_password')}</label>
                                                <input
                                                    type="password"
                                                    value={passwordData.currentPassword}
                                                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                                    className={styles.input}
                                                    placeholder="••••••••"
                                                    autoComplete="off"
                                                />
                                            </div>

                                            <div className={styles.field}>
                                                <label className={styles.label}>{t('settings.form.new_password')}</label>
                                                <input
                                                    type="password"
                                                    value={passwordData.newPassword}
                                                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                                    className={styles.input}
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
                                                <label className={styles.label}>{t('settings.form.confirm_password')}</label>
                                                <input
                                                    type="password"
                                                    value={passwordData.confirmPassword}
                                                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                                    className={styles.input}
                                                    placeholder="••••••••"
                                                    autoComplete="off"
                                                />
                                            </div>

                                            <div className={styles.form_actions}>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setIsChangingPassword(false)
                                                        setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" })
                                                    }}
                                                    className={styles.btn_cancel}
                                                >
                                                    {t('settings.cancel')}
                                                </button>
                                                <button
                                                    type="submit"
                                                    disabled={loading}
                                                    className={styles.button_primary}
                                                >
                                                    {loading ? t('settings.form.saving') : t('settings.form.update_password')}
                                                </button>
                                            </div>
                                        </form>
                                    ) : (
                                        <div className={styles.info_display}>
                                            <div className={styles.info_item}>
                                                <span className={styles.info_label}>{t('settings.security.last_changed')}</span>
                                                <span className={styles.info_value}>
                                                    {user.user_metadata?.password_last_changed
                                                        ? new Date(user.user_metadata.password_last_changed).toLocaleDateString()
                                                        : t('settings.security.never')}
                                                </span>
                                            </div>
                                            <div className={styles.info_item}>
                                                <span className={styles.info_label}>{t('settings.security.level')}</span>
                                                <div className={styles.security_value}>
                                                    {renderStrengthMeter(user.user_metadata?.password_strength || 0)}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </main>
    )
}
