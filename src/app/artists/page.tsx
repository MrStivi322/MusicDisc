"use client"

import { useState, useEffect, useCallback, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import useSWRInfinite from "swr/infinite"
import { ArtistCard } from "@/app/artists/[id]/ArtistCard"
import { supabase, fetchGenresWithCache } from "@/lib/supabase"
import type { Artist } from "@/lib/database.types"
import styles from "@/styles/Artists/Artists.module.css"

import { useDebounce } from "@/hooks/useDebounce"
import { SectionHeader } from '@/components/ui/SectionHeader'
import { FilterBar } from '@/components/ui/FilterBar'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'

export const dynamic = 'force-dynamic'

const ITEMS_PER_PAGE = 12;

function ArtistsContent() {

    const router = useRouter()
    const searchParams = useSearchParams()

    const [searchQuery, setSearchQuery] = useState("")
    const [selectedGenre, setSelectedGenre] = useState("All")
    const [genres, setGenres] = useState<string[]>(["All"])
    const [showTopOnly, setShowTopOnly] = useState(false)
    const [sortBy, setSortBy] = useState<'followers' | 'name' | 'newest'>('followers')
    const [mounted, setMounted] = useState(false)


    const debouncedSearchQuery = useDebounce(searchQuery, 300)

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
            queryBuilder = queryBuilder.ilike('genre', `%"${genre}"%`)
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

    const loadGenres = useCallback(async () => {
        const genresList = await fetchGenresWithCache()
        setGenres(genresList)
    }, [])

    useEffect(() => {
        setMounted(true)
        loadGenres()

        const q = searchParams.get('q')
        const genre = searchParams.get('genre')
        const top = searchParams.get('top')
        const sort = searchParams.get('sort')

        if (q) setSearchQuery(q)
        if (genre) setSelectedGenre(genre)
        if (top === 'true') setShowTopOnly(true)
        if (sort) setSortBy(sort as 'followers' | 'name' | 'newest')

        const savedScroll = sessionStorage.getItem('artists_scroll_y')
        if (savedScroll) {
            window.scrollTo(0, parseInt(savedScroll))
            sessionStorage.removeItem('artists_scroll_y')
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [loadGenres])

    useEffect(() => {
        if (!mounted) return

        const params = new URLSearchParams()
        if (debouncedSearchQuery) params.set('q', debouncedSearchQuery)
        if (selectedGenre !== "All") params.set('genre', selectedGenre)
        if (showTopOnly) params.set('top', 'true')
        if (sortBy !== 'followers') params.set('sort', sortBy)

        router.replace(`/artists?${params.toString()}`, { scroll: false })
    }, [debouncedSearchQuery, selectedGenre, showTopOnly, sortBy, router, mounted])

    const handleLoadMore = useCallback(() => {
        setSize(s => s + 1)
    }, [setSize])


    return (
        <div className="page-container">
            <div className={mounted ? 'animate-fade-in' : ''}>
                <SectionHeader title="Descubre nuevos artistas" />

                <FilterBar>
                    <div className="flex-grow-1">
                        <Input
                            placeholder="Buscar artistas"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            icon="bx bx-search bx-remove-padding"
                        />
                    </div>

                    <Select
                        value={selectedGenre}
                        onChange={(e) => setSelectedGenre(e.target.value)}
                        style={{ minWidth: '180px' }}
                    >
                        <option value="All">Todos los géneros</option>
                        {genres.filter(g => g !== "All").map((genre) => (
                            <option key={genre} value={genre}>
                                {genre}
                            </option>
                        ))}
                    </Select>

                    <Select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as 'followers' | 'name' | 'newest')}
                        style={{ minWidth: '160px' }}
                    >
                        <option value="followers">Popular</option>
                        <option value="name">Nombre</option>
                        <option value="newest">Reciente</option>
                    </Select>

                    <Button
                        variant={showTopOnly ? 'primary' : 'outline'}
                        onClick={() => setShowTopOnly(!showTopOnly)}
                        leftIcon={<i className='bxf bx-hot bx-remove-padding'></i>}
                    >
                        Artistas destacados
                    </Button>
                </FilterBar>
            </div>

            {isLoading ? (
                <div className="empty-state"><p className="empty-text">Cargando...</p></div>
            ) : (
                <>
                    <div className={styles['content-grid']}>
                        {artists.map((artist, index) => (
                            <div
                                key={artist.id}
                                className={`${styles['animate-entrance']} ${artist.is_wide ? styles['grid-item-wide'] : ''}`}
                                style={{ animationDelay: `${Math.min(index, 20) * 0.05}s` }}
                            >
                                <ArtistCard
                                    id={artist.id}
                                    name={artist.name}
                                    genre={artist.genre}
                                    image={artist.image_url || undefined}
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
                            <p className="empty-text">No se encontraron artistas</p>
                            <p className="empty-desc">No se encontraron artistas que coincidan con tus filtros</p>
                        </div>
                    )}

                    {!isReachingEnd && !isEmpty && (
                        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1rem' }}>
                            <Button
                                onClick={handleLoadMore}
                                disabled={isLoadingMore}
                                isLoading={isLoadingMore}
                                size="lg"
                                variant="primary"
                            >
                                {isLoadingMore ? 'Cargando...' : 'Cargar más'}
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
            <Suspense fallback={<div className="flex-center" style={{ padding: '4rem 0' }}><p>Cargando...</p></div>}>
                <ArtistsContent />
            </Suspense>
        </main>
    )
}
