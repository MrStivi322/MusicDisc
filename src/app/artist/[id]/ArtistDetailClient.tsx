"use client"

import { supabase, fetchArtistWithCache } from "@/lib/supabase"
import type { Artist, Song, Album } from "@/lib/database.types"
import styles from "@/styles/pages/ArtistProfile.module.css"
import playerStyles from "@/styles/components/SpotifyPlayer.module.css"
import { sanitizeHTMLWithLinks } from "@/lib/sanitizeWithLinks"
import { useLanguage } from "@/contexts/LanguageContext"
import { useEffect, useState, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { SkeletonProfile } from "@/components/SkeletonLoader"
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver"
import { useSpotify } from "@/contexts/SpotifyContext"
import { usePlayer } from "@/contexts/PlayerContext"

function formatNumber(num: string | number): string {
    const n = typeof num === 'string' ? parseInt(num) : num
    if (isNaN(n)) return '0'
    if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M'
    if (n >= 1000) return (n / 1000).toFixed(1) + 'K'
    return n.toString()
}

function calculateTotalPlays(songs: Song[] | null): string {
    if (!songs || songs.length === 0) return '0'
    const total = songs.reduce((sum, song) => {
        const plays = typeof song.plays_count === 'string' ? parseInt(song.plays_count) : song.plays_count
        return sum + (isNaN(plays) ? 0 : plays)
    }, 0)
    return formatNumber(total)
}



export default function ArtistDetailClient({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter()
    const { id } = useParams()
    const { t } = useLanguage()
    const { token, login } = useSpotify()
    const { playTrack } = usePlayer()
    const [artist, setArtist] = useState<Artist | null>(null)
    const [songs, setSongs] = useState<Song[] | null>(null)
    const [albums, setAlbums] = useState<Album[] | null>(null)
    const [loading, setLoading] = useState(true)
    const [lastFilters, setLastFilters] = useState<any>(null)
    const titleRef = useRef<HTMLHeadingElement>(null)

    useEffect(() => {
        const filters = sessionStorage.getItem('last_filters')
        if (filters) {
            setLastFilters(JSON.parse(filters))
        }
    }, [])

    useEffect(() => {
        async function loadData() {
            if (!id) return

            setLoading(true)

            try {
                const [artistData, songsResponse, albumsResponse] = await Promise.all([
                    fetchArtistWithCache(id as string),
                    supabase
                        .from('songs')
                        .select('*')
                        .eq('artist_id', id)
                        .order('plays_count', { ascending: false })
                        .limit(5),
                    supabase
                        .from('albums')
                        .select('*')
                        .eq('artist_id', id)
                        .order('release_year', { ascending: false })
                ])

                if (artistData) {
                    setArtist(artistData)
                    setSongs(songsResponse.data)
                    setAlbums(albumsResponse.data)
                }
            } catch (error) {
                console.error("Error loading artist data:", error)
            } finally {
                setLoading(false)
            }
        }
        loadData()
    }, [id])

    useEffect(() => {
        if (artist && titleRef.current) {
            titleRef.current.focus()
        }
    }, [artist])

    const handleBack = () => {
        if (lastFilters) {
            const params = new URLSearchParams()
            if (lastFilters.q) params.set('q', lastFilters.q)
            if (lastFilters.genre !== "All") params.set('genre', lastFilters.genre)
            if (lastFilters.top) params.set('top', 'true')
            if (lastFilters.sort !== 'followers') params.set('sort', lastFilters.sort)
            router.push(`/artists?${params.toString()}`)
        } else {
            router.push('/artists')
        }
    }

    if (loading) {
        return (
            <main className={styles.main}>
                <SkeletonProfile />
            </main>
        )
    }

    if (!artist) {
        return (
            <main className={styles.main}>
                <div className={styles.loading}>
                    <h1>{t('artist.not_found')}</h1>
                </div>
            </main>
        )
    }

    const sanitizedDescription = artist.description
        ? sanitizeHTMLWithLinks(artist.description)
        : null

    return (
        <main className={styles.main}>
            <div className="page-container">
                <nav className="breadcrumbs" aria-label="Breadcrumb">
                    <Link href="/" className="breadcrumb_link">Home</Link>
                    <span className="breadcrumb_separator">/</span>
                    <Link href="/artists" className="breadcrumb_link">{t('artists.title')}</Link>
                    <span className="breadcrumb_separator">/</span>
                    <span className="breadcrumb_current">{artist.name}</span>
                </nav>

                <div className="navigation_header">
                    <button onClick={handleBack} className="back_button ripple" aria-label="Back to artists results">
                        <i className='bx bx-arrow-to-left'></i>
                        Back to Results
                    </button>

                    {lastFilters && (
                        <div className={styles.filter_context}>
                            <span className={styles.filter_context_label}>Returned from:</span>
                            {lastFilters.genre !== "All" && <span className={styles.filter_tag}>Genre: {lastFilters.genre}</span>}
                            {lastFilters.sort === 'name' && <span className={styles.filter_tag}>Order: A-Z</span>}
                            {lastFilters.sort === 'newest' && <span className={styles.filter_tag}>Order: Newest</span>}
                            {lastFilters.sort === 'followers' && <span className={styles.filter_tag}>Order: Popular</span>}
                        </div>
                    )}
                </div>
            </div>

            <div className={styles.hero}>
                {artist.hero_images && artist.hero_images.length > 0 ? (
                    <div className={styles.hero_collage}>
                        {artist.hero_images.map((imageUrl, index) => (
                            <div
                                key={index}
                                className={`${styles.hero_collage_image} ${styles[`collage_item_${index + 1}`]}`}
                                style={{ backgroundImage: `url(${imageUrl})` }}
                                role="img"
                                aria-label={`${artist.name} photo ${index + 1}`}
                            />
                        ))}
                    </div>
                ) : (artist.image_landscape_url || artist.image_url) ? (
                    <Image
                        src={(artist.image_landscape_url || artist.image_url)!}
                        alt={`${artist.name} hero banner`}
                        className={styles.hero_image}
                        priority
                        width={1200}
                        height={512}
                        style={{ objectFit: 'cover' }}
                    />
                ) : (
                    <div className={styles.hero_image} style={{ background: `linear-gradient(135deg, hsl(24, 95%, 53%) 0%, hsl(24, 95%, 65%) 100%)` }} />
                )}
                <div className={styles.hero_overlay}>
                    <h1 ref={titleRef} tabIndex={-1} className={styles.hero_title}>{artist.name}</h1>
                </div>
            </div>

            <div className={styles.content_grid}>
                <div className={styles.main_content}>
                    {sanitizedDescription && (
                        <section className={styles.section}>
                            <div className={styles.section_header}>
                                <h2 className={styles.section_title}>{t('artist.about')}</h2>
                                <i className={`bx bx-info-circle ${styles.section_icon}`}></i>
                            </div>
                            <div
                                className={styles.description}
                                dangerouslySetInnerHTML={{ __html: sanitizedDescription }}
                            />
                        </section>
                    )}

                    {albums && albums.length > 0 && (
                        <section className={styles.section}>
                            <div className={styles.section_header}>
                                <h2 className={styles.section_title}>{t('artist.albums')}</h2>
                                <i className={`bx bx-album-covers ${styles.section_icon}`}></i>
                            </div>
                            <div className={styles.albums_grid}>
                                {albums.map((album) => (
                                    <div key={album.id} className={styles.album_card}>
                                        <div className={styles.album_cover}>
                                            {album.cover_url ? (
                                                <Image
                                                    src={album.cover_url}
                                                    alt={`${album.title} album cover by ${artist.name}`}
                                                    fill
                                                    sizes="(max-width: 768px) 50vw, 200px"
                                                    style={{ objectFit: 'cover' }}
                                                />
                                            ) : (
                                                <div className={styles.album_placeholder} />
                                            )}
                                        </div>
                                        <h4 className={styles.album_title}>{album.title}</h4>
                                        <span className={styles.album_year}>{album.release_year}</span>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}
                </div>

                <aside className={styles.sidebar}>
                    <div className={styles.stats_card}>
                        <div className={styles.section_header}>
                            <h2 className={styles.section_title}>{t('artist.stats')}</h2>
                            <i className={`bx bx-microphone-alt-2 ${styles.section_icon}`}></i>
                        </div>
                        <div className={styles.stats_grid}>
                            <div className={styles.stat_item} title="Musical genre classification">
                                <span className={styles.stat_label}>Genre</span>
                                <span className={styles.stat_value}>{artist.genre}</span>
                            </div>
                            <div className={styles.stat_item} title="Total number of people following this artist">
                                <span className={styles.stat_label}>Followers</span>
                                <span className={styles.stat_value}>{formatNumber(artist.followers_count)}</span>
                            </div>
                            <div className={styles.stat_item} title="Number of tracks in our database">
                                <span className={styles.stat_label}>Songs</span>
                                <span className={styles.stat_value}>{songs?.length || 0}</span>
                            </div>
                            <div className={styles.stat_item} title="Number of albums released">
                                <span className={styles.stat_label}>Albums</span>
                                <span className={styles.stat_value}>{albums?.length || 0}</span>
                            </div>
                            <div className={styles.stat_item} title="Combined plays across all songs">
                                <span className={styles.stat_label}>Total Plays</span>
                                <span className={styles.stat_value}>{calculateTotalPlays(songs)}</span>
                            </div>
                        </div>
                    </div>

                    {songs && songs.length > 0 && (
                        <div className={styles.stats_card}>
                            <div className={styles.section_header}>
                                <h2 className={styles.section_title}>{t('artist.top_songs')}</h2>
                                <i className={`bx bx-music ${styles.section_icon}`}></i>
                            </div>
                            <div className={styles.sidebar_songs_list}>
                                {songs.map((song, index) => (
                                    <div key={song.id} className={styles.sidebar_song_item}>
                                        <div className={styles.sidebar_song_header}>
                                            <button
                                                className={`${styles.song_rank} ${playerStyles.play_button_trigger}`}
                                                onClick={() => {
                                                    if (token) {
                                                        const songIds = songs.map(s => s.spotify_id!).filter(Boolean)
                                                        playTrack(song.spotify_id!, songIds)
                                                    } else {
                                                        login()
                                                    }
                                                }}
                                                title={token ? (t('artist.play') || "Play") : (t('spotify.connect_to_play') || "Connect to Spotify to Play")}
                                                aria-label={token ? "Play track" : "Connect to Spotify"}
                                            >
                                                <i className={`${token ? 'bx bx-play' : 'bxl bx-spotify'}`} style={{ fontSize: '2rem' }}></i>
                                            </button>

                                            <div className={styles.song_info}>
                                                <h3 className={styles.song_title}>{song.title}</h3>
                                                <span className={styles.song_plays}>
                                                    {formatNumber(song.plays_count)} {t('artist.plays')}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </aside>
            </div>
        </main>
    )
}
