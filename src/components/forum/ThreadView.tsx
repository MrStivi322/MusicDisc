"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import styles from '@/styles/components/forum/ThreadView.module.css'
import type { ForumThread, ForumComment } from '@/lib/database.types'
import { ForumComments } from '@/components/forum/ForumComments'
import { formatRelativeTime } from '@/lib/utils'
import { ForumService } from '@/services/ForumService'
import { useAuth } from '@/components/AuthProvider'
import { useLanguage } from '@/contexts/LanguageContext'
import { Modal } from '@/components/Modal'

interface ThreadViewProps {
    thread: ForumThread
    comments: ForumComment[]
}

export function ThreadView({ thread, comments }: ThreadViewProps) {
    const router = useRouter()
    const { user } = useAuth()
    const { t } = useLanguage()

    // Interactive State
    const [likesCount, setLikesCount] = useState(thread.likes_count || 0)
    const [viewsCount, setViewsCount] = useState(thread.views_count || 0)
    const [isLiked, setIsLiked] = useState(thread.user_has_liked || false)
    const [isLikeLoading, setIsLikeLoading] = useState(false)
    const [showImageModal, setShowImageModal] = useState(false)

    // Increment view on mount
    useEffect(() => {
        const incrementView = async () => {
            try {
                // We fire and forget the view increment
                ForumService.incrementView(thread.id)
                // Optimistically update view count for this session
                setViewsCount(prev => prev + 1)
            } catch (e) {
                console.error("View increment failed", e)
            }
        }
        incrementView()
    }, [thread.id])

    // Check if user has liked
    useEffect(() => {
        if (user && thread.id) {
            ForumService.hasUserLiked(thread.id, user.id).then(liked => {
                setIsLiked(liked)
            })
        }
    }, [user, thread.id])

    const handleLike = async () => {
        if (!user) {
            alert(t('forum.thread.login_to_like'))
            return
        }
        if (isLikeLoading) return

        setIsLikeLoading(true)

        // Optimistic update
        const newIsLiked = !isLiked
        setIsLiked(newIsLiked)
        setLikesCount(prev => newIsLiked ? prev + 1 : prev - 1)

        try {
            await ForumService.toggleThreadLike(thread.id, user.id)
        } catch (error) {
            // Revert on error
            setIsLiked(!newIsLiked)
            setLikesCount(prev => !newIsLiked ? prev + 1 : prev - 1)
            console.error(error)
        } finally {
            setIsLikeLoading(false)
        }
    }

    return (
        <div className={styles.container}>
            <div className={styles.top_section}>
                <nav className="breadcrumbs" aria-label="Breadcrumb">
                    <Link href="/" className="breadcrumb_link">{t('common.home')}</Link>
                    <span className="breadcrumb_separator">/</span>
                    <Link href="/forum" className="breadcrumb_link">{t('common.community')}</Link>
                    {thread.category && (
                        <>
                            <span className="breadcrumb_separator">/</span>
                            <Link href={`/forum?category=${thread.category.id}`} className="breadcrumb_link">
                                {thread.category.name}
                            </Link>
                        </>
                    )}
                    <span className="breadcrumb_separator">/</span>
                    <span className="breadcrumb_current">{thread.title}</span>
                </nav>

                <div className="navigation_header">
                    <button
                        onClick={() => router.push(thread.category ? `/forum?category=${thread.category.id}` : '/forum')}
                        className="back_button"
                    >
                        <i className='bx bx-arrow-to-left'></i>
                        {thread.category
                            ? t('forum.thread.back').replace('{category}', thread.category.name)
                            : t('forum.thread.back_community')}
                    </button>
                </div>
            </div>

            <div className={styles.content_grid}>
                <article className={styles.thread_content}>
                    <header className={styles.header}>
                        <div className={styles.meta_top}>
                            {thread.category && (
                                <span className={styles.category_badge}>
                                    <i className={`bx ${thread.category.icon}`}></i>
                                    {thread.category.name}
                                </span>
                            )}
                            <span className={styles.date}>
                                {t('forum.thread.published')} {formatRelativeTime(thread.created_at)}
                            </span>
                        </div>

                        <h1 className={styles.title}>{thread.title}</h1>

                        <div className={styles.author_row}>
                            {thread.author?.avatar_url ? (
                                <Image
                                    src={thread.author.avatar_url}
                                    alt={thread.author.username || t('common.avatar')}
                                    width={50}
                                    height={50}
                                    className={styles.avatar}
                                />
                            ) : (
                                <div className={styles.avatar_placeholder}>
                                    {(thread.author?.username?.[0] || '?').toUpperCase()}
                                </div>
                            )}
                            <div className={styles.author_info}>
                                <span className={styles.username}>{thread.author?.username || t('forum.card.anonymous')}</span>
                                <span className={styles.author_role}>{t('forum.thread.author')}</span>
                            </div>
                        </div>
                    </header>

                    <div className={styles.body}>
                        <p className={styles.text}>
                            {thread.content.split(/(https?:\/\/[^\s]+)/g).map((part, i) => (
                                part.match(/https?:\/\/[^\s]+/)
                                    ? <a key={i} href={part} target="_blank" rel="noopener noreferrer" className={styles.link}>{part}</a>
                                    : part
                            ))}
                        </p>

                        {thread.media_url && (
                            <div className={styles.media_container}>
                                {thread.media_type === 'image' ? (
                                    <>
                                        <div
                                            className={styles.image_wrapper_clickable}
                                            onClick={() => setShowImageModal(true)}
                                            role="button"
                                            tabIndex={0}
                                            onKeyDown={(e) => e.key === 'Enter' && setShowImageModal(true)}
                                            aria-label={t('forum.thread.image_full')}
                                        >
                                            <Image
                                                src={thread.media_url}
                                                alt={t('forum.thread.media_alt')}
                                                width={1200}
                                                height={800}
                                                className={styles.media_image}
                                                style={{ width: '100%', height: 'auto' }}
                                            />
                                            <div className={styles.image_overlay}>
                                                <i className='bx bx-expand-alt'></i>
                                                <span>{t('forum.thread.image_full')}</span>
                                            </div>
                                        </div>

                                        {/* Full size image modal */}
                                        <Modal isOpen={showImageModal} onClose={() => setShowImageModal(false)} title={t('forum.thread.image_attached')}>
                                            <div className={styles.modal_image_container}>
                                                <Image
                                                    src={thread.media_url}
                                                    alt={t('forum.thread.media_fullscreen')}
                                                    width={1920}
                                                    height={1080}
                                                    className={styles.modal_image}
                                                    style={{ objectFit: 'contain', width: '100%', height: 'auto', maxHeight: '85vh' }}
                                                />
                                            </div>
                                        </Modal>
                                    </>
                                ) : (
                                    <video controls className={styles.media_video}>
                                        <source src={thread.media_url} type="video/mp4" />
                                        {t('forum.thread.video_unsupported')}
                                    </video>
                                )}
                            </div>
                        )}
                    </div>

                    <footer className={styles.footer}>
                        <div className={styles.actions_toolbar}>
                            <button
                                className={`${styles.like_button} ${isLiked ? styles.liked : ''}`}
                                onClick={handleLike}
                                disabled={isLikeLoading}
                                aria-label={isLiked ? t('forum.thread.unlike') : t('forum.thread.like')}
                            >
                                <i className={`bx ${isLiked ? 'bxs-like' : 'bx-like'} ${styles.like_icon}`}></i>
                                <span>{likesCount} {t('forum.thread.like')}</span>
                            </button>

                            <div className={styles.stat_display} title={t('forum.thread.views_total')}>
                                <i className='bx bx-eye'></i>
                                {viewsCount} <span className="hidden sm:inline">{t('forum.thread.views')}</span>
                            </div>
                        </div>
                    </footer>
                </article>

                <aside className={styles.sidebar_wrapper}>
                    <ForumComments threadId={thread.id} initialComments={comments} />
                </aside>
            </div>
        </div>
    )
}
