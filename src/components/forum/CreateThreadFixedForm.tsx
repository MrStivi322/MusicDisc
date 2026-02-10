
"use client"

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import styles from '@/styles/components/forum/CreateThreadFixedForm.module.css'
import { ForumService } from '@/services/ForumService'
import { useAuth } from '@/components/AuthProvider'
import { useLanguage } from '@/contexts/LanguageContext'
import type { ForumCategory } from '@/lib/database.types'

interface CreateThreadFormProps {
    categories: ForumCategory[]
    onSuccess?: () => void
    onCancel?: () => void
}

const MAX_CHARS = 1000
const MAX_IMAGE_SIZE = 5 * 1024 * 1024 // 5MB
const MAX_VIDEO_SIZE = 20 * 1024 * 1024 // 20MB

export function CreateThreadFixedForm({ categories, onSuccess, onCancel }: CreateThreadFormProps) {
    const router = useRouter()
    const { user } = useAuth()
    const { t } = useLanguage()

    const [title, setTitle] = useState('')
    const [content, setContent] = useState('')
    const [categoryId, setCategoryId] = useState(categories[0]?.id || '')
    const [file, setFile] = useState<File | null>(null)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const text = e.target.value
        if (text.length <= MAX_CHARS) {
            setContent(text)
        }
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0]
        if (!selectedFile) return

        const isImage = selectedFile.type.startsWith('image/')
        const isVideo = selectedFile.type.startsWith('video/')

        if (!isImage && !isVideo) {
            setError(t('forum.create.error.file_type'))
            return
        }

        const maxSize = isImage ? MAX_IMAGE_SIZE : MAX_VIDEO_SIZE
        if (selectedFile.size > maxSize) {
            setError(t('forum.create.error.file_size').replace('{size}', isImage ? '5MB' : '20MB'))
            return
        }

        setError(null)
        setFile(selectedFile)
        setPreviewUrl(URL.createObjectURL(selectedFile))
    }

    const removeFile = () => {
        setFile(null)
        if (previewUrl) URL.revokeObjectURL(previewUrl)
        setPreviewUrl(null)
        if (fileInputRef.current) fileInputRef.current.value = ''
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!user) return
        if (!title.trim() || !content.trim()) {
            setError(t('forum.create.error.required'))
            return
        }

        setIsSubmitting(true)
        setError(null)

        try {
            let mediaUrl = undefined
            let mediaType: 'image' | 'video' | undefined = undefined

            if (file) {
                mediaUrl = await ForumService.uploadMedia(file)
                mediaType = file.type.startsWith('image/') ? 'image' : 'video'
            }

            await ForumService.createThread({
                title,
                content,
                category_id: categoryId,
                author_id: user.id,
                media_url: mediaUrl,
                media_type: mediaType
            })

            router.refresh()
            if (onSuccess) onSuccess()
        } catch (err: any) {
            console.error('Detailed Thread Creation Error:', err)
            if (err && typeof err === 'object') {
                console.error('Error properties:', Object.keys(err))
                console.error('Error stringified:', JSON.stringify(err, null, 2))
            }
            setError(err.message || err.details || t('forum.create.error.generic'))
        } finally {
            setIsSubmitting(false)
        }
    }

    if (!user) {
        return <p className={styles.error_message}>{t('forum.create.login_required')}</p>
    }

    return (
        <form onSubmit={handleSubmit} className={styles.form_container}>

            {error && <div className={styles.error_message}>{error}</div>}

            <div className={styles.field_group}>
                <label className={styles.label} htmlFor="title">{t('forum.create.title')}</label>
                <input
                    id="title"
                    type="text"
                    className={styles.input}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder={t('forum.create.title_placeholder')}
                    maxLength={100}
                    required
                />
            </div>

            <div className={styles.field_group}>
                <label className={styles.label} htmlFor="category">{t('forum.create.category')}</label>
                <select
                    id="category"
                    className={styles.select}
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                >
                    {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                </select>
            </div>

            <div className={styles.field_group}>
                <label className={styles.label} htmlFor="content">{t('forum.create.content')}</label>
                <textarea
                    id="content"
                    className={styles.textarea}
                    value={content}
                    onChange={handleContentChange}
                    placeholder={t('forum.create.content_placeholder')}
                    required
                />
                <div className={`${styles.char_counter} ${content.length > MAX_CHARS * 0.9 ? styles.limit_near : ''}`}>
                    {content.length} / {MAX_CHARS}
                </div>
            </div>

            <div className={styles.field_group}>
                <label className={styles.label}>{t('forum.create.multimedia')}</label>
                <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*,video/*"
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                />

                {!file ? (
                    <div
                        className={styles.file_upload_area}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <i className='bx bx-folder-up-arrow' style={{ fontSize: '2rem', marginBottom: '0.5rem' }}></i>
                        <p>{t('forum.create.upload_text')}</p>
                    </div>
                ) : (
                    <div className={styles.file_preview}>
                        {file.type.startsWith('image/') ? (
                            <Image
                                src={previewUrl!}
                                alt={t('forum.create.preview')}
                                width={400}
                                height={300}
                                className={styles.preview_image}
                            />
                        ) : (
                            <video src={previewUrl!} controls className={styles.preview_image} />
                        )}
                        <button type="button" onClick={removeFile} className={styles.remove_file}>
                            <i className='bx bx-x'></i>
                        </button>
                    </div>
                )}
            </div>

            <div className={styles.buttons_row}>
                {onCancel && (
                    <button
                        type="button"
                        onClick={onCancel}
                        className="btn btn-outline btn-md"
                        disabled={isSubmitting}
                    >
                        {t('common.cancel')}
                    </button>
                )}
                <button
                    type="submit"
                    className="btn btn-primary btn-md"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? t('forum.create.posting') : t('forum.create.publish')}
                </button>
            </div>
        </form>
    )
}
