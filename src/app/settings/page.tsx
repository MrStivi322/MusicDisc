"use client"

import { useState, useEffect, useRef } from "react"
import { useLanguage } from "@/contexts/LanguageContext"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/components/AuthProvider"
import { useRouter } from "next/navigation"
import { useSpotify } from "@/contexts/SpotifyContext"
import Image from "next/image"
import styles from "@/styles/pages/Settings.module.css"
import dynamic from "next/dynamic"
import { validate, profileUpdateSchema, passwordChangeSchema, calculatePasswordStrength } from "@/lib/validation"
import { rateLimiter, RATE_LIMITS } from "@/lib/rateLimiter"

// New Standard Components
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { SectionHeader } from '@/components/ui/SectionHeader'

const ImageCropper = dynamic(() => import("@/components/ImageCropper").then(mod => mod.ImageCropper), {
    loading: () => <div>...</div>,
    ssr: false
})

const LANGUAGES = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Español', flag: '🇪🇸' }
]

export default function SettingsPage() {
    const { language, setLanguage, t } = useLanguage()
    const { user } = useAuth()
    const router = useRouter()
    const { token, login, logout } = useSpotify()

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

    // Theme state (using localStorage)
    const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system')

    // Notification preferences
    const [notificationPrefs, setNotificationPrefs] = useState({
        email: true,
        push: false,
        forum: true
    })

    // Privacy settings
    const [privacySettings, setPrivacySettings] = useState({
        publicProfile: true,
        showActivity: false
    })

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

        // Load notification preferences from localStorage
        const savedNotifs = localStorage.getItem('notificationPrefs')
        if (savedNotifs) {
            setNotificationPrefs(JSON.parse(savedNotifs))
        }

        // Load privacy settings from localStorage
        const savedPrivacy = localStorage.getItem('privacySettings')
        if (savedPrivacy) {
            setPrivacySettings(JSON.parse(savedPrivacy))
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

    const handleNotificationChange = (key: keyof typeof notificationPrefs) => {
        const newPrefs = { ...notificationPrefs, [key]: !notificationPrefs[key] }
        setNotificationPrefs(newPrefs)
        localStorage.setItem('notificationPrefs', JSON.stringify(newPrefs))
    }

    const handlePrivacyChange = (key: keyof typeof privacySettings) => {
        const newSettings = { ...privacySettings, [key]: !privacySettings[key] }
        setPrivacySettings(newSettings)
        localStorage.setItem('privacySettings', JSON.stringify(newSettings))
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
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : t('error.unknown')
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
                t('error.rate_limit.profile')
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
            setError(firstError || t('error.invalid_form'))
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

            setSuccess(t('settings.profile.success'))
            setIsEditingProfile(false)
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : t('error.unknown')
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
                t('error.rate_limit.password')
                    .replace('{minutes}', Math.ceil(limitCheck.resetIn / 60).toString())
                    .replace('{max}', RATE_LIMITS.PASSWORD_CHANGE.maxAttempts.toString())
            );
            setLoading(false);
            return;
        }

        const result = validate(passwordChangeSchema, passwordData)

        if (!result.success) {
            const firstError = Object.values(result.errors)[0]
            setError(firstError || t('error.invalid_form'))
            setLoading(false)
            return
        }

        try {
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
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : t('error.unknown')
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
                <SectionHeader title={t('settings.title') || "Configuración"} />

                <div className={styles.settings_grid}>
                    {/* Language Section */}
                    <div className="card animate-entrance">
                        <div className="card-body">
                            <div className={styles.section_header}>
                                <i className={`bx bx-translate ${styles.section_icon}`}></i>
                                <div>
                                    <h2 className={styles.section_title}>{t('settings.language')}</h2>
                                </div>
                            </div>

                            <div className={styles.language_grid}>
                                {LANGUAGES.map((lang) => (
                                    <button
                                        key={lang.code}
                                        onClick={() => setLanguage(lang.code as 'en' | 'es')}
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
                    </div>

                    {/* Appearance Section */}
                    <div className="card animate-entrance">
                        <div className="card-body">
                            <div className={styles.section_header}>
                                <i className={`bx bx-palette ${styles.section_icon}`}></i>
                                <div>
                                    <h2 className={styles.section_title}>{t('settings.appearance')}</h2>
                                </div>
                            </div>

                            <div className={styles.theme_grid}>
                                {(['light', 'dark', 'system'] as const).map((themeOption) => (
                                    <button
                                        key={themeOption}
                                        onClick={() => handleThemeChange(themeOption)}
                                        className={`${styles.theme_card} ${theme === themeOption ? styles.theme_card_active : ''}`}
                                    >
                                        <i className={`bx ${themeOption === 'light' ? 'bx-sun' :
                                            themeOption === 'dark' ? 'bx-moon' : 'bx-desktop'
                                            } ${styles.theme_icon}`}></i>
                                        <span className={styles.theme_name}>{t(`settings.theme.${themeOption}`)}</span>
                                        {theme === themeOption && (
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
                            <div className="card animate-entrance">
                                <div className="card-body">
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
                                                    <Image
                                                        src={formData.avatarUrl}
                                                        alt={t('common.avatar')}
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
                                                    <Button
                                                        onClick={() => setIsEditingProfile(true)}
                                                        variant="ghost"
                                                        size="sm"
                                                    >
                                                        {t('settings.edit')}
                                                    </Button>
                                                )}
                                            </div>

                                            {isEditingProfile ? (
                                                <form onSubmit={handleUpdateProfile} className={styles.form}>
                                                    <div className={styles.field}>
                                                        <Input
                                                            label={t('settings.form.username')}
                                                            type="text"
                                                            value={formData.username}
                                                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                                            placeholder="johndoe"
                                                        />
                                                    </div>

                                                    <div className={styles.field}>
                                                        <Input
                                                            label={t('settings.form.email')}
                                                            type="email"
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
                                                            {t('settings.cancel')}
                                                        </Button>
                                                        <Button
                                                            type="submit"
                                                            disabled={loading}
                                                            variant="primary"
                                                            isLoading={loading}
                                                        >
                                                            {t('settings.form.save')}
                                                        </Button>
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
                                                    <Button
                                                        onClick={() => setIsChangingPassword(true)}
                                                        variant="ghost"
                                                        size="sm"
                                                    >
                                                        {t('settings.change_password')}
                                                    </Button>
                                                )}
                                            </div>

                                            {isChangingPassword ? (
                                                <form onSubmit={handleChangePassword} className={styles.form} autoComplete="off">
                                                    <div className={styles.field}>
                                                        <Input
                                                            label={t('settings.form.current_password')}
                                                            type="password"
                                                            value={passwordData.currentPassword}
                                                            onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                                            placeholder="••••••••"
                                                            autoComplete="off"
                                                        />
                                                    </div>

                                                    <div className={styles.field}>
                                                        <Input
                                                            label={t('settings.form.new_password')}
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
                                                            label={t('settings.form.confirm_password')}
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
                                                            {t('settings.cancel')}
                                                        </Button>
                                                        <Button
                                                            type="submit"
                                                            disabled={loading}
                                                            variant="primary"
                                                            isLoading={loading}
                                                        >
                                                            {t('settings.form.update_password')}
                                                        </Button>
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
                            </div>

                            {/* Notifications Section */}
                            {/* 
                            <div className="card animate-entrance">
                                <div className="card-body">
                                    <div className={styles.section_header}>
                                        <i className={`bx bx-bell ${styles.section_icon}`}></i>
                                        <div>
                                            <h2 className={styles.section_title}>{t('settings.notifications')}</h2>
                                            <p className={styles.section_desc}>{t('settings.notifications.desc')}</p>
                                        </div>
                                    </div>

                                    <div className={styles.options_list}>
                                        <div className={styles.option_item}>
                                            <div className={styles.option_info}>
                                                <div className={styles.option_title}>{t('settings.notifications.email')}</div>
                                                <div className={styles.option_desc}>{t('settings.notifications.email.desc')}</div>
                                            </div>
                                            <label className={styles.toggle_switch}>
                                                <input
                                                    type="checkbox"
                                                    checked={notificationPrefs.email}
                                                    onChange={() => handleNotificationChange('email')}
                                                />
                                                <span className={styles.toggle_slider}></span>
                                            </label>
                                        </div>

                                        <div className={styles.option_item}>
                                            <div className={styles.option_info}>
                                                <div className={styles.option_title}>{t('settings.notifications.push')}</div>
                                                <div className={styles.option_desc}>{t('settings.notifications.push.desc')}</div>
                                            </div>
                                            <label className={styles.toggle_switch}>
                                                <input
                                                    type="checkbox"
                                                    checked={notificationPrefs.push}
                                                    onChange={() => handleNotificationChange('push')}
                                                />
                                                <span className={styles.toggle_slider}></span>
                                            </label>
                                        </div>

                                        <div className={styles.option_item}>
                                            <div className={styles.option_info}>
                                                <div className={styles.option_title}>{t('settings.notifications.forum')}</div>
                                                <div className={styles.option_desc}>{t('settings.notifications.forum.desc')}</div>
                                            </div>
                                            <label className={styles.toggle_switch}>
                                                <input
                                                    type="checkbox"
                                                    checked={notificationPrefs.forum}
                                                    onChange={() => handleNotificationChange('forum')}
                                                />
                                                <span className={styles.toggle_slider}></span>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            */}

                            {/* Privacy Section */}
                            {/* 
                            <div className="card animate-entrance">
                                <div className="card-body">
                                    <div className={styles.section_header}>
                                        <i className={`bx bx-lock-alt ${styles.section_icon}`}></i>
                                        <div>
                                            <h2 className={styles.section_title}>{t('settings.privacy')}</h2>
                                            <p className={styles.section_desc}>{t('settings.privacy.desc')}</p>
                                        </div>
                                    </div>

                                    <div className={styles.options_list}>
                                        <div className={styles.option_item}>
                                            <div className={styles.option_info}>
                                                <div className={styles.option_title}>{t('settings.privacy.profile')}</div>
                                                <div className={styles.option_desc}>{t('settings.privacy.profile.desc')}</div>
                                            </div>
                                            <label className={styles.toggle_switch}>
                                                <input
                                                    type="checkbox"
                                                    checked={privacySettings.publicProfile}
                                                    onChange={() => handlePrivacyChange('publicProfile')}
                                                />
                                                <span className={styles.toggle_slider}></span>
                                            </label>
                                        </div>

                                        <div className={styles.option_item}>
                                            <div className={styles.option_info}>
                                                <div className={styles.option_title}>{t('settings.privacy.activity')}</div>
                                                <div className={styles.option_desc}>{t('settings.privacy.activity.desc')}</div>
                                            </div>
                                            <label className={styles.toggle_switch}>
                                                <input
                                                    type="checkbox"
                                                    checked={privacySettings.showActivity}
                                                    onChange={() => handlePrivacyChange('showActivity')}
                                                />
                                                <span className={styles.toggle_slider}></span>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            */}

                            {/* Account Stats Section */}
                            <div className={styles.settings_section}>
                                <div className="card animate-entrance">
                                    <div className="card-body">
                                        <div className={styles.section_header}>
                                            <i className={`bx bx-file-detail ${styles.section_icon}`}></i>
                                            <div>
                                                <h2 className={styles.section_title}>{t('settings.account')}</h2>
                                            </div>
                                        </div>

                                        <div className={styles.info_display}>
                                            <div className={styles.info_item}>
                                                <div className={styles.info_label}>{t('settings.account.created')}</div>
                                                <div className={styles.info_value}>
                                                    {new Date(user.created_at).toLocaleDateString()}
                                                </div>
                                            </div>

                                            <div className={styles.info_item}>
                                                <div className={styles.info_label}>{t('settings.account.last_login')}</div>
                                                <div className={styles.info_value}>
                                                    {user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString() : '-'}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                {/* Spotify Integration Section */}
                                <div className="card animate-entrance">
                                    <div className="card-body">
                                        <div className={styles.section_header}>
                                            <i className={`bxl bx-spotify ${styles.section_icon} ${styles.spotify_icon}`}></i>
                                            <div>
                                                <h2 className={styles.section_title}>{t('spotify.title')}</h2>
                                            </div>
                                        </div>

                                        <div className={styles.info_display}>
                                            <div className={styles.info_item}>
                                                <div className={styles.info_label}>
                                                    {token ? t('spotify.connected_as') : t('spotify.not_connected')}
                                                </div>
                                                <div className={styles.info_value}>
                                                    {token ? t('spotify.enjoy_music') : t('spotify.connect_desc')}
                                                </div>
                                            </div>
                                            <Button
                                                onClick={token ? logout : login}
                                                variant={token ? "outline" : "primary"}
                                                className={!token ? styles.spotify_button : ""}
                                            >
                                                {token ? t('spotify.disconnect') : t('spotify.connect')}
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
