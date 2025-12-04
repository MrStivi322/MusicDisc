"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import useSWRInfinite from "swr/infinite"
import { NewsCard } from "@/components/NewsCard"
import { SkeletonCard } from "@/components/SkeletonLoader"
import { Sidebar } from "@/components/Sidebar"
import { supabase, fetchCategoriesWithCache } from "@/lib/supabase"
import type { News } from "@/lib/database.types"
import styles from "@/styles/pages/News.module.css"
import { useLanguage } from "@/contexts/LanguageContext"

const ITEMS_PER_PAGE = 9;

export default function NewsPage() {
    const { t } = useLanguage()
    const router = useRouter()
    const searchParams = useSearchParams()
    const [activeCategory, setActiveCategory] = useState(searchParams.get('category') || "All")
    const [categories, setCategories] = useState<string[]>(["All"])
    const [mounted, setMounted] = useState(false)

    // SWR Fetcher
    const fetchNews = async ([key, pageIndex, category]: [string, number, string]) => {
        const from = pageIndex * ITEMS_PER_PAGE
        const to = from + ITEMS_PER_PAGE - 1

        let query = supabase
            .from('news')
            .select('*, comments(count)', { count: 'exact' })
            .order('published_at', { ascending: false })
            .range(from, to)

        if (category !== "All") {
            query = query.contains('category', [category])
        }

        const { data, error, count } = await query

        if (error) throw error
        return { data: data || [], count: count || 0 }
    }

    // SWR Key
    const getKey = (pageIndex: number, previousPageData: { data: (News & { comments: { count: number }[] })[], count: number } | null) => {
        if (previousPageData && !previousPageData.data.length) return null // reached the end
        return ['news', pageIndex, activeCategory]
    }

    const { data, size, setSize, isValidating, isLoading } = useSWRInfinite(getKey, fetchNews, {
        revalidateFirstPage: false,
        revalidateOnFocus: false,
        persistSize: true
    })

    const news = data ? data.flatMap(page => page.data) : []
    const totalCount = data && data[0] ? data[0].count : 0
    const isLoadingMore = isLoading || (size > 0 && data && typeof data[size - 1] === "undefined");
    const isEmpty = data?.[0]?.data.length === 0;
    const isReachingEnd = isEmpty || (data && data[data.length - 1]?.data.length < ITEMS_PER_PAGE);

    useEffect(() => {
        setMounted(true)
        loadCategories()

        const savedScroll = sessionStorage.getItem('news_scroll_y')
        if (savedScroll) {
            window.scrollTo(0, parseInt(savedScroll))
            sessionStorage.removeItem('news_scroll_y')
        }
    }, [])

    useEffect(() => {
        const params = new URLSearchParams()
        if (activeCategory !== "All") params.set('category', activeCategory)
        router.replace(`/news?${params.toString()}`, { scroll: false })
    }, [activeCategory, router])

    async function loadCategories() {
        const categoriesList = await fetchCategoriesWithCache()
        setCategories(categoriesList)
    }

    function handleLoadMore() {
        setSize(size + 1)
    }

    return (
        <main className={styles.main}>
            <div className="page-container">
                <div className={`page-header ${mounted ? 'animate-fade-in' : ''}`}>
                    <h1 className="page-title">{t('news.title')}</h1>
                    <p className="page-subtitle">
                        {t('news.subtitle')}
                        {!isLoading && totalCount > 0 && (
                            <span style={{ opacity: 0.7, marginLeft: '0.5rem' }}>
                                • {totalCount} {t('news.found') || 'found'}
                            </span>
                        )}
                    </p>

                    <div className="sr-only" aria-live="polite" aria-atomic="true">
                        {isLoading ? 'Loading news...' : `${totalCount} articles found`}
                    </div>
                    <div className={styles.filter_bar}>
                        {categories.map((category) => (
                            <button
                                key={category}
                                onClick={() => setActiveCategory(category)}
                                className={`${styles.filter_button} ${activeCategory === category ? styles.active : ''}`}
                                aria-label={`Filter by ${category}`}
                                aria-pressed={activeCategory === category}
                            >
                                {category === "All" ? "All" : (t(`category.${category}`) === `category.${category}` ? category : t(`category.${category}`))}
                            </button>
                        ))}
                    </div>

                    <select
                        value={activeCategory}
                        onChange={(e) => setActiveCategory(e.target.value)}
                        className={styles.mobile_filter_select}
                        aria-label="Filter news by category"
                    >
                        {categories.map((category) => (
                            <option key={category} value={category}>
                                {category === "All" ? "All Categories" : (t(`category.${category}`) === `category.${category}` ? category : t(`category.${category}`))}
                            </option>
                        ))}
                    </select>
                </div>

                {isLoading ? (
                    <div className="content-layout">
                        <div className="news-grid">
                            <SkeletonCard variant="news" count={9} />
                        </div>
                        <Sidebar />
                    </div>
                ) : (
                    <div className="content-layout animate-fade-in">
                        <div className="news-grid">
                            {news.map((article, index) => (
                                <div key={article.id} className="animate-entrance" style={{ animationDelay: `${index * 0.05}s` }}>
                                    <NewsCard
                                        id={article.id}
                                        title={article.title}
                                        excerpt={article.excerpt || ""}
                                        image={article.image_url || undefined}
                                        date={new Date(article.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                        category={article.category}
                                        author={article.author || undefined}
                                        viewsCount={article.views_count || 0}
                                        commentsCount={(article as any).comments?.[0]?.count || 0}
                                        onClick={() => {
                                            sessionStorage.setItem('news_scroll_y', window.scrollY.toString())
                                            sessionStorage.setItem('news_last_filters', JSON.stringify({ category: activeCategory }))
                                        }}
                                    />
                                </div>
                            ))}

                            {news.length === 0 && (
                                <div className="empty-state">
                                    <p className="empty-text">{t('news.empty')}</p>
                                </div>
                            )}
                        </div>

                        {!isReachingEnd && !isEmpty && (
                            <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'center', marginTop: '2rem' }}>
                                <button
                                    onClick={handleLoadMore}
                                    disabled={isLoadingMore}
                                    className="ripple"
                                    style={{
                                        padding: '1rem 2rem',
                                        fontSize: '1rem',
                                        fontWeight: '600',
                                        borderRadius: '12px',
                                        border: 'none',
                                        background: 'linear-gradient(135deg, hsl(24, 95%, 53%) 0%, hsl(24, 95%, 65%) 100%)',
                                        color: 'white',
                                        cursor: isLoadingMore ? 'not-allowed' : 'pointer',
                                        opacity: isLoadingMore ? 0.6 : 1,
                                        transition: 'all 0.3s ease'
                                    }}
                                >
                                    {isLoadingMore ? 'Loading...' : 'Load More'}
                                </button>
                            </div>
                        )}

                        <Sidebar />
                    </div>
                )}
            </div>
        </main>
    )
}
