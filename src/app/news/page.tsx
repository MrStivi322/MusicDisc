"use client"

import { useState, useEffect } from "react"
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
    const [activeCategory, setActiveCategory] = useState("All")
    const [news, setNews] = useState<News[]>([])
    const [categories, setCategories] = useState<string[]>(["All"])
    const [loading, setLoading] = useState(true)
    const [mounted, setMounted] = useState(false)
    const [page, setPage] = useState(1)
    const [hasMore, setHasMore] = useState(true)
    const [loadingMore, setLoadingMore] = useState(false)

    useEffect(() => {
        setMounted(true)
        loadCategories()
    }, [])

    useEffect(() => {
        setPage(1)
        setNews([])
        fetchNews(1, true)
    }, [activeCategory])

    async function loadCategories() {
        const categoriesList = await fetchCategoriesWithCache()
        setCategories(categoriesList)
    }

    async function fetchNews(pageNum: number = 1, reset: boolean = false) {
        if (reset) {
            setLoading(true)
        } else {
            setLoadingMore(true)
        }

        const from = (pageNum - 1) * ITEMS_PER_PAGE
        const to = from + ITEMS_PER_PAGE - 1

        let query = supabase
            .from('news')
            .select('*, comments(count)', { count: 'exact' })
            .order('published_at', { ascending: false })
            .range(from, to)

        if (activeCategory !== "All") {
            query = query.eq('category', activeCategory)
        }

        const { data, error, count } = await query

        if (error) {
            console.error('Error fetching news:', error)
        } else {
            if (reset) {
                setNews(data || [])
            } else {
                setNews(prev => [...prev, ...(data || [])])
            }

            const totalLoaded = reset ? (data?.length || 0) : news.length + (data?.length || 0)
            setHasMore(totalLoaded < (count || 0))
        }

        setLoading(false)
        setLoadingMore(false)
    }

    function handleLoadMore() {
        const nextPage = page + 1
        setPage(nextPage)
        fetchNews(nextPage, false)
    }

    return (
        <main className={styles.main}>
            <div className="page-container">
                <div className={`page-header ${mounted ? 'animate-fade-in' : ''}`}>
                    <h1 className="page-title">{t('news.title')}</h1>
                    <p className="page-subtitle">
                        {t('news.subtitle')}
                    </p>

                    <div className={styles.filter_bar}>
                        {categories.map((category) => (
                            <button
                                key={category}
                                onClick={() => setActiveCategory(category)}
                                className={`${styles.filter_button} ${activeCategory === category ? styles.active : ''}`}
                            >
                                {category === "All" ? "All" : (t(`category.${category}`) === `category.${category}` ? category : t(`category.${category}`))}
                            </button>
                        ))}
                    </div>
                </div>

                {loading ? (
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
                                <div key={article.id} className="grid-item" style={{ animationDelay: `${index * 0.05}s` }}>
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
                                    />
                                </div>
                            ))}

                            {news.length === 0 && (
                                <div className="empty-state">
                                    <p className="empty-text">{t('news.empty')}</p>
                                </div>
                            )}
                        </div>

                        {hasMore && news.length > 0 && (
                            <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'center', marginTop: '2rem' }}>
                                <button
                                    onClick={handleLoadMore}
                                    disabled={loadingMore}
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

                        <Sidebar />
                    </div>
                )}
            </div>
        </main>
    )
}
