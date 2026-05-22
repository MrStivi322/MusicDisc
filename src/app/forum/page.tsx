"use client"

import { useState, useEffect, useCallback, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ForumService } from '@/services/ForumService'
import { ForumCard } from '@/app/forum/ForumCard'
import { supabase } from '@/lib/supabase'
import { Modal } from '@/app/forum/Modal'
import { CreateThreadFixedForm } from '@/app/forum/CreateThreadForm'
import styles from '@/styles/forum/Forum.module.css'
import type { ForumCategory, ForumThread, News, UpcomingRelease } from '@/lib/database.types'
import Image from 'next/image'
import Link from 'next/link'
import { useDebounce } from '@/hooks/useDebounce'
import { useAuth } from '@/components/AuthProvider'

import { SectionHeader } from '@/components/ui/SectionHeader'
import { FilterBar } from '@/components/ui/FilterBar'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'

function ForumPageContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const { user } = useAuth()


    const ITEMS_PER_PAGE = 10

    const [categories, setCategories] = useState<ForumCategory[]>([])
    const [threads, setThreads] = useState<ForumThread[]>([])
    const [totalCount, setTotalCount] = useState(0)
    const [page, setPage] = useState(0)
    const [isLoading, setIsLoading] = useState(true)
    const [isLoadingMore, setIsLoadingMore] = useState(false)
    const [mounted, setMounted] = useState(false)
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

    const [searchQuery, setSearchQuery] = useState('')
    const [selectedCategory, setSelectedCategory] = useState('')
    const [sortBy, setSortBy] = useState<'recent' | 'popular' | 'most_commented'>('recent')
    const [showPinnedOnly, setShowPinnedOnly] = useState(false)

    const debouncedSearchQuery = useDebounce(searchQuery, 300)

    const isReachingEnd = threads.length >= totalCount
    const isEmpty = !isLoading && threads.length === 0

    useEffect(() => {
        setMounted(true)

        const loadInitialData = async () => {
            const cats = await ForumService.getCategories()
            setCategories(cats)
        }
        loadInitialData()

        const category = searchParams.get('category')
        const sort = searchParams.get('sort')
        const q = searchParams.get('q')
        const pinned = searchParams.get('pinned')

        if (category) setSelectedCategory(category)
        if (sort) setSortBy(sort as 'recent' | 'popular' | 'most_commented')
        if (q) setSearchQuery(q)
        if (pinned === 'true') setShowPinnedOnly(true)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const loadThreads = useCallback(async (pageIndex: number, replace: boolean) => {
        if (pageIndex === 0) setIsLoading(true)
        else setIsLoadingMore(true)

        try {
            const from = pageIndex * ITEMS_PER_PAGE
            const to = from + ITEMS_PER_PAGE - 1
            const result = await ForumService.getThreadsPaginated(
                selectedCategory || undefined,
                sortBy,
                debouncedSearchQuery || undefined,
                showPinnedOnly,
                from,
                to
            )
            setTotalCount(result.count)
            setThreads(prev => replace ? result.data : [...prev, ...result.data])
        } catch (error) {
            console.error('Error loading threads:', error)
        } finally {
            setIsLoading(false)
            setIsLoadingMore(false)
        }
    }, [selectedCategory, sortBy, debouncedSearchQuery, showPinnedOnly])

    useEffect(() => {
        setPage(0)
        loadThreads(0, true)
    }, [loadThreads])

    useEffect(() => {
        if (page === 0) return
        loadThreads(page, false)
    }, [page]) // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        if (!mounted) return

        const params = new URLSearchParams()
        if (selectedCategory) params.set('category', selectedCategory)
        if (sortBy !== 'recent') params.set('sort', sortBy)
        if (debouncedSearchQuery) params.set('q', debouncedSearchQuery)
        if (showPinnedOnly) params.set('pinned', 'true')

        router.replace(`/forum?${params.toString()}`, { scroll: false })
    }, [selectedCategory, sortBy, debouncedSearchQuery, showPinnedOnly, router, mounted])

    const handleCreateClick = () => {
        if (!user) {
            alert("Debes iniciar sesión para realizar esta acción.")
            return
        }
        setIsCreateModalOpen(true)
    }

    const handleThreadCreated = () => {
        setIsCreateModalOpen(false)
        setPage(0)
        loadThreads(0, true)
        router.refresh()
    }

    const handleLoadMore = useCallback(() => {
        setPage(p => p + 1)
    }, [])


    return (
        <main className={styles.main}>
            <div className="page-container">
                <SectionHeader title="Comunidad" subtitle="Comparte y discute con otros amantes de la música." className={mounted ? 'animate-fade-in' : ''} />

                <FilterBar>
                    <div className="flex-grow-1">
                        <Input
                            placeholder="Buscar discusiones..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            icon="bx bx-search bx-remove-padding"
                        />
                    </div>

                    <Select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        style={{ minWidth: '180px' }}
                    >
                        <option value="">Todas las categorías</option>
                        {categories.map((cat) => (
                            <option key={cat.id} value={cat.id}>
                                {cat.name}
                            </option>
                        ))}
                    </Select>

                    <Select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as 'recent' | 'popular' | 'most_commented')}
                        style={{ minWidth: '160px' }}
                    >
                        <option value="recent">Más recientes</option>
                        <option value="popular">Populares</option>
                        <option value="most_commented">Más comentados</option>
                    </Select>

                    <Button
                        variant={showPinnedOnly ? 'primary' : 'outline'}
                        onClick={() => setShowPinnedOnly(!showPinnedOnly)}
                        leftIcon={<i className='bxf bx-pin bx-remove-padding' />}
                        title="Fijados"
                    >
                        Fijados
                    </Button>
                    <Button
                        variant="primary"
                        onClick={handleCreateClick}
                        leftIcon={<i className='bx bx-message-plus bx-remove-padding' />}
                        title="Nueva discusión"
                    >
                        Nueva discusión
                    </Button>
                </FilterBar>

                {isLoading ? (
                    <div className="empty-state"><p className="empty-text">Cargando discusiones...</p></div>
                ) : (
                    <>
                        <div className={styles.content_grid}>
                            <div className={styles.main_column}>
                                <div className={styles.feed}>
                                    {threads.map((thread, index) => (
                                        <div
                                            key={thread.id}
                                            className={styles.animate_entrance}
                                            style={{ animationDelay: `${Math.min(index, 20) * 0.05}s` }}
                                        >
                                            <ForumCard thread={thread} />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <ForumSidebar />
                        </div>

                        {isEmpty && (
                            <div className="empty-state">
                                <p className="empty-text">No se encontraron discusiones</p>
                                <p className="empty-desc">
                                    No hay discusiones en esta sección todavía{selectedCategory ? ' en esta categoría' : ''}.
                                </p>
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
                                    {isLoadingMore ? "Cargando más..." : "Cargar más"}
                                </Button>
                            </div>
                        )}
                    </>
                )}
            </div>

            <Modal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                title="Nueva discusión"
                size="md"
            >
                <CreateThreadFixedForm
                    categories={categories}
                    onSuccess={handleThreadCreated}
                    onCancel={() => setIsCreateModalOpen(false)}
                />
            </Modal>
        </main>
    )
}


function ForumSidebar() {
    const language = 'es'

    const [topNews, setTopNews] = useState<News[]>([])
    const [upcomingReleases, setUpcomingReleases] = useState<UpcomingRelease[]>([])
    const [openSections, setOpenSections] = useState<Record<string, boolean>>({
        news: true,
        releases: true
    })

    useEffect(() => {
        async function fetchData() {
            const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
            const { data: newsData } = await supabase
                .from('news')
                .select('*')
                .gte('published_at', sevenDaysAgo)
                .order('views_count', { ascending: false })
                .limit(4)

            const { data: releasesData } = await supabase
                .from('upcoming_releases')
                .select('*, artists(*)')
                .gte('release_date', new Date().toISOString().split('T')[0])
                .order('release_date', { ascending: true })
                .limit(5)

            setUpcomingReleases(releasesData || [])
            setTopNews(newsData || [])
        }

        fetchData()
    }, [])

    const toggleSection = (section: string) => {
        setOpenSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }))
    }

    return (
        <aside className={styles.sidebar}>
            <div className={styles.sidebar_section}>
                <div
                    className={`${styles.sidebar_section_header} ${openSections.news ? styles.open : ''}`}
                    onClick={() => toggleSection('news')}
                >
                    <h3 className={styles.sidebar_section_title}>Últimas Noticias</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <i className={`bx bx-newspaper bx-remove-padding ${styles.sidebar_section_icon}`}></i>
                        <i className={`bx bx-chevron-down bx-remove-padding ${styles.dropdown_chevron} ${openSections.news ? styles.rotate : ''}`}></i>
                    </div>
                </div>
                <div className={`${styles.sidebar_section_content} ${openSections.news ? styles.open : ''}`}>
                    {topNews.length > 0 ? (
                        topNews.map((news) => (
                            <Link href={`/news/${news.id}`} key={news.id} className={styles.news_item}>
                                <div className={styles.news_image}>
                                    {news.image_url ? (
                                        <Image
                                            src={news.image_url}
                                            alt={news.title}
                                            fill
                                            sizes="120px"
                                            style={{ objectFit: 'cover' }}
                                        />
                                    ) : (
                                        <div className={styles.news_placeholder}>Noticias</div>
                                    )}
                                </div>
                                <div className={styles.news_content}>
                                    <h4>{news.title}</h4>
                                </div>
                            </Link>
                        ))
                    ) : (
                        <p className={styles.sidebar_empty_state}>No hay noticias disponibles.</p>
                    )}
                </div>
            </div>

            <div className={styles.sidebar_section}>
                <div
                    className={`${styles.sidebar_section_header} ${openSections.releases ? styles.open : ''}`}
                    onClick={() => toggleSection('releases')}
                >
                    <h3 className={styles.sidebar_section_title}>Nuevos Lanzamientos</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <i className={`bx bx-calendar-alt bx-remove-padding ${styles.sidebar_section_icon}`}></i>
                        <i className={`bx bx-chevron-down bx-remove-padding ${styles.dropdown_chevron} ${openSections.releases ? styles.rotate : ''}`}></i>
                    </div>
                </div>
                <div className={`${styles.sidebar_section_content} ${openSections.releases ? styles.open : ''}`}>
                    {upcomingReleases.length > 0 ? (
                        upcomingReleases.map((release) => {
                            const releaseDate = new Date(release.release_date)
                            const month = releaseDate.toLocaleDateString(language === 'es' ? 'es-ES' : 'en-US', { month: 'short' })
                            const day = releaseDate.getDate()

                            return (
                                <div key={release.id} className={styles.release_item}>
                                    <div className={styles.release_image}>
                                        {release.artists?.image_url ? (
                                            <Image
                                                src={release.artists.image_url}
                                                alt={release.artists.name}
                                                fill
                                                sizes="60px"
                                                style={{ objectFit: 'cover' }}
                                            />
                                        ) : (
                                            <div className={styles.release_placeholder}>
                                                {release.artists?.name?.charAt(0) || '?'}
                                            </div>
                                        )}
                                    </div>
                                    <div className={styles.release_info}>
                                        <p className={styles.release_title}>{release.album_title}</p>
                                        <p className={styles.release_artist}>{release.artists?.name || "Artista desconocido"}</p>
                                    </div>
                                    <div className={styles.release_date_badge}>
                                        <span className={styles.release_month}>{month}</span>
                                        <span className={styles.release_day}>{day}</span>
                                    </div>
                                </div>
                            )
                        })
                    ) : (
                        <p className={styles.sidebar_empty_state}>No hay lanzamientos disponibles.</p>
                    )}
                </div>
            </div>
        </aside>
    )
}

export default function ForumPage() {
    return (
        <Suspense fallback={<div className="flex-center" style={{ padding: '4rem 0' }}><p>Loading...</p></div>}>
            <ForumPageContent />
        </Suspense>
    )
}
