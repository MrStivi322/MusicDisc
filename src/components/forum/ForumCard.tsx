import Link from 'next/link'
import Image from 'next/image'
import { formatRelativeTime } from '@/lib/utils'
import styles from '@/styles/components/forum/ForumCard.module.css'
import type { ForumThread } from '@/lib/database.types'
import { useLanguage } from '@/contexts/LanguageContext'

interface ForumCardProps {
    thread: ForumThread
}

export function ForumCard({ thread }: ForumCardProps) {
    const { t } = useLanguage()
    return (
        <Link href={`/forum/thread/${thread.slug}`} className={`${styles.card} ${thread.is_pinned ? styles.pinned : ''}`}>
            <div className={styles.header}>
                <div className={styles.author_info}>
                    {thread.author?.avatar_url ? (
                        <Image
                            src={thread.author.avatar_url}
                            alt={thread.author.username || t('common.avatar')}
                            width={32}
                            height={32}
                            className={styles.avatar}
                        />
                    ) : (
                        <div className={styles.avatar_placeholder}>
                            {(thread.author?.username?.[0] || '?').toUpperCase()}
                        </div>
                    )}
                    <span className={styles.username}>{thread.author?.username || t('forum.card.anonymous')}</span>
                    <span className={styles.dot}>•</span>
                    <span className={styles.date}>
                        {formatRelativeTime(thread.created_at)}
                    </span>
                </div>
                <div className={styles.badges}>
                    {thread.is_pinned && (
                        <span className={styles.pinned_badge}>
                            <i className='bx bxs-pin'></i>
                            {t('forum.card.pinned')}
                        </span>
                    )}
                    {thread.category && (
                        <span className={styles.category_badge}>
                            <i className={`bx ${thread.category.icon}`}></i>
                            {thread.category.name}
                        </span>
                    )}
                </div>
            </div>

            <h3 className={styles.title}>{thread.title}</h3>

            <p className={styles.preview}>
                {thread.content.length > 150
                    ? `${thread.content.substring(0, 150)}...`
                    : thread.content}
            </p>

            {thread.media_url && (
                <div className={styles.media_preview}>
                    {thread.media_type === 'image' ? (
                        <div className={styles.image_wrapper}>
                            <Image
                                src={thread.media_url}
                                alt={t('forum.card.media_alt')}
                                fill
                                className={styles.media_image}
                            />
                        </div>
                    ) : (
                        <div className={styles.image_wrapper}>
                            <video
                                src={`${thread.media_url}#t=0.5`}
                                className={styles.media_video_preview}
                                preload="metadata"
                                muted
                                playsInline
                            />
                            <div className={styles.video_icon_tag}>
                                <i className='bx bx-video'></i>
                            </div>
                        </div>
                    )}
                </div>
            )}

            <div className={styles.footer}>
                <div className={styles.stat}>
                    <i className='bx bx-eye'></i>
                    <span>{thread.views_count}</span>
                </div>
                <div className={styles.stat}>
                    <i className='bx bx-like'></i>
                    <span>{thread.likes_count}</span>
                </div>
                <div className={styles.stat}>
                    <i className='bx bx-message-circle-dots'></i>
                    <span>{thread.comments_count || 0}</span>
                </div>
            </div>
        </Link>
    )
}
