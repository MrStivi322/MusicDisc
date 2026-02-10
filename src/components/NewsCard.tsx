import Link from "next/link"
import Image from "next/image"
import styles from "@/styles/components/NewsCard.module.css"
import { useOnScreenCenter } from "@/hooks/useOnScreenCenter"

const categoryColors = [
    '#ff6b6b',
    '#51cf66',
    '#845ef7',
    '#ffd43b',
    '#ff6347',
    '#495057',
    '#4dabf7',
    '#f59e0b',
    '#ec4899',
    '#14b8a6',
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
    category: string[]  // Changed to array for multiple categories
    author?: string
    commentsCount?: number
    viewsCount?: number
    onClick?: () => void
}

export function NewsCard({ id, title, excerpt, image, date, category, author, commentsCount = 0, viewsCount = 0, onClick }: NewsCardProps) {
    const [ref, isCentered] = useOnScreenCenter({ threshold: 0.2, delay: 600 })

    // Ensure category is always an array and filter out nulls/undefined
    const categories = (Array.isArray(category) ? category : [category]).filter(Boolean);

    // Provide default category if empty
    if (categories.length === 0) {
        categories.push('General');
    }

    return (
        <div
            ref={ref}
            className={`${styles.card} ${isCentered ? styles.centered : ''}`}
        >
            <div className={styles.image_container}>
                {image ? (
                    <Image
                        src={image}
                        alt={`News image: ${title}`}
                        className={styles.image}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        style={{ objectFit: 'cover' }}
                    />
                ) : (
                    <div className={styles.placeholder}>
                        <span className={styles.placeholder_text}>News Image</span>
                    </div>
                )}
                <div className={styles.categories_container}>
                    {categories.map((cat, index) => {
                        if (!cat) return null;
                        const categoryColor = getCategoryColor(cat)
                        return (
                            <div
                                key={index}
                                className={styles.category_badge}
                                style={{ backgroundColor: categoryColor }}
                            >
                                <span>{cat}</span>
                            </div>
                        )
                    })}
                </div>
            </div>

            <div className={styles.content}>
                <Link href={`/news/${id}`} className={styles.title_link} onClick={onClick}>
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
