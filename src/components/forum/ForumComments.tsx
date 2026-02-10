"use client"

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { formatRelativeTime } from '@/lib/utils'
import { useAuth } from '@/components/AuthProvider'
import { ForumService } from '@/services/ForumService'
import { Modal } from '@/components/Modal'
import styles from '@/styles/components/forum/ThreadView.module.css'
import type { ForumComment } from '@/lib/database.types'
import { useLanguage } from '@/contexts/LanguageContext'

interface ForumCommentsProps {
    threadId: string
    initialComments: ForumComment[]
}

interface CommentWithLikes extends ForumComment {
    isLiked?: boolean
    replies?: CommentWithLikes[]
}

export function ForumComments({ threadId, initialComments }: ForumCommentsProps) {
    const { user } = useAuth()
    const { t } = useLanguage()
    const [comments, setComments] = useState<CommentWithLikes[]>(initialComments)
    const [newComment, setNewComment] = useState('')
    const [replyingTo, setReplyingTo] = useState<string | null>(null)
    const [replyContent, setReplyContent] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [likesState, setLikesState] = useState<Record<string, boolean>>({})

    // Load liked states for all comments
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

    // Organize comments into threaded structure
    const organizeComments = (commentsList: CommentWithLikes[]): CommentWithLikes[] => {
        const commentMap = new Map<string, CommentWithLikes>()
        const rootComments: CommentWithLikes[] = []

        // First pass: create all comment objects
        commentsList.forEach(comment => {
            commentMap.set(comment.id, { ...comment, replies: [], isLiked: likesState[comment.id] })
        })

        // Second pass: organize into tree structure
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!user || !newComment.trim()) return

        setIsSubmitting(true)
        try {
            const comment = await ForumService.createComment({
                content: newComment,
                thread_id: threadId,
                author_id: user.id
            })
            setComments([...comments, comment])
            setNewComment('')
            setIsModalOpen(false)
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
                thread_id: threadId,
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

    const handleLike = async (commentId: string) => {
        if (!user) {
            alert(t('forum.comments.login_to_like'))
            return
        }

        const currentLikeState = likesState[commentId] || false
        const newLikeState = !currentLikeState

        // Optimistic update
        setLikesState(prev => ({ ...prev, [commentId]: newLikeState }))
        setComments(prev => prev.map(c =>
            c.id === commentId
                ? { ...c, likes_count: c.likes_count + (newLikeState ? 1 : -1) }
                : c
        ))

        try {
            await ForumService.toggleCommentLike(commentId, user.id)
        } catch (error) {
            // Revert on error
            setLikesState(prev => ({ ...prev, [commentId]: currentLikeState }))
            setComments(prev => prev.map(c =>
                c.id === commentId
                    ? { ...c, likes_count: c.likes_count + (currentLikeState ? 1 : -1) }
                    : c
            ))
            console.error(error)
        }
    }

    const openModal = () => {
        setIsModalOpen(true)
    }

    const closeModal = () => {
        setIsModalOpen(false)
        setNewComment('')
    }

    const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({})

    const toggleReplies = (commentId: string) => {
        setExpandedComments(prev => ({
            ...prev,
            [commentId]: !prev[commentId]
        }))
    }

    const renderComment = (comment: CommentWithLikes, depth: number = 0) => {
        const hasReplies = comment.replies && comment.replies.length > 0
        const isExpanded = expandedComments[comment.id]

        return (
            <div key={comment.id} className={`${styles.comment} ${depth > 0 ? styles.reply : ''}`}>
                <div className={styles.comment_header}>
                    <div className={styles.comment_author}>
                        {comment.author?.avatar_url ? (
                            <Image
                                src={comment.author.avatar_url}
                                alt={comment.author.username || t('common.avatar')}
                                width={32}
                                height={32}
                                className={styles.avatar_small}
                            />
                        ) : (
                            <div className={styles.avatar_placeholder_small}>
                                {(comment.author?.username?.[0] || '?').toUpperCase()}
                            </div>
                        )}
                        <span className={styles.comment_username}>{comment.author?.username || t('forum.comments.deleted_user')}</span>
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
                        className={`btn btn-ghost btn-sm ${likesState[comment.id] ? styles.liked : ''}`}
                        onClick={() => handleLike(comment.id)}
                    >
                        <i className={`bx ${likesState[comment.id] ? 'bxs-heart' : 'bx-heart'}`}></i>
                        {comment.likes_count > 0 && <span>{comment.likes_count}</span>}
                    </button>

                    <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => setReplyingTo(comment.id)}
                    >
                        <i className='bx bx-reply'></i>
                        {t('forum.comments.reply')}
                    </button>
                </div>

                {replyingTo === comment.id && (
                    <div className={styles.reply_form}>
                        <textarea
                            className={styles.reply_textarea}
                            placeholder={t('forum.comments.reply_placeholder')}
                            value={replyContent}
                            onChange={(e) => setReplyContent(e.target.value)}
                            rows={3}
                        />
                        <div className={styles.reply_actions}>
                            <button
                                onClick={() => {
                                    setReplyingTo(null)
                                    setReplyContent('')
                                }}
                                className="btn btn-outline btn-sm"
                            >
                                {t('common.cancel')}
                            </button>
                            <button
                                onClick={() => handleReply(comment.id)}
                                disabled={isSubmitting || !replyContent.trim()}
                                className="btn btn-primary btn-sm"
                            >
                                {isSubmitting ? t('forum.comments.posting') : t('forum.comments.reply')}
                            </button>
                        </div>
                    </div>
                )}

                {hasReplies && (
                    <>
                        <button
                            className={styles.view_replies_button}
                            onClick={() => toggleReplies(comment.id)}
                        >
                            <span className={styles.line_connector}></span>
                            {isExpanded
                                ? t('forum.comments.hide_replies')
                                : t('forum.comments.view_replies').replace('{count}', comment.replies!.length.toString())}
                            <i className={`bx ${isExpanded ? 'bx-chevron-up' : 'bx-chevron-down'}`}></i>
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
        <section className={styles.comments_section}>
            <div className={styles.section_header}>
                <h3 className={styles.section_title}>
                    {t('forum.comments.title')} <span className={styles.count}>({comments.length})</span>
                </h3>
                {user ? (
                    <button onClick={openModal} className="btn btn-primary btn-md">
                        <i className='bx bx-message-bubble-plus'></i>
                        {t('forum.comments.write')}
                    </button>
                ) : (
                    <div className={styles.login_prompt_inline}>
                        {t('forum.comments.login_prompt')}
                    </div>
                )}
            </div>

            <Modal isOpen={isModalOpen} onClose={closeModal} title={t('forum.comments.write')}>
                <form onSubmit={handleSubmit} className={styles.modal_form}>
                    <div className={styles.user_info_modal}>
                        {user?.user_metadata.avatar_url ? (
                            <Image
                                src={user.user_metadata.avatar_url}
                                alt={t('common.me')}
                                width={40}
                                height={40}
                                className={styles.modal_avatar}
                            />
                        ) : (
                            <div className={styles.modal_avatar_placeholder}>
                                {(user?.email?.[0] || 'U').toUpperCase()}
                            </div>
                        )}
                        <span className={styles.posting_as}>{t('forum.comments.posting_as')} <strong>{user?.user_metadata.full_name || user?.email}</strong></span>
                    </div>

                    <textarea
                        className={styles.textarea_modal}
                        placeholder={t('forum.comments.share_opinion')}
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        rows={6}
                        autoFocus
                    />

                    <div className={styles.modal_actions}>
                        <button
                            type="button"
                            onClick={closeModal}
                            className="btn btn-outline btn-md"
                            disabled={isSubmitting}
                        >
                            {t('common.cancel')}
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary btn-md"
                            disabled={isSubmitting || !newComment.trim()}
                        >
                            {isSubmitting ? t('forum.comments.posting') : t('forum.comments.publish')}
                        </button>
                    </div>
                </form>
            </Modal>

            <div className={styles.comments_list}>
                {organizedComments.map(comment => renderComment(comment))}
            </div>
        </section>
    )
}
