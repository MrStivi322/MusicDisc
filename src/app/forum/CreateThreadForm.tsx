
"use client"

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import styles from '@/styles/forum/Forum.module.css'
import { ForumService } from '@/services/ForumService'
import { useAuth } from '@/components/AuthProvider'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useNotification } from '@/contexts/NotificationContext'

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
    const { showNotification } = useNotification()

    const [title, setTitle] = useState('')
    const [content, setContent] = useState('')
    const [categoryId, setCategoryId] = useState(categories[0]?.id || '')
    const [file, setFile] = useState<File | null>(null)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const text = e.target.value
        if (text.length <= MAX_CHARS) {
            setContent(text)
        }
    }

    const handleTextareaInput = (e: React.FormEvent<HTMLTextAreaElement>) => {
        const target = e.currentTarget
        target.style.height = 'auto'
        target.style.height = `${target.scrollHeight}px`
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0]
        if (!selectedFile) return

        const isImage = selectedFile.type.startsWith('image/')
        const isVideo = selectedFile.type.startsWith('video/')

        if (!isImage && !isVideo) {
            showNotification("Formato de archivo no permitido.", "error")
            return
        }

        const maxSize = isImage ? MAX_IMAGE_SIZE : MAX_VIDEO_SIZE
        if (selectedFile.size > maxSize) {
            showNotification(`El archivo supera el máximo permitido ${isImage ? '5MB' : '20MB'}.`, "error")
            return
        }

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

        setIsSubmitting(true)

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
            showNotification(err.message || err.details || "Ha ocurrido un error.", "error")
        } finally {
            setIsSubmitting(false)
        }
    }

    if (!user) {
        return (
            <div className={styles.form_container}>
                <p className="empty-text">Debes iniciar sesión para publicar.</p>
            </div>
        )
    }

    return (
        <form onSubmit={handleSubmit} className={styles.form_container}>

            <div className={styles.field_group}>
                <label className="input-label">Título del post</label>
                <Input id="title" type="text" value={title} onChange={(e) => setTitle(e.target.value)}
                    placeholder="Tres tristes tigres tragaban en un trigal..." maxLength={150} required/>
                <div className={`${styles.char_counter} ${title.length > 135 ? styles.limit_near : ''}`}>
                    {title.length} / 150
                </div>
            </div>

            <div className={styles.field_group}>
                <label className="input-label">Categoría</label>
                <div className={styles.category_grid}>
                    {categories.map(cat => (
                        <div
                            key={cat.id}
                            className={`${styles.category_card} ${categoryId === cat.id ? styles.selected : ''}`}
                            onClick={() => setCategoryId(cat.id)}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault()
                                    setCategoryId(cat.id)
                                }
                            }}
                        >
                            <i className={`bx ${cat.icon} ${styles.category_icon} bx-remove-padding`}></i>
                            <span className={styles.category_name}>{cat.name}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className={styles.field_group}>
                <label className="input-label" htmlFor="content">Contenido</label>
                <textarea id="content" className="form-control" value={content} onChange={handleContentChange}
                    onInput={handleTextareaInput} placeholder="¿De qué quieres hablar?" required rows={6}/>
                <div className={`${styles.char_counter} ${content.length > MAX_CHARS * 0.9 ? styles.limit_near : ''}`}>
                    {content.length} / {MAX_CHARS}
                </div>
            </div>

            <div className={styles.field_group}>
                <label className="input-label">Multimedia (opcional)</label>
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
                        <i className='bx bx-folder-up-arrow bx-remove-padding'></i>
                        <p>Arrastra y suelta una imagen o video, o haz clic para buscar</p>
                    </div>
                ) : (
                    <div className={styles.file_preview}>
                        {file.type.startsWith('image/') ? (
                            <Image
                                src={previewUrl!}
                                alt="Vista previa"
                                width={400}
                                height={300}
                                className={styles.preview_image}
                            />
                        ) : (
                            <video src={previewUrl!} controls className={styles.preview_image} />
                        )}
                        <button type="button" onClick={removeFile} className={styles.remove_file}>
                            <i className='bx bx-x bx-remove-padding'></i>
                        </button>
                    </div>
                )}
            </div>

            <div className={styles.buttons_row}>
                {onCancel && (
                    <Button
                        type="button"
                        onClick={onCancel}
                        variant="outline"
                        disabled={isSubmitting}
                    >
                        Cancelar
                    </Button>
                )}
                <Button
                    type="submit"
                    variant="primary"
                    disabled={isSubmitting}
                    isLoading={isSubmitting}
                >
                    Publicar
                </Button>
            </div>
        </form>
    )
}
