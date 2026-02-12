"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import useSWRInfinite from "swr/infinite"
import { ArtistCard } from "@/components/ArtistCard"
import { SkeletonCard } from "@/components/SkeletonLoader"
import { supabase, fetchGenresWithCache } from "@/lib/supabase"
import type { Artist } from "@/lib/database.types"
import styles from "@/styles/pages/Artists.module.css"
import { useLanguage } from "@/contexts/LanguageContext"
import { useDebounce } from "@/hooks/useDebounce"

// New Standard Components
import { SectionHeader } from '@/components/ui/SectionHeader'
import { FilterBar } from '@/components/ui/FilterBar'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'

export const dynamic = 'force-dynamic'

const ITEMS_PER_PAGE = 12;

function ArtistsContent() {
    const { t } = useLanguage()
    const router = useRouter()
    const searchParams = useSearchParams()

    const [searchQuery, setSearchQuery] = useState("")
    const [selectedGenre, setSelectedGenre] = useState("All")
    const [genres, setGenres] = useState<string[]>(["All"])
    const [showTopOnly, setShowTopOnly] = useState(false)
    const [sortBy, setSortBy] = useState<'followers' | 'name' | 'newest'>('followers')
    const [mounted, setMounted] = useState(false)


    const debouncedSearchQuery = useDebounce(searchQuery, 300)

    // SWR Fetcher
    const fetchArtists = async ([key, pageIndex, query, genre, top, sort]: [string, number, string, string, boolean, string]) => {
        const from = pageIndex * ITEMS_PER_PAGE
        const to = from + ITEMS_PER_PAGE - 1

        let queryBuilder = supabase
            .from('artists')
            .select('*', { count: 'exact' })
            .range(from, to)

        if (sort === 'name') {
            queryBuilder = queryBuilder.order('name', { ascending: true })
        } else if (sort === 'newest') {
            queryBuilder = queryBuilder.order('created_at', { ascending: false })
        } else {
            queryBuilder = queryBuilder.order('followers_count', { ascending: false })
        }

        if (genre !== "All") {
            queryBuilder = queryBuilder.eq('genre', genre)
        }

        if (top) {
            queryBuilder = queryBuilder.eq('is_top', true)
        }

        if (query) {
            queryBuilder = queryBuilder.ilike('name', '%' + query + '%');
        }

        const { data, error, count } = await queryBuilder

        if (error) throw error
        return { data: data || [], count: count || 0 }
    }

    // SWR Key
    const getKey = (pageIndex: number, previousPageData: { data: Artist[], count: number } | null) => {
        if (previousPageData && !previousPageData.data.length) return null // reached the end
        return ['artists', pageIndex, debouncedSearchQuery, selectedGenre, showTopOnly, sortBy]
    }

    const { data, size, setSize, isValidating, isLoading } = useSWRInfinite(getKey, fetchArtists, {
        revalidateFirstPage: false,
        revalidateOnFocus: false,
        persistSize: true
    })

    const artists = data ? data.flatMap(page => page.data) : []
    const totalCount = data && data[0] ? data[0].count : 0
    const isLoadingMore = isLoading || (size > 0 && data && typeof data[size - 1] === "undefined");
    const isEmpty = data?.[0]?.data.length === 0;
    const isReachingEnd = isEmpty || (data && data[data.length - 1]?.data.length < ITEMS_PER_PAGE);

    useEffect(() => {
        setMounted(true)
        loadGenres()

        // Read search params after mount
        const q = searchParams.get('q')
        const genre = searchParams.get('genre')
        const top = searchParams.get('top')
        const sort = searchParams.get('sort')

        if (q) setSearchQuery(q)
        if (genre) setSelectedGenre(genre)
        if (top === 'true') setShowTopOnly(true)
        if (sort) setSortBy(sort as 'followers' | 'name' | 'newest')

        // Scroll restoration
        const savedScroll = sessionStorage.getItem('artists_scroll_y')
        if (savedScroll) {
            window.scrollTo(0, parseInt(savedScroll))
            sessionStorage.removeItem('artists_scroll_y')
        }
    }, [])

    // Update URL when filters change
    useEffect(() => {
        if (!mounted) return // Only run on client side

        const params = new URLSearchParams()
        if (debouncedSearchQuery) params.set('q', debouncedSearchQuery)
        if (selectedGenre !== "All") params.set('genre', selectedGenre)
        if (showTopOnly) params.set('top', 'true')
        if (sortBy !== 'followers') params.set('sort', sortBy)

        router.replace(`/artists?${params.toString()}`, { scroll: false })
    }, [debouncedSearchQuery, selectedGenre, showTopOnly, sortBy, router, mounted])

    async function loadGenres() {
        const genresList = await fetchGenresWithCache()
        setGenres(genresList)
    }

    function handleLoadMore() {
        setSize(size + 1)
    }


    return (
        <div className="page-container">
            <div className={mounted ? 'animate-fade-in' : ''}>
                <SectionHeader
                    title={t('artists.title')}
                    subtitle={t('artists.subtitle')}
                />

                <FilterBar>
                    <div className="flex-grow-1">
                        <Input
                            placeholder={t('artists.search_placeholder')}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            icon="bx-search"
                            aria-label="Search artists by name"
                        />
                    </div>

                    <Select
                        value={selectedGenre}
                        onChange={(e) => setSelectedGenre(e.target.value)}
                        style={{ minWidth: '180px' }}
                        aria-label="Filter by genre"
                    >
                        <option value="All">{t('artist.all_genres')}</option>
                        {genres.filter(g => g !== "All").map((genre) => (
                            <option key={genre} value={genre}>
                                {t(`genre.${genre}`) === `genre.${genre}` ? genre : t(`genre.${genre}`)}
                            </option>
                        ))}
                    </Select>

                    <Select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as 'followers' | 'name' | 'newest')}
                        style={{ minWidth: '160px' }}
                        aria-label="Sort artists"
                    >
                        <option value="followers">{t('artists.sort.popular')}</option>
                        <option value="name">{t('artists.sort.name')}</option>
                        <option value="newest">{t('artists.sort.recent')}</option>
                    </Select>

                    <Button
                        variant={showTopOnly ? 'primary' : 'outline'}
                        onClick={() => setShowTopOnly(!showTopOnly)}
                        leftIcon={<i className='bx bxs-hot'></i>}
                        title={t('artists.show_top')}
                    >
                        {t('artists.show_top')}
                    </Button>
                </FilterBar>
            </div>

            {isLoading ? (
                <div className="content-grid">
                    <SkeletonCard variant="artist" count={12} />
                </div>
            ) : (
                <>
                    <div className="content-grid">
                        {artists.map((artist, index) => (
                            <div
                                key={artist.id}
                                className={`animate-entrance ${artist.is_wide ? 'grid-item-wide' : ''}`}
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
                                    onClick={() => {
                                        sessionStorage.setItem('artists_scroll_y', window.scrollY.toString())
                                        sessionStorage.setItem('last_filters', JSON.stringify({
                                            genre: selectedGenre,
                                            sort: sortBy,
                                            top: showTopOnly,
                                            q: searchQuery
                                        }))
                                    }}
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

                    {!isReachingEnd && !isEmpty && (
                        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '3rem' }}>
                            <Button
                                onClick={handleLoadMore}
                                disabled={isLoadingMore}
                                isLoading={isLoadingMore}
                                size="lg"
                                variant="primary"
                            >
                                {isLoadingMore ? t('artists.loading_more') : t('artists.load_more')}
                            </Button>
                        </div>
                    )}
                </>
            )}
        </div>
    )
}

export default function ArtistsPage() {
    return (
        <main className={styles.main}>
            <Suspense fallback={<div className="content-grid"><SkeletonCard variant="artist" count={12} /></div>}>
                <ArtistsContent />
            </Suspense>
        </main>
    )
}
