"use client"

import { useState, useEffect } from "react"
import { supabase, fetchNewsWithCache } from "@/lib/supabase"
import type { News } from "@/lib/database.types"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import styles from "@/styles/pages/NewsDetail.module.css"
import { SkeletonNewsDetail } from "@/components/SkeletonLoader"
import { useLanguage } from "@/contexts/LanguageContext"
import { sanitizeHTMLWithLinks } from "@/lib/sanitizeWithLinks"



export default function NewsDetailClient({ params }: { params: Promise<{ id: string }> }) {
    const { t, language } = useLanguage()
    const router = useRouter()
    const [article, setArticle] = useState<News | null>(null)
    const [resolvedParams, setResolvedParams] = useState<{ id: string } | null>(null)

    useEffect(() => {
        params.then(setResolvedParams)
    }, [params])

    useEffect(() => {
        if (resolvedParams) {
            fetchArticle()
        }
    }, [resolvedParams])

    async function fetchArticle() {
        if (!resolvedParams) return

        const { data, error } = await fetchNewsWithCache(resolvedParams.id)

        if (!error && data) {
            setArticle(data)

            supabase
                .from('news')
                .update({ views_count: (data.views_count || 0) + 1 })
                .eq('id', resolvedParams.id)
                .then(() => { })
        }
    }

    function handleBack() {
        router.push('/forum')
    }

    if (!article) {
        return (
            <main className={styles.main}>
                <SkeletonNewsDetail />
            </main>
        )
    }

    return (
        <main className={styles.main}>
            <nav className="breadcrumbs" aria-label="Breadcrumb">
                <Link href="/" className="breadcrumb_link">Home</Link>
                <span className="breadcrumb_separator">/</span>
                <Link href="/forum" className="breadcrumb_link">Forum</Link>
                <span className="breadcrumb_separator">/</span>
                <span className="breadcrumb_current">{article.title}</span>
            </nav>

            <div className="navigation_header">
                <button onClick={handleBack} className="back_button ripple">
                    <i className='bx bx-arrow-to-left'></i>
                    Back to Forum
                </button>
            </div>

            <div className={styles.content_section_container}>
                <div className={styles.sidebar_card}>
                    <div className={styles.image_section}>
                        {article.image_url ? (
                            <div className={styles.hero_image}>
                                <Image
                                    src={article.image_url}
                                    alt={article.title}
                                    fill
                                    priority
                                    sizes="(max-width: 768px) 100vw, 75vw"
                                    style={{ objectFit: 'cover' }}
                                />
                            </div>
                        ) : (
                            <div className={styles.hero_image} />
                        )}
                    </div>

                    <div className={styles.meta_section}>
                        <h1 className={styles.title}>{article.title}</h1>

                        <div className={styles.meta}>
                            <div className={styles.meta_item}>
                                <i className={`bx bx-calendar-alt ${styles.meta_icon}`}></i>
                                <time>{new Date(article.published_at).toLocaleDateString(language, { month: 'long', day: 'numeric', year: 'numeric' })}</time>
                            </div>
                            {article.author && (
                                <div className={styles.meta_item}>
                                    <i className={`bx bx-user ${styles.meta_icon}`}></i>
                                    <span>{article.author}</span>
                                </div>
                            )}
                            <div className={styles.meta_item}>
                                <i className={`bx bx-eye ${styles.meta_icon}`}></i>
                                <span>{article.views_count || 0} {t('news.views')}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className={styles.content_section}>
                    {article.content && (
                        <div
                            className={styles.article_content}
                            dangerouslySetInnerHTML={{
                                __html: sanitizeHTMLWithLinks(article.content)
                            }}
                        />
                    )}
                </div>
            </div>
        </main>
    )
}
