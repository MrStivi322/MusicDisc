import Link from "next/link"
import Image from "next/image"
import styles from "@/styles/Artists/Artists.module.css"


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
    genre: string[] | null
    image?: string
    isWide?: boolean
    showFireEffect?: boolean
    onClick?: () => void
}

export function ArtistCard({ id, name, genre, image, isWide, showFireEffect, onClick }: ArtistCardProps) {


    let genres: string[] = []
    const g = genre as unknown

    if (Array.isArray(g)) {
        genres = g
    } else if (typeof g === 'string') {
        try {
            const parsed = JSON.parse(g)
            if (Array.isArray(parsed)) {
                genres = parsed
            } else {
                genres = [g]
            }
        } catch {
            genres = [g]
        }
    }
    genres = genres.filter(Boolean)
    const displayGenres = genres.slice(0, 2)
    const remainingCount = genres.length - 2

    return (
        <div
            className={`${styles.card} ${isWide ? styles.wide : ''} ${showFireEffect ? styles.fire_effect : ''}`}
        >
            <div className={styles.image_container}>
                {image ? (
                    <Image
                        src={image}
                        alt={`${name} - ${genres.join(', ')} artist profile picture`}
                        className={styles.image}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        style={{ objectFit: 'cover', objectPosition: 'center 20%' }}
                    />
                ) : (
                    <div className={styles.placeholder}>
                        <span className={styles.placeholder_letter}>{name.charAt(0)}</span>
                    </div>
                )}
                <div className={styles.image_overlay} />
            </div>

            <div className={styles.tags_container} style={{ maxWidth: '70%' }}>
                {displayGenres.map((g, idx) => (
                    <span
                        key={idx}
                        className={styles.tag_genre}
                        style={{ backgroundColor: getGenreColor(g) }}
                    >
                        {g}
                    </span>
                ))}

                {remainingCount > 0 && (
                    <span className={styles.tag_more}>
                        +{remainingCount}
                    </span>
                )}

                {isWide && (
                    <span className={styles.tag_group}>
                        <i className='bx bx-group bx-remove-padding'></i>Banda
                    </span>
                )}
            </div>

            <div className={styles.content}>
                <Link href={`/artists/${id}`} className={styles.artist_link} onClick={onClick} aria-label={`View ${name} profile`}>
                    <div className={styles.name_container}>
                        <h3 className={styles.artist_name}>
                            {name}
                        </h3>
                        <div className={styles.icon_wrapper}>
                            <i className={`bx bx-chevron-right bx-remove-padding ${styles.arrow_icon}`}></i>
                        </div>
                    </div>
                </Link>
            </div>
        </div>
    )
}
