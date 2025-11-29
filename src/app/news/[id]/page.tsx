"use client"

import { useState, useEffect } from "react"
import { supabase, fetchNewsWithCache } from "@/lib/supabase"
import { useAuth } from "@/components/AuthProvider"
import type { News, Comment } from "@/lib/database.types"
import Link from "next/link"
import styles from "@/styles/pages/NewsDetail.module.css"
import { SkeletonNewsDetail } from "@/components/SkeletonLoader"
import { useLanguage } from "@/contexts/LanguageContext"
import DOMPurify from 'isomorphic-dompurify'

const COMMENTS_PER_PAGE = 10;

export default function NewsDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { t, language } = useLanguage()
    const [article, setArticle] = useState<News | null>(null)
    const [comments, setComments] = useState<Comment[]>([])
    const [newComment, setNewComment] = useState("")
    const [loading, setLoading] = useState(false)
    const { user } = useAuth()
    const [resolvedParams, setResolvedParams] = useState<{ id: string } | null>(null)
    const [commentsPage, setCommentsPage] = useState(1)
    const [hasMoreComments, setHasMoreComments] = useState(true)
    const [loadingMoreComments, setLoadingMoreComments] = useState(false)

    useEffect(() => {
        params.then(setResolvedParams)
    }, [params])

    useEffect(() => {
        if (resolvedParams) {
            fetchArticle()
            fetchComments(1, true)
        }
    }, [resolvedParams])

    async function fetchArticle() {
        if (!resolvedParams) return

        const { data, error } = await fetchNewsWithCache(resolvedParams.id)

        if (!error && data) {
            setArticle(data)

            supabase
                .from('news')
                .update({ views_count: (data.views_count || 0) + 1 })
                .eq('id', resolvedParams.id)
                .then(() => { })
        }
    }

    async function fetchComments(page: number = 1, reset: boolean = false) {
        if (!resolvedParams) return

        if (reset) {
            setLoading(true)
        } else {
            setLoadingMoreComments(true)
        }

        const from = (page - 1) * COMMENTS_PER_PAGE
        const to = from + COMMENTS_PER_PAGE - 1

        const { data, error, count } = await supabase
            .from('comments')
            .select('*, profiles(username, avatar_url, email)', { count: 'exact' })
            .eq('news_id', resolvedParams.id)
            .order('created_at', { ascending: false })
            .range(from, to)

        if (!error && data) {
            if (reset) {
                setComments(data)
            } else {
                setComments(prev => [...prev, ...data])
            }

            const totalLoaded = reset ? data.length : comments.length + data.length
            setHasMoreComments(totalLoaded < (count || 0))
        }

        setLoading(false)
        setLoadingMoreComments(false)
    }

    async function handleSubmitComment(e: React.FormEvent) {
        e.preventDefault()
        if (!user || !newComment.trim() || !resolvedParams) return

        setLoading(true)

        const { data, error } = await supabase
            .from('comments')
            .insert([
                {
                    news_id: parseInt(resolvedParams.id),
                    user_id: user.id,
                    content: newComment.trim()
                }
            ])
            .select()

        if (!error) {
            setNewComment("")
            setCommentsPage(1)
            fetchComments(1, true)
        } else {
            console.error('Error posting comment:', {
                message: error.message,
                details: error.details,
                hint: error.hint,
                code: error.code
            })
            alert(`Failed to post comment: ${error.message || 'Unknown error'}`)
        }

        setLoading(false)
    }

    function handleLoadMoreComments() {
        const nextPage = commentsPage + 1
        setCommentsPage(nextPage)
        fetchComments(nextPage, false)
    }

    if (!article) {
        return (
            <main className={styles.main}>
                <SkeletonNewsDetail />
            </main>
        )
    }

    return (
        <main className={styles.main}>
            <div className={styles.container}>
                <div className={styles.content}>
                    <div className={styles.header_grid}>
                        <div className={styles.image_section}>
                            {article.image_url ? (
                                <div className={styles.hero_image}>
                                    <img src={article.image_url} alt={article.title} />
                                </div>
                            ) : (
                                <div className={styles.hero_image} />
                            )}
                        </div>

                        <div className={styles.meta_section}>
                            <h1 className={styles.title}>{article.title}</h1>

                            <div className={styles.meta}>
                                <div className={styles.meta_item}>
                                    <i className={`bx bx-calendar-alt ${styles.meta_icon}`}></i>
                                    <time>{new Date(article.published_at).toLocaleDateString(language, { month: 'long', day: 'numeric', year: 'numeric' })}</time>
                                </div>
                                {article.author && (
                                    <div className={styles.meta_item}>
                                        <i className={`bx bx-user ${styles.meta_icon}`}></i>
                                        <span>{article.author}</span>
                                    </div>
                                )}
                                <div className={styles.meta_item}>
                                    <i className={`bx bx-eye ${styles.meta_icon}`}></i>
                                    <span>{article.views_count || 0} {t('news.views')}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className={styles.content_section}>
                        {article.content && (
                            <div
                                className={styles.article_content}
                                dangerouslySetInnerHTML={{
                                    __html: DOMPurify.sanitize(article.content, {
                                        ALLOWED_TAGS: ['strong', 'em', 'b', 'i', 'u', 'br', 'p', 'span', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li'],
                                        ALLOWED_ATTR: ['style', 'class']
                                    })
                                }}
                            />
                        )}
                    </div>

                    <div className={styles.comments_container}>
                        <div className={styles.comments_section}>
                            <h3 className={styles.comments_header}>
                                <i className={`bx bx-message-dots ${styles.comments_icon}`}></i>
                                {t('news.comments.title')} ({comments.length})
                            </h3>

                            {user ? (
                                <form onSubmit={handleSubmitComment} className={styles.comment_form}>
                                    <textarea
                                        value={newComment}
                                        onChange={(e) => setNewComment(e.target.value)}
                                        className={styles.textarea}
                                        placeholder={t('news.comments.placeholder')}
                                    />
                                    <button
                                        type="submit"
                                        disabled={!newComment.trim() || loading}
                                        className={styles.submit_button}
                                    >
                                        {loading ? t('news.comments.posting') : t('news.comments.post')}
                                    </button>
                                </form>
                            ) : (
                                <div className={styles.login_prompt}>
                                    <p><Link href="/login" className={styles.login_link}>{t('news.comments.login_prompt')}</Link></p>
                                </div>
                            )}

                            <div className={styles.comments_list}>
                                {comments.map((comment) => (
                                    <div key={comment.id} className={styles.comment}>
                                        <div className={styles.comment_header}>
                                            <div className={styles.author_avatar}>
                                                {comment.profiles?.avatar_url ? (
                                                    <img
                                                        src={comment.profiles.avatar_url}
                                                        alt="Avatar"
                                                        className={styles.avatar_img}
                                                        loading="lazy"
                                                    />
                                                ) : (
                                                    comment.profiles?.username?.charAt(0).toUpperCase() ||
                                                    comment.profiles?.email?.charAt(0).toUpperCase() || 'U'
                                                )}
                                            </div>
                                            <div className={styles.comment_meta}>
                                                <div className={styles.comment_author}>
                                                    {comment.profiles?.username || 'Anonymous'}
                                                </div>
                                                <div className={styles.comment_date}>
                                                    {new Date(comment.created_at).toLocaleDateString(language)}
                                                </div>
                                            </div>
                                        </div>
                                        <p className={styles.comment_content}>{comment.content}</p>
                                    </div>
                                ))}

                                {comments.length === 0 && (
                                    <p className={styles.empty_comments}>{t('news.comments.empty')}</p>
                                )}

                                {hasMoreComments && comments.length > 0 && (
                                    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem' }}>
                                        <button
                                            onClick={handleLoadMoreComments}
                                            disabled={loadingMoreComments}
                                            style={{
                                                padding: '0.75rem 1.5rem',
                                                fontSize: '0.9rem',
                                                fontWeight: '600',
                                                borderRadius: '8px',
                                                border: 'none',
                                                background: 'rgba(255, 255, 255, 0.1)',
                                                color: 'white',
                                                cursor: loadingMoreComments ? 'not-allowed' : 'pointer',
                                                opacity: loadingMoreComments ? 0.6 : 1,
                                                transition: 'all 0.3s ease'
                                            }}
                                        >
                                            {loadingMoreComments ? 'Loading...' : 'Load More Comments'}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    )
}
