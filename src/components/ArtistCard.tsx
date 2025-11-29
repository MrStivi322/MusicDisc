import Link from "next/link"
import styles from "@/styles/components/ArtistCard.module.css"

const genreColors = [
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

function getGenreColor(genre: string): string {
    let hash = 0
    for (let i = 0; i < genre.length; i++) {
        hash = genre.charCodeAt(i) + ((hash << 5) - hash)
    }
    const index = Math.abs(hash) % genreColors.length
    return genreColors[index]
}

interface ArtistCardProps {
    id: string | number
    name: string
    genre: string
    image?: string
    followers?: string | number
    isWide?: boolean
    showFireEffect?: boolean
}

export function ArtistCard({ id, name, genre, image, followers, isWide, showFireEffect }: ArtistCardProps) {
    const genreColor = getGenreColor(genre)

    return (
        <div className={`${styles.card} ${isWide ? styles.wide : ''} ${showFireEffect ? styles.fire_effect : ''}`}>
            <div className={styles.image_container}>
                {image ? (
                    <img src={image} alt={name} className={styles.image} loading="lazy" />
                ) : (
                    <div className={styles.placeholder}>
                        <span className={styles.placeholder_letter}>{name.charAt(0)}</span>
                    </div>
                )}
            </div>

            <div className={styles.tags_container}>
                <span
                    className={styles.genre_tag}
                    style={{ backgroundColor: genreColor }}
                >
                    {genre}
                </span>

                {isWide && (
                    <span className={styles.group_tag}>
                        Grupo
                    </span>
                )}
            </div>

            <div className={styles.content}>
                <Link href={`/artist/${id}`} className={styles.artist_link}>
                    <div className={styles.name_container}>
                        <h3 className={styles.artist_name}>
                            {name}
                        </h3>
                        <i className={`bx bxs-arrow-big-right-line ${styles.arrow_icon}`}></i>
                    </div>
                </Link>
            </div>
        </div>
    )
}
