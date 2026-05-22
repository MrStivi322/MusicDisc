"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import styles from '@/styles/forum/ThreadView.module.css'
import type { ForumThread, ForumComment } from '@/lib/database.types'
import { formatRelativeTime } from '@/lib/utils'
import { ForumService } from '@/services/ForumService'
import { useAuth } from '@/components/AuthProvider'

import { sanitizeHTMLWithLinks } from '@/lib/sanitizeWithLinks'
import { Modal } from '@/app/forum/Modal'
import { ZoomableImage } from '@/components/ui/ZoomableImage'

interface CommentWithLikes extends ForumComment {
    isLiked?: boolean;
    replies?: CommentWithLikes[];
}

interface ThreadViewProps {
    thread: ForumThread
    initialComments: ForumComment[]
}

const UserAvatar = ({ url, username, size = 32, className }: { url?: string | null, username?: string | null, size?: number, className?: string }) => {
    if (url) {
        return (
            <Image
                src={url}
                alt={username || 'User'}
                width={size}
                height={size}
                className={className}
                style={{ borderRadius: 'var(--radius-full)', objectFit: 'cover' }}
            />
        )
    }
    return (
        <div
            className={className}
            style={{
                width: size,
                height: size,
                borderRadius: 'var(--radius-full)',
                background: 'var(--color-primary)',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: size * 0.45
            }}
        >
            {(username?.[0] || '?').toUpperCase()}
        </div>
    )
}

const CollapsibleSection = ({
    title,
    icon,
    children,
    className,
    defaultOpen = true
}: {
    title: string,
    icon: string,
    children: React.ReactNode,
    className?: string,
    defaultOpen?: boolean
}) => {
    const [isOpen, setIsOpen] = useState(defaultOpen)

    return (
        <div className={className}>
            <div
                className={`${styles.section_header} ${isOpen ? styles.open : ''}`}
                onClick={() => setIsOpen(!isOpen)}
            >
                <h2 className={styles.section_title}>{title}</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <i className={`${icon} ${styles.section_icon}`}></i>
                    <i className={`bx bx-chevron-down bx-remove-padding ${styles.dropdown_chevron} ${isOpen ? styles.rotate : ''}`}></i>
                </div>
            </div>
            <div className={`${styles.collapsible_content} ${isOpen ? styles.open : ''}`}>
                {children}
            </div>
        </div>
    )
}

