import Link from "next/link"
import styles from "@/styles/components/NewsCard.module.css"
import { useOnScreenCenter } from "@/hooks/useOnScreenCenter"

const categoryColors = [
    ''
]

function getCategoryColor(category: string): string {
    let hash = 0
    for (let i = 0; i < category.length; i++) {
        hash = category.charCodeAt(i) + ((hash << 5) - hash)
    }
    const index = Math.abs(hash) % categoryColors.length
    return categoryColors[index]
}

interface NewsCardProps {
    id: string | number
    title: string
    excerpt: string
    image?: string
    date: string
    category: string
    author?: string
    commentsCount?: number
    viewsCount?: number
}

export function NewsCard({ id, title, excerpt, image, date, category, author, commentsCount = 0, viewsCount = 0 }: NewsCardProps) {
    const categoryColor = getCategoryColor(category)
    const [ref, isCentered] = useOnScreenCenter({ threshold: 0.2, delay: 600 })

    return (
        <div
            ref={ref}
            className={`${styles.card} ${isCentered ? styles.centered : ''}`}
        >
            <div className={styles.image_container}>
                {image ? (
                    <img src={image} alt={title} className={styles.image} loading="lazy" />
                ) : (
                    <div className={styles.placeholder}>
                        <span className={styles.placeholder_text}>News Image</span>
                    </div>
                )}
                <div className={styles.category_badge} style={{ backgroundColor: categoryColor }}>
                    <span>{category}</span>
                </div>
            </div>

            <div className={styles.content}>
                <Link href={`/news/${id}`} className={styles.title_link}>
                    <h3 className={styles.title}>
                        {title}
                    </h3>
                </Link>
                <p className={styles.excerpt}>
                    {excerpt}
                </p>

                <div className={styles.stats}>
                    <div className={styles.stat_item}>
                        <i className='bx bx-eye'></i>
                        <span>{viewsCount.toLocaleString()}</span>
                    </div>
                    <div className={styles.stat_item}>
                        <i className='bx bx-message-circle'></i>
                        <span>{commentsCount}</span>
                    </div>
                </div>
            </div>

            <div className={styles.footer}>
                <div className={styles.author}>
                    <i className='bx bx-user'></i>
                    <span>{author || 'Anonymous'}</span>
                </div>
                <div className={styles.date}>
                    <i className='bx bx-calendar-alt'></i>
                    <time dateTime={date}>{date}</time>
                </div>
            </div>
        </div>
    )
}
