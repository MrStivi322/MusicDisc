"use client"

import { useState, useEffect } from "react"
import { ArtistCard } from "@/components/ArtistCard"
import { SkeletonCard } from "@/components/SkeletonLoader"
import { supabase, fetchGenresWithCache } from "@/lib/supabase"
import type { Artist } from "@/lib/database.types"
import styles from "@/styles/pages/Artists.module.css"
import { useLanguage } from "@/contexts/LanguageContext"
import { useDebounce } from "@/hooks/useDebounce"

const ITEMS_PER_PAGE = 12;

export default function ArtistsPage() {
    const { t } = useLanguage()
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedGenre, setSelectedGenre] = useState("All")
    const [artists, setArtists] = useState<Artist[]>([])
    const [loading, setLoading] = useState(true)
    const [genres, setGenres] = useState<string[]>(["All"])
    const [showTopOnly, setShowTopOnly] = useState(false)
    const [sortBy, setSortBy] = useState<'followers' | 'name' | 'newest'>('followers')
    const [mounted, setMounted] = useState(false)
    const [page, setPage] = useState(1)
    const [hasMore, setHasMore] = useState(true)
    const [loadingMore, setLoadingMore] = useState(false)

    
    const debouncedSearchQuery = useDebounce(searchQuery, 300)

    useEffect(() => {
        setMounted(true)
        loadGenres()
    }, [])

    useEffect(() => {
        
        setPage(1)
        setArtists([])
        fetchArtists(1, true)
    }, [selectedGenre, showTopOnly, debouncedSearchQuery, sortBy])

    async function loadGenres() {
        const genresList = await fetchGenresWithCache()
        setGenres(genresList)
    }

    async function fetchArtists(pageNum: number = 1, reset: boolean = false) {
        if (reset) {
            setLoading(true)
        } else {
            setLoadingMore(true)
        }

        const from = (pageNum - 1) * ITEMS_PER_PAGE
        const to = from + ITEMS_PER_PAGE - 1

        let queryBuilder = supabase
            .from('artists')
            .select('*', { count: 'exact' })
            .range(from, to)

        
        if (sortBy === 'name') {
            queryBuilder = queryBuilder.order('name', { ascending: true })
        } else if (sortBy === 'newest') {
            queryBuilder = queryBuilder.order('created_at', { ascending: false })
        } else {
            queryBuilder = queryBuilder.order('followers_count', { ascending: false })
        }

        if (selectedGenre !== "All") {
            queryBuilder = queryBuilder.eq('genre', selectedGenre)
        }

        if (showTopOnly) {
            queryBuilder = queryBuilder.eq('is_top', true)
        }

        if (debouncedSearchQuery) {
            queryBuilder = queryBuilder.ilike('name', '%' + debouncedSearchQuery + '%');
        }

        const { data, error, count } = await queryBuilder

        if (error) {
            console.error('Error fetching artists:', error)
        } else {
            if (reset) {
                setArtists(data || [])
            } else {
                setArtists(prev => [...prev, ...(data || [])])
            }

            
            const totalLoaded = reset ? (data?.length || 0) : artists.length + (data?.length || 0)
            setHasMore(totalLoaded < (count || 0))
        }

        setLoading(false)
        setLoadingMore(false)
    }

    function handleLoadMore() {
        const nextPage = page + 1
        setPage(nextPage)
        fetchArtists(nextPage, false)
    }

    return (
        <main className={styles.main}>
            <div className="page-container">
                <div className={`page-header ${mounted ? 'animate-fade-in' : ''}`}>
                    <h1 className="page-title">
                        {t('artists.title')}
                    </h1>
                    <p className="page-subtitle">
                        {t('artists.subtitle')}
                    </p>

                    <div className={styles.filter_bar}>
                        <div className={styles.search_container}>
                            <i className={`bx bx-search ${styles.search_icon}`}></i>
                            <input
                                type="text"
                                placeholder={t('artists.search')}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className={styles.search_input}
                            />
                        </div>

                        <select
                            value={selectedGenre}
                            onChange={(e) => setSelectedGenre(e.target.value)}
                            className={styles.filter_select}
                        >
                            <option value="All">All Genres</option>
                            {genres.filter(g => g !== "All").map((genre) => (
                                <option key={genre} value={genre}>
                                    {t(`genre.${genre}`) === `genre.${genre}` ? genre : t(`genre.${genre}`)}
                                </option>
                            ))}
                        </select>

                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as any)}
                            className={styles.filter_select}
                        >
                            <option value="followers">Most Popular</option>
                            <option value="name">Name (A-Z)</option>
                            <option value="newest">Newest</option>
                        </select>

                        <button
                            onClick={() => setShowTopOnly(!showTopOnly)}
                            className={`${styles.toggle_button} ${showTopOnly ? styles.active : ''}`}
                            title={t('artists.show_top')}
                        >
                            <i className='bx bxs-hot'></i>
                            <span className="sr-only">{t('artists.show_top')}</span>
                        </button>

                        {(selectedGenre !== "All" || showTopOnly || searchQuery) && (
                            <button
                                onClick={() => {
                                    setSelectedGenre("All");
                                    setShowTopOnly(false);
                                    setSearchQuery("");
                                    setSortBy("followers");
                                }}
                                className={styles.clear_button}
                            >
                                <i className='bx bx-x'></i>
                                Clear
                            </button>
                        )}
                    </div>
                </div>

                {loading ? (
                    <div className="content-grid">
                        <SkeletonCard variant="artist" count={12} />
                    </div>
                ) : (
                    <>
                        <div className="content-grid">
                            {artists.map((artist, index) => (
                                <div
                                    key={artist.id}
                                    className={`grid-item ${artist.is_wide ? 'grid-item-wide' : ''}`}
                                    style={{ animationDelay: `${index * 0.05}s` }}
                                >
                                    <ArtistCard
                                        id={artist.id}
                                        name={artist.name}
                                        genre={artist.genre}
                                        image={artist.image_url || undefined}
                                        followers={artist.followers_count}
                                        isWide={artist.is_wide}
                                        showFireEffect={showTopOnly && artist.is_top}
                                    />
                                </div>
                            ))}
                        </div>

                        {artists.length === 0 && (
                            <div className="empty-state">
                                <p className="empty-text">{t('artists.empty')}</p>
                                <p className="empty-desc">{t('artists.empty_desc')}</p>
                            </div>
                        )}

                        {hasMore && artists.length > 0 && (
                            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '3rem' }}>
                                <button
                                    onClick={handleLoadMore}
                                    disabled={loadingMore}
                                    className={styles.load_more_button}
                                    style={{
                                        padding: '1rem 2rem',
                                        fontSize: '1rem',
                                        fontWeight: '600',
                                        borderRadius: '12px',
                                        border: 'none',
                                        background: 'linear-gradient(135deg, hsl(24, 95%, 53%) 0%, hsl(24, 95%, 65%) 100%)',
                                        color: 'white',
                                        cursor: loadingMore ? 'not-allowed' : 'pointer',
                                        opacity: loadingMore ? 0.6 : 1,
                                        transition: 'all 0.3s ease'
                                    }}
                                >
                                    {loadingMore ? 'Loading...' : 'Load More'}
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </main>
    )
}