export function ThreadView({ thread, initialComments }: ThreadViewProps) {
    const router = useRouter()
    const { user } = useAuth()


    const [likesCount, setLikesCount] = useState(thread.likes_count || 0)
    const [viewsCount, setViewsCount] = useState(thread.views_count || 0)
    const [isLiked, setIsLiked] = useState(thread.user_has_liked || false)
    const [isLikeLoading, setIsLikeLoading] = useState(false)
    const [showImageModal, setShowImageModal] = useState(false)

    const [comments, setComments] = useState<CommentWithLikes[]>(initialComments)
    const [newComment, setNewComment] = useState('')
    const [replyingTo, setReplyingTo] = useState<string | null>(null)
    const [replyContent, setReplyContent] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [likesState, setLikesState] = useState<Record<string, boolean>>({})
    const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({})
    const [isInputFocused, setIsInputFocused] = useState(false)

    const [relatedThreads, setRelatedThreads] = useState<Partial<ForumThread>[]>([])

    const isNew = (new Date().getTime() - new Date(thread.created_at).getTime()) < (7 * 24 * 60 * 60 * 1000)
    const isTrending = (thread.views_count > 50 || thread.likes_count > 10)
    useEffect(() => {
        const fetchRelated = async () => {
            const related = await ForumService.getRelatedThreads(thread.category_id || null, thread.id, 5)
            setRelatedThreads(related)
        }
        fetchRelated()
    }, [thread.id, thread.category_id])

    useEffect(() => {
        const incrementView = async () => {
            try {
                ForumService.incrementView(thread.id)
                setViewsCount(prev => prev + 1)
            } catch (e) {
                console.error("View increment failed", e)
            }
        }
        incrementView()
    }, [thread.id])

    useEffect(() => {
        if (user && thread.id) {
            ForumService.hasUserLiked(thread.id, user.id).then(liked => {
                setIsLiked(liked)
            })
        }
    }, [user, thread.id])

    useEffect(() => {
        if (user) {
            const loadLikes = async () => {
                const likes: Record<string, boolean> = {}
                for (const comment of comments) {
                    const isLiked = await ForumService.hasUserLikedComment(comment.id, user.id)
                    likes[comment.id] = isLiked
                }
                setLikesState(likes)
            }
            loadLikes()
        }
    }, [user, comments])

    const organizeComments = (commentsList: CommentWithLikes[]): CommentWithLikes[] => {
        const commentMap = new Map<string, CommentWithLikes>()
        const rootComments: CommentWithLikes[] = []

        commentsList.forEach(comment => {
            commentMap.set(comment.id, { ...comment, replies: [], isLiked: likesState[comment.id] })
        })

        commentsList.forEach(comment => {
            const commentWithReplies = commentMap.get(comment.id)!
            if (comment.parent_id && commentMap.has(comment.parent_id)) {
                const parent = commentMap.get(comment.parent_id)!
                parent.replies!.push(commentWithReplies)
            } else {
                rootComments.push(commentWithReplies)
            }
        })

        return rootComments
    }

    const handleTextareaInput = (e: React.FormEvent<HTMLTextAreaElement>) => {
        const target = e.currentTarget
        target.style.height = 'auto'
        target.style.height = `${target.scrollHeight}px`
    }

    const handleThreadLike = async () => {
        if (!user) {
            alert('Debes iniciar sesión para dar like')
            return
        }
        if (isLikeLoading) return

        setIsLikeLoading(true)
        const newIsLiked = !isLiked
        setIsLiked(newIsLiked)
        setLikesCount(prev => newIsLiked ? prev + 1 : prev - 1)

        try {
            await ForumService.toggleThreadLike(thread.id, user.id)
        } catch (error) {
            setIsLiked(!newIsLiked)
            setLikesCount(prev => !newIsLiked ? prev + 1 : prev - 1)
            console.error(error)
        } finally {
            setIsLikeLoading(false)
        }
    }

    const handleCommentSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault()
        if (!user || !newComment.trim()) return

        setIsSubmitting(true)
        try {
            const comment = await ForumService.createComment({
                content: newComment,
                thread_id: thread.id,
                author_id: user.id
            })
            setComments([...comments, comment])
            setNewComment('')
        } catch (error) {
            console.error('Error posting comment:', error)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleReply = async (parentId: string) => {
        if (!user || !replyContent.trim()) return

        setIsSubmitting(true)
        try {
            const reply = await ForumService.createComment({
                content: replyContent,
                thread_id: thread.id,
                author_id: user.id,
                parent_id: parentId
            })
            setComments([...comments, reply])
            setReplyContent('')
            setReplyingTo(null)
        } catch (error) {
            console.error('Error posting reply:', error)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleCommentLike = async (commentId: string) => {
        if (!user) {
            alert('Debes iniciar sesión para dar like')
            return
        }

        const currentLikeState = likesState[commentId] || false
        const newLikeState = !currentLikeState

        setLikesState(prev => ({ ...prev, [commentId]: newLikeState }))
        setComments(prev => prev.map(c =>
            c.id === commentId
                ? { ...c, likes_count: c.likes_count + (newLikeState ? 1 : -1) }
                : c
        ))

        try {
            await ForumService.toggleCommentLike(commentId, user.id)
        } catch (error) {
            setLikesState(prev => ({ ...prev, [commentId]: currentLikeState }))
            setComments(prev => prev.map(c =>
                c.id === commentId
                    ? { ...c, likes_count: c.likes_count + (currentLikeState ? 1 : -1) }
                    : c
            ))
            console.error(error)
        }
    }

    const toggleCommentExpansion = (commentId: string) => {
        setExpandedComments(prev => ({ ...prev, [commentId]: !prev[commentId] }))
    }

    const renderComment = (comment: CommentWithLikes, depth: number = 0) => {
        const hasReplies = comment.replies && comment.replies.length > 0
        const isExpanded = expandedComments[comment.id]

        return (
            <div key={comment.id} className={`${styles.comment} ${depth > 0 ? styles.reply : ''}`}>
                <div className={styles.comment_header}>
                    <div className={styles.comment_author}>
                        <UserAvatar
                            url={comment.author?.avatar_url}
                            username={comment.author?.username}
                            size={32}
                            className={styles.avatar_small}
                        />
                        <span className={styles.comment_username}>{comment.author?.username || 'Anónimo'}</span>
                        <span className={styles.comment_date}>
                            {formatRelativeTime(comment.created_at)}
                        </span>
                    </div>
                </div>
                <p className={styles.comment_content}>
                    {comment.content.split(/(https?:\/\/[^\s]+)/g).map((part, i) => (
                        part.match(/https?:\/\/[^\s]+/)
                            ? <a key={i} href={part} target="_blank" rel="noopener noreferrer" className={styles.link}>{part}</a>
                            : part
                    ))}
                </p>

                <div className={styles.comment_actions}>
                    <button
                        className={`btn btn-ghost btn-tn ${likesState[comment.id] ? styles.liked : ''}`}
                        onClick={() => handleCommentLike(comment.id)}
                    >
                        <i className={`${likesState[comment.id] ? 'bxf bx-like' : 'bx bx-like'} bx-remove-padding`}></i>
                        {comment.likes_count > 0 && <span>{comment.likes_count}</span>}
                    </button>

                    <button
                        className="btn btn-ghost btn-tn"
                        onClick={() => setReplyingTo(comment.id)}
                    >
                        <i className='bx bx-reply bx-remove-padding'></i>
                        Responder
                    </button>
                </div>

                {replyingTo === comment.id && (
                    <div className={styles.reply_form}>
                        <textarea
                            className={styles.reply_textarea}
                            placeholder="Escribe tu respuesta..."
                            value={replyContent}
                            onChange={(e) => setReplyContent(e.target.value)}
                            onInput={handleTextareaInput}
                            rows={1}
                            maxLength={200}
                            autoFocus
                        />
                        <div className={styles.reply_actions}>
                            <span className={`${styles.char_counter} ${replyContent.length >= 180 ? styles.char_limit_warning : ''} ${replyContent.length >= 200 ? styles.char_limit_reached : ''}`}>
                                {replyContent.length}/200
                            </span>
                            <button
                                onClick={() => {
                                    setReplyingTo(null)
                                    setReplyContent('')
                                }}
                                className="btn btn-ghost btn-sm"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={() => handleReply(comment.id)}
                                disabled={isSubmitting || !replyContent.trim()}
                                className="btn btn-primary btn-sm"
                            >
                                {isSubmitting ? 'Publicando...' : 'Responder'}
                            </button>
                        </div>
                    </div>
                )}

                {hasReplies && (
                    <>
                        <button
                            className={styles.view_replies_button}
                            onClick={() => toggleCommentExpansion(comment.id)}
                        >
                            {isExpanded
                                ? "Ocultar respuestas"
                                : `Ver respuestas (${comment.replies?.length || 0})`}
                            <i className={`bx ${isExpanded ? 'bx-chevron-up' : 'bx-chevron-down'} bx-remove-padding`}></i>
                        </button>

                        {isExpanded && (
                            <div className={depth === 0 ? styles.replies_container : styles.replies_container_nested}>
                                {comment.replies!.map(reply => renderComment(reply, depth + 1))}
                            </div>
                        )}
                    </>
                )}
            </div>
        )
    }

    const organizedComments = organizeComments(comments)


    return (

        <main className={styles.main}>
            <div className="page-container">
                <nav className="breadcrumbs" aria-label="Breadcrumb">
                    <Link href="/" className="breadcrumb-link">Inicio</Link>
                    <span className="breadcrumb-separator">/</span>
                    <Link href="/forum" className="breadcrumb-link">Comunidad</Link>
                    {thread.category && (
                        <>
                            <span className="breadcrumb-separator">/</span>
                            <Link href={`/forum?category=${thread.category.id}`} className="breadcrumb-link">
                                {thread.category.name}
                            </Link>
                        </>
                    )}
                    <span className="breadcrumb-separator">/</span>
                    <span className="breadcrumb-current">{thread.title}</span>
                </nav>

                <div className="navigation_header">
                    <button
                        onClick={() => router.push(thread.category ? `/forum?category=${thread.category.id}` : '/forum')}
                        className="back_button"
                    >
                        <i className='bx bx-arrow-to-left bx-remove-padding'></i>
                        {thread.category
                            ? `Volver a ${thread.category.name}`
                            : 'Volver a la comunidad'}
                    </button>
                </div>
            </div>

            <div className={styles.hero}>
                <div className={styles.hero_content}>
                    <div className={styles.hero_meta}>
                        {thread.category && (
                            <span className={`${styles.badge} ${styles.badge_category}`}>
                                <i className={`bx ${thread.category.icon} bx-remove-padding`}></i> {thread.category.name}
                            </span>
                        )}
                        {isNew && <span className={`${styles.badge} ${styles.badge_new}`}>New</span>}
                        {isTrending && <span className={`${styles.badge} ${styles.badge_trending}`}>Trending</span>}
                        <span className={styles.badge} style={{ background: 'var(--color-muted)', color: 'var(--color-muted-foreground)', border: '1px solid var(--color-border)' }}>
                            {formatRelativeTime(thread.created_at)}
                        </span>
                    </div>

                    <h1 className={styles.title}>{thread.title}</h1>

                    <div className={styles.hero_meta}>
                        <div className={styles.author_badge}>
                            <UserAvatar
                                url={thread.author?.avatar_url}
                                username={thread.author?.username}
                                size={24}
                                className={styles.avatar}
                            />
                            <span className={styles.username}>{thread.author?.username || 'Anónimo'}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className={styles.content_grid}>
                <div className={styles.main_wrapper}>
                    <CollapsibleSection
                        title="Contenido"
                        icon="bx bx-info-circle bx-remove-padding"
                        className={styles.section}
                    >
                        <div className={styles.discussion_content_grid}>
                            <div className={styles.text}>
                                <div
                                    dangerouslySetInnerHTML={{ __html: sanitizeHTMLWithLinks(thread.content) }}
                                />
                            </div>

                            {thread.media_url && (
                                <div className={styles.media_container}>
                                    {thread.media_type === 'image' ? (
                                        <>
                                            <div
                                                onClick={() => setShowImageModal(true)}
                                                role="button"
                                                tabIndex={0}
                                                onKeyDown={(e) => e.key === 'Enter' && setShowImageModal(true)}
                                                aria-label="Ver imagen completa"
                                                style={{ cursor: 'zoom-in' }}
                                            >
                                                <Image
                                                    src={thread.media_url}
                                                    alt="Imagen del hilo"
                                                    width={1200}
                                                    height={500}
                                                    className={styles.media_image}
                                                    priority
                                                />
                                                <div className={styles.image_overlay}>
                                                    <i className='bx bx-fullscreen bx-remove-padding'></i>
                                                    <span>Ver imagen completa</span>
                                                </div>
                                            </div>

                                            <Modal isOpen={showImageModal} onClose={() => setShowImageModal(false)} title="Imagen adjunta">
                                                <ZoomableImage
                                                    src={thread.media_url}
                                                    alt="Imagen del hilo"
                                                />
                                            </Modal>
                                        </>
                                    ) : (
                                        <video controls className={styles.media_video}>
                                            <source src={thread.media_url} type="video/mp4" />
                                            Video no soportado
                                        </video>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className={styles.discussion_footer_stats}>
                            <div className={styles.footer_stats_grid}>
                                <button
                                    className={`btn btn-primary ${styles.like_button}`}
                                    onClick={handleThreadLike}
                                    disabled={isLikeLoading}
                                    style={{ width: 'fit-content' }}
                                >
                                    <i className={`${isLiked ? 'bxf bx-like' : 'bx bx-like'} bx-remove-padding ${styles.like_icon}`}></i>
                                    <span>{likesCount} Me gusta</span>
                                </button>
                                <div className="btn btn-secondary">
                                    <span className={styles.stat_label}><i className='bx bx-eye'></i> {viewsCount} Vistas</span>
                                </div>
                            </div>
                        </div>
                    </CollapsibleSection>

                    <CollapsibleSection
                        title={`Comentarios (${comments.length})`}
                        icon="bx bx-message-dots bx-remove-padding"
                        className={styles.section}
                    >
                        <div className={styles.comments_wrapper}>
                            {user ? (
                                <div className={styles.comment_input_card}>
                                    <UserAvatar
                                        url={user.user_metadata.avatar_url}
                                        username={user.email || 'U'}
                                        size={40}
                                        className={styles.current_user_avatar}
                                    />
                                    <div className={styles.input_area}>
                                        <textarea
                                            className={styles.comment_textarea}
                                            placeholder="Comparte tu opinión..."
                                            value={newComment}
                                            onChange={(e) => setNewComment(e.target.value)}
                                            onInput={handleTextareaInput}
                                            rows={1}
                                            maxLength={200}
                                            onFocus={() => setIsInputFocused(true)}
                                            onBlur={() => !newComment && setIsInputFocused(false)}
                                        />
                                        {(isInputFocused || newComment.trim().length > 0) && (
                                            <div className={styles.input_actions}>
                                                <span className={`${styles.char_counter} ${newComment.length >= 180 ? styles.char_limit_warning : ''} ${newComment.length >= 200 ? styles.char_limit_reached : ''}`}>
                                                    {newComment.length}/200
                                                </span>
                                                <button
                                                    className="btn btn-primary btn-sm"
                                                    onClick={() => handleCommentSubmit()}
                                                    disabled={isSubmitting || newComment.trim().length === 0}
                                                >
                                                    {isSubmitting ? 'Posting...' : 'Post Comment'}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className={styles.login_prompt_inline}>
                                    <Link href="/auth?mode=login" className="link">Inicia sesión</Link> para comentar.
                                </div>
                            )}

                            <div className={styles.comments_list}>
                                {organizedComments.map(comment => renderComment(comment))}
                            </div>
                        </div>
                    </CollapsibleSection>
                </div>

                <aside className={styles.sidebar}>
                    <CollapsibleSection
                        title="Sugerencias"
                        icon="bx bx-light-bulb-alt bx-remove-padding"
                        className={styles.section}
                    >
                        <div className={styles.suggestions_list}>
                            {relatedThreads.length > 0 ? relatedThreads.map(related => (
                                <Link href={`/forum/thread/${related.slug}`} key={related.id} className={styles.suggestion_item}>
                                    <div className={styles.suggestion_icon}>
                                        <i className={`bx ${related.category?.icon || 'bx-hash'} bx-remove-padding`}></i>
                                    </div>
                                    <div className={styles.suggestion_content}>
                                        <div className={styles.suggestion_title} title={related.title}>{related.title}</div>
                                        <div className={styles.suggestion_meta}>
                                            <span>{formatRelativeTime(related.created_at || '')}</span>
                                        </div>
                                    </div>
                                </Link>
                            )) : (
                                <div className={styles.suggestion_item}>
                                    <div className={styles.suggestion_content}>
                                        <div className={styles.suggestion_meta} style={{ justifyContent: 'center' }}>No related threads found</div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </CollapsibleSection>
                </aside>
            </div>
        </main>
    )
}
