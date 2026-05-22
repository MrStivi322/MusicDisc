
"use client"

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import styles from '@/styles/forum/Forum.module.css'
import { ForumService } from '@/services/ForumService'
import { useAuth } from '@/components/AuthProvider'

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
            setError("Tipo de archivo no permitido. Solo se permiten imágenes o videos.")
            return
        }

        const maxSize = isImage ? MAX_IMAGE_SIZE : MAX_VIDEO_SIZE
        if (selectedFile.size > maxSize) {
            setError(`El archivo supera el tamaño máximo permitido de ${isImage ? '5MB' : '20MB'}.`)
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
            setError("El título y el contenido son campos requeridos.")
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
            setError(err.message || err.details || "Ha ocurrido un error al intentar crear la discusión.")
        } finally {
            setIsSubmitting(false)
        }
    }

    if (!user) {
        return <p className={styles.error_message}>Debes iniciar sesión para publicar en el foro.</p>
    }

    return (
        <form onSubmit={handleSubmit} className={styles.form_container}>


            <div className={styles.field_group}>
                <label className={styles.label} htmlFor="title">Título de la discusión</label>
                <input
                    id="title"
                    type="text"
                    className={styles.input}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Escribe un título claro y conciso"
                    maxLength={150}
                    required
                />
                <div className={`${styles.char_counter} ${title.length > 135 ? styles.limit_near : ''}`}>
                    {title.length} / 150
                </div>
            </div>

            <div className={styles.field_group}>
                <label className={styles.label}>Categoría</label>
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
                <label className={styles.label} htmlFor="content">Contenido</label>
                <textarea
                    id="content"
                    className={styles.textarea}
                    value={content}
                    onChange={handleContentChange}
                    onInput={handleTextareaInput}
                    placeholder="¿De qué quieres hablar?"
                    required
                    rows={6}
                />
                <div className={`${styles.char_counter} ${content.length > MAX_CHARS * 0.9 ? styles.limit_near : ''}`}>
                    {content.length} / {MAX_CHARS}
                </div>
            </div>

            <div className={styles.field_group}>
                <label className={styles.label}>Multimedia (opcional)</label>
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
                        <i className='bx bx-folder-up-arrow bx-remove-padding' style={{ fontSize: '2rem', marginBottom: '0.5rem' }}></i>
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

            {error && <div className={styles.error_message}>{error}</div>}
            <div className={styles.buttons_row}>
                {onCancel && (
                    <button
                        type="button"
                        onClick={onCancel}
                        className="btn btn-outline btn-md"
                        disabled={isSubmitting}
                    >
                        Cancelar
                    </button>
                )}
                <button
                    type="submit"
                    className="btn btn-primary btn-md"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? "Publicando..." : "Publicar"}
                </button>
            </div>
        </form>
    )
}
