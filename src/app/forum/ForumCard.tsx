import Link from 'next/link'
import Image from 'next/image'
import { formatRelativeTime } from '@/lib/utils'
import styles from '@/styles/forum/ForumCard.module.css'
import type { ForumThread } from '@/lib/database.types'


interface ForumCardProps {
    thread: ForumThread
}

export function ForumCard({ thread }: ForumCardProps) {


    const mediaUrl = thread.media_url
    const isVideo = thread.media_type === 'video'
    const hasMedia = !!mediaUrl

    return (
        <div className={styles.card}>
            <div className={styles.media_container}>
                {hasMedia ? (
                    isVideo ? (
                        <>
                            <video
                                src={`${mediaUrl}#t=0.5`}
                                className={styles.media_video_preview}
                                preload="metadata"
                                muted
                                playsInline
                            />
                        </>
                    ) : (
                        <Image
                            src={mediaUrl}
                            alt="Imagen de la discusión"
                            className={styles.media_image}
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                    )
                ) : (
                    <div style={{ width: '100%', height: '100%', background: 'linear-gradient(45deg, #1a1a1a, #2a2a2a)' }} />
                )}
                <div className={styles.media_overlay} />
                <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.5) 50%, transparent 100%)',
                    zIndex: 1
                }} />
            </div>

            <div className={styles.badges_container}>
                {thread.is_pinned && (
                    <span className={`${styles.badge} ${styles.pinned_badge}`}>
                        <i className='bx bx-pin bx-remove-padding'></i>
                    </span>
                )}
                {thread.category && (
                    <span className={styles.badge}>
                        <i className={`bx ${thread.category.icon} bx-remove-padding`}></i>
                        {thread.category.name}
                    </span>
                )}
                {isVideo && (
                    <span className={styles.badge}>
                        <i className='bx bx-video bx-remove-padding'></i>
                    </span>
                )}
            </div>

            <div className={styles.author_info}>
                {thread.author?.avatar_url ? (
                    <Image
                        src={thread.author.avatar_url}
                        alt={thread.author.username || "Avatar"}
                        width={24}
                        height={24}
                        className={styles.avatar}
                    />
                ) : (
                    <div className={styles.avatar_placeholder}>
                        {(thread.author?.username?.[0] || '?').toUpperCase()}
                    </div>
                )}
                <span className={styles.username}>{thread.author?.username || "Anónimo"}</span>
            </div>

            <div className={styles.content}>
                <Link href={`/forum/thread/${thread.slug}`} className={styles.content_link} aria-label={`Read thread: ${thread.title}`}>
                    <div className={styles.title_container}>
                        <h3 className={styles.title}>{thread.title}</h3>
                        <div className={styles.icon_wrapper}>
                            <i className={`bx bx-chevron-right bx-remove-padding ${styles.arrow_icon}`}></i>
                        </div>
                    </div>

                    <p className={styles.preview}>
                        {thread.content}
                    </p>

                    <div className={styles.footer}>
                        <div className={styles.stat}>
                            <i className='bx bx-time-five bx-remove-padding'></i>
                            <span>{formatRelativeTime(thread.created_at)}</span>
                        </div>
                        <div className={styles.stat}>
                            <i className='bx bx-eye bx-remove-padding'></i>
                            <span>{thread.views_count}</span>
                        </div>
                        <div className={styles.stat}>
                            <i className='bx bx-like bx-remove-padding'></i>
                            <span>{thread.likes_count}</span>
                        </div>
                        <div className={styles.stat}>
                            <i className='bx bx-message-dots bx-remove-padding'></i>
                            <span>{thread.comments_count || 0}</span>
                        </div>
                    </div>
                </Link>
            </div>
        </div>
    )
}
