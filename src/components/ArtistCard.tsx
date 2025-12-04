import Link from "next/link"
import Image from "next/image"
import styles from "@/styles/components/ArtistCard.module.css"
import { useOnScreenCenter } from "@/hooks/useOnScreenCenter"

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
    onClick?: () => void
}

export function ArtistCard({ id, name, genre, image, followers, isWide, showFireEffect, onClick }: ArtistCardProps) {
    const genreColor = getGenreColor(genre)
    const [ref, isCentered] = useOnScreenCenter({ threshold: 0.2, delay: 600 })

    return (
        <div
            ref={ref}
            className={`${styles.card} ${isWide ? styles.wide : ''} ${showFireEffect ? styles.fire_effect : ''} ${isCentered ? styles.centered : ''}`}
        >
            <div className={styles.image_container}>
                {image ? (
                    <Image
                        src={image}
                        alt={`${name} - ${genre} artist profile picture`}
                        className={styles.image}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        style={{ objectFit: 'cover' }}
                    />
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
                <Link href={`/artist/${id}`} className={styles.artist_link} onClick={onClick}>
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
