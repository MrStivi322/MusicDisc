"use client"

import { supabase, fetchArtistWithCache } from "@/lib/supabase"
import type { Artist, Song, Album } from "@/lib/database.types"
import styles from "@/styles/Artists/ArtistProfile.module.css"
import { sanitizeHTMLWithLinks } from "@/lib/sanitizeWithLinks"
import { useEffect, useState, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
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

const CollapsibleSection = ({
    title,
    icon,
    children,
    className,
    defaultOpen = true
}: {
    title: string,
    icon: string,
    children: React.ReactNode,
    className?: string,
    defaultOpen?: boolean
}) => {
    const [isOpen, setIsOpen] = useState(defaultOpen)

    return (
        <div className={className}>
            <div
                className={`${styles.section_header} ${isOpen ? styles.open : ''}`}
                onClick={() => setIsOpen(!isOpen)}
            >
                <h2 className={styles.section_title}>{title}</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <i className={`${icon} ${styles.section_icon}`}></i>
                    <i className={`bx bx-chevron-down bx-remove-padding ${styles.dropdown_chevron} ${isOpen ? styles.rotate : ''}`}></i>
                </div>
            </div>
            <div className={`${styles.collapsible_content} ${isOpen ? styles.open : ''}`}>
                {children}
            </div>
        </div>
    )
}

const SocialMediaIcons = ({ artist }: { artist: Artist }) => {
    const icons = [
        { key: 'website', icon: 'bx bx-globe bx-remove-padding', url: artist.website },
        { key: 'social_twitter', icon: 'bxl bx-twitter bx-remove-padding', url: artist.social_twitter },
        { key: 'social_instagram', icon: 'bxl bx-instagram bx-remove-padding', url: artist.social_instagram },
        { key: 'social_facebook', icon: 'bxl bx-facebook bx-remove-padding', url: artist.social_facebook },
        { key: 'social_youtube', icon: 'bxl bx-youtube bx-remove-padding', url: artist.social_youtube },
    ].filter(item => item.url)

    if (icons.length === 0) return null

    return (
        <div className={styles.social_icons}>
            {icons.map((item) => (
                <a
                    key={item.key}
                    href={item.url!}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.social_icon}
                    aria-label={item.key.replace('social_', '')}
                >
                    <i className={item.icon}></i>
                </a>
            ))}
        </div>
    )
}

const AlbumItem = ({
    album,
    songs,
    playTrack,
    token,
    login
}: {
    album: Album,
    songs: Song[],
    playTrack: any,
    token: string | null,
    login: any
}) => {
    const [expanded, setExpanded] = useState(false)
    const albumSongs = songs.filter(s => s.album_id === album.id)

    const handlePlayAlbum = (e: React.MouseEvent) => {
        e.stopPropagation()
        if (albumSongs.length === 0) return
        if (!token) { login(); return }
        const songIds = albumSongs.map(s => s.spotify_id).filter((id): id is string => Boolean(id))
        if (songIds.length > 0) playTrack(songIds[0], songIds)
    }

    return (
        <div className={`${styles.album_item_container} ${expanded ? styles.expanded : ''}`}>
            <div className={styles.album_item_header} onClick={() => setExpanded(!expanded)}>
                <div className={styles.album_cover_small}>
                    {album.cover_url ? (
                        <Image
                            src={album.cover_url}
                            alt={album.title}
                            width={48}
                            height={48}
                            style={{ objectFit: 'cover', borderRadius: '4px' }}
                        />
                    ) : (
                        <div className={styles.album_placeholder_small} />
                    )}
                </div>
                <div className={styles.album_info_row}>
                    <span className={styles.album_title_row}>{album.title}</span>
                    <span className={styles.album_year_row}>{album.release_year}</span>
                </div>
                <div className={styles.album_actions}>
                    <button
                        className={styles.play_album_button}
                        onClick={handlePlayAlbum}
                        aria-label={`Reproducir álbum ${album.title}`}
                    >
                        <i className={`bx ${token ? 'bx-play' : 'bxl bx-spotify'} bx-remove-padding`}></i>
                    </button>
                    <i className={`bx bx-chevron-down bx-remove-padding ${styles.expand_icon} ${expanded ? styles.rotate : ''}`}></i>
                </div>
            </div>

            {expanded && (
                <div className={styles.album_tracks_list}>
                    {albumSongs.length > 0 ? (
                        albumSongs.map((song, idx) => (
                            <div key={song.id} className={styles.album_track_item}>
                                <span className={styles.track_number}>{idx + 1}</span>
                                <div className={styles.track_info}>
                                    <span className={styles.track_title}>{song.title}</span>
                                    {song.plays_count !== null && song.plays_count !== undefined && (
                                        <span className={styles.track_plays}>{formatNumber(song.plays_count)} rep.</span>
                                    )}
                                </div>
                                <button
                                    className={styles.play_track_btn}
                                    onClick={() => {
                                        if (token && song.spotify_id) {
                                            const allAlbumIds = albumSongs.map(s => s.spotify_id).filter(id => !!id) as string[]
                                            playTrack(song.spotify_id!, allAlbumIds)
                                        } else {
                                            login()
                                        }
                                    }}
                                >
                                    <i className='bx bx-play bx-remove-padding'></i>
                                </button>
                            </div>
                        ))
                    ) : (
                        <div className={styles.no_tracks}>Sin pistas disponibles</div>
                    )}
                </div>
            )}
        </div>
    )
}

