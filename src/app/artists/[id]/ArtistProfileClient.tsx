"use client"

import { supabase, fetchArtistWithCache } from "@/lib/supabase"
import type { Artist, Song, Album } from "@/lib/database.types"
import styles from "@/styles/Artists/ArtistProfile.module.css"
import { sanitizeHTMLWithLinks } from "@/lib/sanitizeWithLinks"
import { useEffect, useState, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import { useSpotify } from "@/contexts/SpotifyContext"
import { usePlayer } from "@/contexts/PlayerContext"
import { Button } from '@/components/ui/Button'

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

const SectionHeader = ({ title }: { title: string}) => (
    <div className={styles.section_title_wrapper}>
        <h2 className={styles.section_title_text}>{title}</h2>
    </div>
)

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



function statusTagClass(status: boolean | null): string {
    if (status === true) return styles.tag_active
    if (status === false) return styles.tag_inactive
    return ''
}

export default function ArtistDetailClient() {
    const router = useRouter()
    const { id } = useParams()
    const { token, login } = useSpotify()
    const { playTrack } = usePlayer()
    const [artist, setArtist] = useState<Artist | null>(null)
    const [songs, setSongs] = useState<Song[] | null>(null)
    const [albums, setAlbums] = useState<Album[] | null>(null)
    const [loading, setLoading] = useState(true)
    const [lastFilters, setLastFilters] = useState<any>(null)
    const [activeTab, setActiveTab] = useState<'content' | 'sidebar'>('content')
    const [isMobile, setIsMobile] = useState(false)
    const [selectedAlbumId, setSelectedAlbumId] = useState<number | null>(null)
    const [openSideSections, setOpenSideSections] = useState<Record<string, boolean>>({
        stats: true,
        genres: true,
        popularity: true,
        tophits: true,
    })

    const toggleSideSection = (key: string) => {
        setOpenSideSections(prev => ({ ...prev, [key]: !prev[key] }))
    }
    const titleRef = useRef<HTMLHeadingElement>(null)

    useEffect(() => {
        if (albums && albums.length > 0 && !selectedAlbumId) {
            setSelectedAlbumId(albums[0].id)
        }
    }, [albums, selectedAlbumId])

    useEffect(() => {
        const filters = sessionStorage.getItem('last_filters')
        if (filters) setLastFilters(JSON.parse(filters))
    }, [])

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth <= 768)
        }
        checkMobile()
        window.addEventListener('resize', checkMobile)
        return () => window.removeEventListener('resize', checkMobile)
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
                <div className="empty-state"><p className="empty-text">Cargando...</p></div>
            </main>
        )
    }

    if (!artist) {
        return (
            <main className={styles.empty_state}>
                <div className="empty-state"><p className="empty-text">Artista no encontrado</p></div>
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

    const maxFollowerBaseline = 5000000 // 5M baseline for 100% score
    const followersCount = typeof artist.followers_count === 'string' ? parseInt(artist.followers_count) : (artist.followers_count || 0)
    const followerPercentage = Math.min(100, Math.max(5, (followersCount / maxFollowerBaseline) * 100))
    const strokeDashoffset = 226.2 - (226.2 * followerPercentage) / 100

    return (
        <main className="page-container">

            <div className="navigation_header">
                <Button onClick={handleBack} variant="primary" className="back-btn btn-icon" size="sm">
                    <i className='bx bx-arrow-to-left bx-remove-padding'></i>
                    Volver a resultados
                </Button>

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

            {isMobile && (
                <div className={styles.mobile_tab_bar}>
                    <button
                        className={`${styles.mobile_tab} ${activeTab === 'content' ? styles.mobile_tab_active : ''}`}
                        onClick={() => setActiveTab('content')}
                        aria-label="Ver perfil del artista"
                    >
                        <i className="bx bx-user-voice bx-remove-padding"></i>
                        <span>Perfil</span>
                    </button>
                    <button
                        className={`${styles.mobile_tab} ${activeTab === 'sidebar' ? styles.mobile_tab_active : ''}`}
                        onClick={() => setActiveTab('sidebar')}
                        aria-label="Ver estadísticas y datos"
                    >
                        <i className="bx bx-bar-chart-square bx-remove-padding"></i>
                        <span>Estadísticas</span>
                    </button>
                </div>
            )}

            <div className={styles.content_grid}>
                {(!isMobile || activeTab === 'content') && (
                    <div className={styles.main_content}>

                        {sanitizedDescription && (
                            <div className={styles.section}>
                                <SectionHeader title="Acerca de" />
                                <div className={styles.description} dangerouslySetInnerHTML={{ __html: sanitizedDescription }} />
                            </div>
                        )}

                        {hasMembers && (
                            <div className={styles.section}>
                                <SectionHeader title="Integrantes" />
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
                            </div>
                        )}

                        {hasAchievements && (
                            <div className={styles.section}>
                                <SectionHeader title="Logros" />
                                <div className={styles.achievements_grid}>
                                    {artist.achievements!.map((item, idx) => (
                                        <div key={idx} className={styles.achievement_card}>
                                            <div className={styles.achievement_icon}>
                                                <i className={`bx ${item.icon ?? 'bx-trophy'} bx-remove-padding`}></i>
                                            </div>
                                            <span className={styles.achievement_title}>{item.label}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {albums && albums.length > 0 && (
                            <div className={styles.section}>
                                <SectionHeader title="Álbumes" />
                                <div className={styles.albums_layout}>
                                    <div className={styles.album_selector_sidebar}>
                                        {albums.map((album) => {
                                            const isSelected = selectedAlbumId === album.id
                                            const albumSongs = songs ? songs.filter(s => s.album_id === album.id) : []
                                            return (
                                                <div 
                                                    key={album.id}
                                                    className={`${styles.album_card} ${isSelected ? styles.selected_card : ''}`}
                                                    onClick={() => setSelectedAlbumId(album.id)}
                                                >
                                                    {/* Vinyl sleeve & disc container */}
                                                    <div className={styles.vinyl_wrapper}>
                                                        {/* Vinyl Disc */}
                                                        <div className={styles.vinyl_disc}>
                                                            <div className={styles.vinyl_center} />
                                                        </div>
                                                        {/* Sleeve */}
                                                        <div className={styles.album}>
                                                            {album.cover_url ? (
                                                                <Image
                                                                    src={album.cover_url}
                                                                    alt={album.title}
                                                                    fill
                                                                    sizes="64px"
                                                                    style={{ objectFit: 'cover' }}
                                                                />
                                                            ) : (
                                                                <div className={styles.album_placeholder} />
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className={styles.album_content}>
                                                        <span className={styles.album_title}>{album.title}</span>
                                                        <span className={styles.album_subtitle}>
                                                            {album.release_year} • {albumSongs.length} {albumSongs.length === 1 ? 'canción' : 'canciones'}
                                                        </span>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>

                                    <div className={styles.album_tracks_panel}>
                                        {(() => {
                                            const activeAlbum = albums.find(a => a.id === selectedAlbumId) || albums[0]
                                            if (!activeAlbum) return null
                                            const albumSongs = songs ? songs.filter(s => s.album_id === activeAlbum.id) : []

                                            const handlePlayAlbum = (e: React.MouseEvent) => {
                                                e.stopPropagation()
                                                if (albumSongs.length === 0) return
                                                if (!token) { login(); return }
                                                const songIds = albumSongs.map(s => s.spotify_id).filter((id): id is string => Boolean(id))
                                                if (songIds.length > 0) playTrack(songIds[0], songIds)
                                            }

                                            return (
                                                <div className={styles.tracks_panel_inner}>
                                                    <div className={styles.panel_header}>
                                                        <div className={styles.panel_cover}>
                                                            {activeAlbum.cover_url ? (
                                                                <Image
                                                                    src={activeAlbum.cover_url}
                                                                    alt={activeAlbum.title}
                                                                    width={120}
                                                                    height={120}
                                                                    style={{ objectFit: 'cover' }}
                                                                />
                                                            ) : (
                                                                <div className={styles.panel_placeholder} />
                                                            )}
                                                        </div>
                                                        <div className={styles.panel_info}>
                                                            <span className={styles.panel_type_badge}>Álbum</span>
                                                            <h3 className={styles.panel_album_title}>{activeAlbum.title}</h3>
                                                            <p className=   {styles.panel_album_meta}>
                                                                Publicado en <strong>{activeAlbum.release_year}</strong> • {albumSongs.length} {albumSongs.length === 1 ? 'canción' : 'canciones'}
                                                            </p>
                                                            <Button variant="primary" size="sm" onClick={handlePlayAlbum} disabled={albumSongs.length === 0}>
                                                                <i className={`bx ${token ? 'bx-play' : 'bxl bx-spotify'} bx-remove-padding`}></i>
                                                                Reproducir Álbum
                                                            </Button>
                                                        </div>
                                                    </div>

                                                    <div className={styles.panel_songs_list}>
                                                        {albumSongs.length > 0 ? (
                                                            albumSongs.map((song, idx) => (
                                                                <div 
                                                                    key={song.id} 
                                                                    className={styles.track_row}
                                                                    onClick={() => {
                                                                        if (token && song.spotify_id) {
                                                                            const allAlbumIds = albumSongs.map(s => s.spotify_id).filter(id => !!id) as string[]
                                                                            playTrack(song.spotify_id!, allAlbumIds)
                                                                        } else {
                                                                            login()
                                                                        }
                                                                    }}
                                                                >
                                                                    <div className={styles.track_index_col}>
                                                                        <i className={`bx bx-play ${styles.track_row_play_icon} bx-remove-padding`}></i>
                                                                    </div>
                                                                    <span className={styles.track_row_title}>{song.title}</span>
                                                                    {song.plays_count !== null && song.plays_count !== undefined && (
                                                                        <div className={styles.track_plays_col}>
                                                                            <span>{formatNumber(song.plays_count)}</span>
                                                                            <i className="bx bx-headphone-alt bx-remove-padding"></i>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            ))
                                                        ) : (
                                                            <div className="empty-state">No hay pistas disponibles</div>
                                                        )}
                                                    </div>
                                                </div>
                                            )
                                        })()}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {(!isMobile || activeTab === 'sidebar') && (
                    <aside className={styles.sidebar}>

                        {/* STATS SECTION */}
                        <div className={styles.sidebar_section}>
                            <div
                                className={`${styles.sidebar_section_header} ${openSideSections.stats ? styles.open : ''}`}
                                onClick={() => toggleSideSection('stats')}
                            >
                                <div className={styles.sidebar_section_title_group}>
                                    <i className={`bx bx-bar-chart-square bx-remove-padding ${styles.sidebar_section_icon}`}></i>
                                    <h3 className={styles.sidebar_section_title}>Estadísticas</h3>
                                </div>
                                <i className={`bx bx-chevron-down bx-remove-padding ${styles.dropdown_chevron} ${openSideSections.stats ? styles.rotate : ''}`}></i>
                            </div>
                            <div className={`${styles.sidebar_section_content} ${openSideSections.stats ? styles.open : ''}`}>
                                <div className={styles.sidebar_section_inner}>
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
                                            <i className="bx bx-microphone bx-remove-padding"></i>
                                        </div>
                                        <div className={styles.stat_row_content}>
                                            <span className={styles.stat_row_label}>Canciones</span>
                                            <span className={styles.stat_row_value}>{songs?.length || 0}</span>
                                        </div>
                                    </div>
                                    <div className={styles.stat_row}>
                                        <div className={styles.stat_row_icon}>
                                            <i className="bx bx-album-covers bx-remove-padding"></i>
                                        </div>
                                        <div className={styles.stat_row_content}>
                                            <span className={styles.stat_row_label}>Álbumes</span>
                                            <span className={styles.stat_row_value}>{albums?.length || 0}</span>
                                        </div>
                                    </div>
                                    <div className={styles.stat_row}>
                                        <div className={styles.stat_row_icon}>
                                            <i className="bx bx-play-circle bx-remove-padding"></i>
                                        </div>
                                        <div className={styles.stat_plays_content}>
                                            <span className={styles.stat_plays_value}>{calculateTotalPlays(songs)}</span>
                                            <span className={styles.stat_plays_label}>Reproducciones totales</span>
                                        </div>
                                    </div>
                                    <div className={styles.stat_row}>
                                        <div className={styles.popularity_svg_wrapper}>
                                            <svg className={styles.popularity_svg} viewBox="0 0 80 80">
                                                <circle className={styles.popularity_track} cx="40" cy="40" r="36" />
                                                <circle
                                                    className={styles.popularity_fill}
                                                    cx="40"
                                                    cy="40"
                                                    r="36"
                                                    strokeDasharray="226.2"
                                                    strokeDashoffset={strokeDashoffset}
                                                />
                                            </svg>
                                            <div className={styles.popularity_inner_text}>
                                                <span className={styles.popularity_score_percent}>
                                                    {Math.round(followerPercentage)}%
                                                </span>
                                            </div>
                                        </div>
                                        <div className={styles.popularity_content}>
                                            <span className={styles.stat_popularity_value}>Puntuación Popular</span>
                                            <span className={styles.stat_popularity_label}>Basado en crecimiento de seguidores</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* GENRES SECTION */}
                        {genres.length > 0 && (
                            <div className={styles.sidebar_section}>
                                <div
                                    className={`${styles.sidebar_section_header} ${openSideSections.genres ? styles.open : ''}`}
                                    onClick={() => toggleSideSection('genres')}
                                >
                                    <div className={styles.sidebar_section_title_group}>
                                        <i className={`bx bx-categories bx-remove-padding ${styles.sidebar_section_icon}`}></i>
                                        <h3 className={styles.sidebar_section_title}>Géneros</h3>
                                    </div>
                                    <i className={`bx bx-chevron-down bx-remove-padding ${styles.dropdown_chevron} ${openSideSections.genres ? styles.rotate : ''}`}></i>
                                </div>
                                <div className={`${styles.sidebar_section_content} ${openSideSections.genres ? styles.open : ''}`}>
                                    <div className={styles.sidebar_section_inner}>
                                            {genres.map((genre, i) => (
                                                <span key={i} className={styles.genre_row}>{genre}</span>
                                            ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* TOP HITS SECTION */}
                        {songs && songs.length > 0 && (
                            <div className={styles.sidebar_section}>
                                <div
                                    className={`${styles.sidebar_section_header} ${openSideSections.tophits ? styles.open : ''}`}
                                    onClick={() => toggleSideSection('tophits')}
                                >
                                    <div className={styles.sidebar_section_title_group}>
                                        <i className={`bx bx-trophy bx-remove-padding ${styles.sidebar_section_icon}`}></i>
                                        <h3 className={styles.sidebar_section_title}>Top Éxitos</h3>
                                    </div>
                                    <i className={`bx bx-chevron-down bx-remove-padding ${styles.dropdown_chevron} ${openSideSections.tophits ? styles.rotate : ''}`}></i>
                                </div>
                                <div className={`${styles.sidebar_section_content} ${openSideSections.tophits ? styles.open : ''}`}>
                                    <div className={styles.sidebar_section_inner}>
                                            {(() => {
                                                const sortedSongs = [...songs].sort((a, b) => {
                                                    const aPlays = typeof a.plays_count === 'string' ? parseInt(a.plays_count) : (a.plays_count || 0)
                                                    const bPlays = typeof b.plays_count === 'string' ? parseInt(b.plays_count) : (b.plays_count || 0)
                                                    return bPlays - aPlays
                                                })
                                                const maxPlays = sortedSongs.length > 0
                                                    ? (typeof sortedSongs[0].plays_count === 'string' ? parseInt(sortedSongs[0].plays_count) : (sortedSongs[0].plays_count || 0))
                                                    : 0
                                                const divisor = maxPlays > 0 ? maxPlays : 1

                                                return sortedSongs.slice(0, 5).map((song) => {
                                                    const songPlays = typeof song.plays_count === 'string' ? parseInt(song.plays_count) : (song.plays_count || 0)
                                                    const percentage = Math.min(100, (songPlays / divisor) * 100)
                                                    return (
                                                        <div key={song.id} className={styles.top_hits_item}>
                                                            <div className={styles.top_hits_content}>
                                                                <span className={styles.top_hits_label}>{song.title}</span>
                                                                <span className={styles.top_hits_value}>{formatNumber(songPlays)}</span>
                                                            </div>
                                                            <div className={styles.top_hits_progress_bg}>
                                                                <div
                                                                    className={styles.top_hits_progress_fill}
                                                                    style={{ width: `${percentage}%` }}
                                                                />
                                                            </div>
                                                        </div>
                                                    )
                                                })
                                            })()}
                                    </div>
                                </div>
                            </div>
                        )}

                    </aside>
                )}
            </div>
        </main>
    )
}