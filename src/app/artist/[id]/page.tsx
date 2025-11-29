"use client"

import { supabase, fetchArtistWithCache } from "@/lib/supabase"
import type { Artist, Song, Album } from "@/lib/database.types"
import styles from "@/styles/pages/ArtistProfile.module.css"
import DOMPurify from 'isomorphic-dompurify'
import { useLanguage } from "@/contexts/LanguageContext"
import { usePlayer } from "@/contexts/PlayerContext"
import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { SkeletonProfile } from "@/components/SkeletonLoader"
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver"

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

function LazySpotifyEmbed({ spotifyId }: { spotifyId: string }) {
    const [ref, isIntersecting] = useIntersectionObserver({ threshold: 0.1 })
    const [hasLoaded, setHasLoaded] = useState(false)

    useEffect(() => {
        if (isIntersecting && !hasLoaded) {
            setHasLoaded(true)
        }
    }, [isIntersecting, hasLoaded])

    return (
        <div ref={ref} style={{ minHeight: '152px' }}>
            {hasLoaded ? (
                <iframe
                    className={styles.spotify_iframe}
                    src={`https://open.spotify.com/embed/track/${spotifyId || 'invalid_track_id'}?utm_source=generator`}
                    width="100%"
                    height="152"
                    frameBorder="0"
                    allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                    loading="lazy"
                />
            ) : (
                <div
                    className={styles.spotify_iframe}
                    style={{
                        height: '152px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'rgba(255, 255, 255, 0.5)'
                    }}
                >
                    Loading...
                </div>
            )}
        </div>
    )
}

export default function ArtistPage() {
    const { id } = useParams()
    const { t } = useLanguage()
    const { playTrack, closePlayer, currentSpotifyId } = usePlayer()
    const [artist, setArtist] = useState<Artist | null>(null)
    const [songs, setSongs] = useState<Song[] | null>(null)
    const [albums, setAlbums] = useState<Album[] | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function loadData() {
            if (!id) return

            const artistData = await fetchArtistWithCache(id as string)
            setArtist(artistData)

            if (artistData) {
                const { data: songsData } = await supabase
                    .from('songs')
                    .select('*')
                    .eq('artist_id', id)
                    .order('plays_count', { ascending: false })
                    .limit(5)
                setSongs(songsData)

                const { data: albumsData } = await supabase
                    .from('albums')
                    .select('*')
                    .eq('artist_id', id)
                    .order('release_year', { ascending: false })
                setAlbums(albumsData)
            }
            setLoading(false)
        }
        loadData()
    }, [id])

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
        ? DOMPurify.sanitize(artist.description, {
            ALLOWED_TAGS: ['strong', 'em', 'b', 'i', 'u', 'br', 'p', 'span', 'div'],
            ALLOWED_ATTR: ['style', 'class']
        })
        : null

    return (
        <main className={styles.main}>
            <div className={styles.hero}>
                {artist.hero_images && artist.hero_images.length > 0 ? (
                    <div className={styles.hero_collage}>
                        {artist.hero_images.map((imageUrl, index) => (
                            <div
                                key={index}
                                className={`${styles.hero_collage_image} ${styles[`collage_item_${index + 1}`]}`}
                                style={{ backgroundImage: `url(${imageUrl})` }}
                            />
                        ))}
                    </div>
                ) : (artist.image_landscape_url || artist.image_url) ? (
                    <img src={(artist.image_landscape_url || artist.image_url)!} alt={artist.name} className={styles.hero_image} />
                ) : (
                    <div className={styles.hero_image} style={{ background: `linear-gradient(135deg, hsl(24, 95%, 53%) 0%, hsl(24, 95%, 65%) 100%)` }} />
                )}
                <div className={styles.hero_overlay}>
                    <h1 className={styles.hero_title}>{artist.name}</h1>
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
                                className={styles.bio}
                                dangerouslySetInnerHTML={{ __html: sanitizedDescription }}
                            />
                        </section>
                    )}



                    {albums && albums.length > 0 && (
                        <section className={styles.section}>
                            <div className={styles.section_header}>
                                <h2 className={styles.section_title}>{t('artist.discography')}</h2>
                                <i className={`bx bx-book-library ${styles.section_icon}`}></i>
                            </div>
                            <div className={styles.albums_grid}>
                                {albums.map((album) => (
                                    <div key={album.id} className={styles.album_card}>
                                        <div className={styles.album_cover}>
                                            {album.cover_url ? (
                                                <img src={album.cover_url} alt={album.title} loading="lazy" />
                                            ) : (
                                                <div className={styles.album_placeholder}>Album</div>
                                            )}
                                        </div>
                                        <div className={styles.album_info}>
                                            <div className={styles.album_title}>{album.title}</div>
                                            <div className={styles.album_year}>{album.release_year || "Unknown"} • Album</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}
                </div>

                <aside className={styles.sidebar_section}>
                    <div className={styles.section_header}>
                        <h2 className={styles.section_title}>{t('artist.stats')}</h2>
                        <i className={`bx bx-trending-up ${styles.section_icon}`}></i>
                    </div>
                    <div className={styles.stats_grid}>
                        <div className={styles.stat_card}>
                            <div className={styles.stat_value}>{formatNumber(artist.followers_count)}</div>
                            <div className={styles.stat_label}>{t('artist.listeners')}</div>
                        </div>
                        {songs && songs.length > 0 && (
                            <div className={styles.stat_card}>
                                <div className={styles.stat_value}>{songs.length}</div>
                                <div className={styles.stat_label}>{t('artist.top_songs')}</div>
                            </div>
                        )}
                        {albums && albums.length > 0 && (
                            <div className={styles.stat_card}>
                                <div className={styles.stat_value}>{albums.length}</div>
                                <div className={styles.stat_label}>{t('artist.albums')}</div>
                            </div>
                        )}
                        {songs && songs.length > 0 && (
                            <div className={styles.stat_card}>
                                <div className={styles.stat_value}>{calculateTotalPlays(songs)}</div>
                                <div className={styles.stat_label}>{t('artist.total_plays')}</div>
                            </div>
                        )}
                    </div>

                    {songs && songs.length > 0 && (
                        <>
                            <div className={styles.section_header} style={{ marginTop: '2rem' }}>
                                <h2 className={styles.section_title}>{t('artist.popular_songs')}</h2>
                                <i className={`bx bx-music ${styles.section_icon}`}></i>
                            </div>
                            <div className={styles.popular_songs_grid}>
                                {songs.map((song) => (
                                    <LazySpotifyEmbed key={song.id} spotifyId={song.spotify_id || ''} />
                                ))}
                            </div>
                        </>
                    )}
                </aside>
            </div>
        </main>
    )
}