function statusTagClass(status: boolean | null): string {
    if (status === true) return styles.tag_active
    if (status === false) return styles.tag_inactive
    return ''
}

export default function ArtistDetailClient({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter()
    const { id } = useParams()
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
        if (filters) setLastFilters(JSON.parse(filters))
    }, [])

    useEffect(() => {
        async function loadData() {
            if (!id) return
            setLoading(true)
            try {
                const [artistData, songsResponse, albumsResponse] = await Promise.all([
                    fetchArtistWithCache(id as string),
                    supabase.from('songs').select('*').eq('artist_id', id).order('plays_count', { ascending: false }),
                    supabase.from('albums').select('*').eq('artist_id', id).order('release_year', { ascending: false })
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
        if (artist && titleRef.current) titleRef.current.focus()
    }, [artist])

    const handleBack = () => {
        if (lastFilters) {
            const p = new URLSearchParams()
            if (lastFilters.q) p.set('q', lastFilters.q)
            if (lastFilters.genre !== "All") p.set('genre', lastFilters.genre)
            if (lastFilters.top) p.set('top', 'true')
            if (lastFilters.sort !== 'followers') p.set('sort', lastFilters.sort)
            router.push(`/artists?${p.toString()}`)
        } else {
            router.push('/artists')
        }
    }

    if (loading) {
        return (
            <main className={styles.main}>
                <div className="flex-center" style={{ minHeight: '50vh' }}>
                    <p>Cargando...</p>
                </div>
            </main>
        )
    }

    if (!artist) {
        return (
            <main className={styles.main}>
                <div className={styles.loading}>
                    <h1>Artista no encontrado</h1>
                </div>
            </main>
        )
    }

    const sanitizedDescription = artist.description ? sanitizeHTMLWithLinks(artist.description) : null
    const hasMembers = artist.is_wide && artist.members && artist.members.length > 0
    const hasAchievements = artist.achievements && artist.achievements.length > 0

    const genres: string[] = (() => {
        const g = artist.genre
        if (!g) return []
        if (Array.isArray(g)) return g
        const s = g as string
        if (s.startsWith('[')) { try { return JSON.parse(s) } catch { return [s] } }
        return s.split(',').map(x => x.trim())
    })()

    return (
        <main className={styles.main}>
            <div className="page-container">
                <nav className="breadcrumbs" aria-label="Breadcrumb">
                    <Link href="/" className="breadcrumb_link">Inicio</Link>
                    <span className="breadcrumb_separator">/</span>
                    <Link href="/artists" className="breadcrumb_link">Artistas</Link>
                    <span className="breadcrumb_separator">/</span>
                    <span className="breadcrumb_current">{artist.name}</span>
                </nav>

                <div className="navigation_header">
                    <button onClick={handleBack} className="back_button ripple" aria-label="Volver a resultados">
                        <i className='bx bx-arrow-to-left bx-remove-padding'></i>
                        Volver a resultados
                    </button>
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
                                aria-label={`${artist.name} foto ${index + 1}`}
                            />
                        ))}
                    </div>
                ) : artist.image_url ? (
                    <Image
                        src={artist.image_url}
                        alt={`${artist.name} banner`}
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
                    <div className={styles.tags_container}>
                        <span className={`${styles.tag} ${styles.tag_type}`}>
                            <i className={`bx ${artist.is_wide ? 'bx-group' : 'bx-user'} bx-remove-padding`}></i>
                            {artist.is_wide ? 'Banda' : 'Solista'}
                        </span>
                        {artist.artist_status !== null && (
                            <span className={`${styles.tag} ${statusTagClass(artist.artist_status)}`}>
                                {artist.artist_status ? 'Activo' : 'Inactivo'}
                            </span>
                        )}
                    </div>

                    <h1 ref={titleRef} tabIndex={-1} className={styles.hero_title}>{artist.name}</h1>

                    {artist.real_name && (
                        <p className={styles.hero_real_name}>{artist.real_name}</p>
                    )}

                    <SocialMediaIcons artist={artist} />
                </div>
            </div>

            <div className={styles.content_grid}>
                <div className={styles.main_content}>

                    {sanitizedDescription && (
                        <CollapsibleSection title="Acerca de" icon="bx bx-info-circle bx-remove-padding" className={styles.section}>
                            <div className={styles.description} dangerouslySetInnerHTML={{ __html: sanitizedDescription }} />
                        </CollapsibleSection>
                    )}

                    {hasMembers && (
                        <CollapsibleSection title="Integrantes" icon="bx bx-group bx-remove-padding" className={styles.section}>
                            <div className={styles.members_grid}>
                                {artist.members!.map((member, idx) => (
                                    <div key={idx} className={styles.member_card}>
                                        {member.active === false
                                            ? <span className={styles.member_inactive_dot} title="Ex-integrante" />
                                            : <span className={styles.member_active_dot} title="Integrante actual" />
                                        }
                                        <div className={styles.member_avatar}>
                                            <i className="bx bx-user bx-remove-padding"></i>
                                        </div>
                                        <p className={styles.member_name}>{member.name}</p>
                                        {member.role && <span className={styles.member_role}>{member.role}</span>}
                                    </div>
                                ))}
                            </div>
                        </CollapsibleSection>
                    )}

                    {hasAchievements && (
                        <CollapsibleSection title="Logros" icon="bx bx-trophy bx-remove-padding" className={styles.section}>
                            <div className={styles.achievements_list}>
                                {artist.achievements!.map((item, idx) => (
                                    <div key={idx} className={styles.achievement_item}>
                                        <div className={styles.achievement_icon}>
                                            <i className={`bx ${item.icon ?? 'bx-trophy'} bx-remove-padding`}></i>
                                        </div>
                                        <span className={styles.achievement_label}>{item.label}</span>
                                    </div>
                                ))}
                            </div>
                        </CollapsibleSection>
                    )}

                    {albums && albums.length > 0 && (
                        <CollapsibleSection title="Álbumes" icon="bx bx-album-covers bx-remove-padding" className={styles.section}>
                            <div className={styles.albums_list_container}>
                                {albums.map((album) => (
                                    <AlbumItem
                                        key={album.id}
                                        album={album}
                                        songs={songs || []}
                                        playTrack={playTrack}
                                        token={token}
                                        login={login}
                                    />
                                ))}
                            </div>
                        </CollapsibleSection>
                    )}
                </div>

                <aside className={styles.sidebar}>
                    <CollapsibleSection title="Estadísticas" icon="bx bx-bar-chart-square bx-remove-padding" className={styles.section}>
                        <div className={styles.stats_list}>

                            <div className={styles.stat_row}>
                                <div className={styles.stat_row_icon}>
                                    <i className="bx bx-heart bx-remove-padding"></i>
                                </div>
                                <div className={styles.stat_row_content}>
                                    <span className={styles.stat_row_label}>Seguidores</span>
                                    <span className={styles.stat_row_value}>{formatNumber(artist.followers_count)}</span>
                                </div>
                            </div>

                            <div className={styles.stat_row}>
                                <div className={styles.stat_row_icon}>
                                    <i className="bx bx-music bx-remove-padding"></i>
                                </div>
                                <div className={styles.stat_row_content}>
                                    <span className={styles.stat_row_label}>Canciones</span>
                                    <span className={styles.stat_row_value}>{songs?.length || 0}</span>
                                </div>
                            </div>

                            <div className={styles.stat_row}>
                                <div className={styles.stat_row_icon}>
                                    <i className="bx bx-album bx-remove-padding"></i>
                                </div>
                                <div className={styles.stat_row_content}>
                                    <span className={styles.stat_row_label}>Álbumes</span>
                                    <span className={styles.stat_row_value}>{albums?.length || 0}</span>
                                </div>
                            </div>

                            {genres.length > 0 && (
                                <div className={styles.stat_row}>
                                    <div className={styles.stat_row_icon}>
                                        <i className="bx bx-category bx-remove-padding"></i>
                                    </div>
                                    <div className={styles.stat_row_content}>
                                        <span className={styles.stat_row_label}>Género</span>
                                        <div className={styles.genre_tags}>
                                            {genres.map((genre, i) => (
                                                <span key={i} className={styles.tag_genre}>{genre}</span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className={styles.stat_plays_row}>
                                <i className="bx bx-play-circle bx-remove-padding"></i>
                                <div className={styles.stat_plays_content}>
                                    <span className={styles.stat_plays_value}>{calculateTotalPlays(songs)}</span>
                                    <span className={styles.stat_plays_label}>Reproducciones totales</span>
                                </div>
                            </div>

                        </div>
                    </CollapsibleSection>


                </aside>
            </div>
        </main>
    )
}