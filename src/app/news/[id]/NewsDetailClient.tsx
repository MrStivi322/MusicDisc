"use client"

import { useState, useEffect } from "react"
import { supabase, fetchNewsWithCache } from "@/lib/supabase"
import type { News } from "@/lib/database.types"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import styles from "@/styles/news/NewsDetail.module.css"

import { sanitizeHTMLWithLinks } from "@/lib/sanitizeWithLinks"

function getReadingTime(content: string | null): number {
    if (!content) return 1
    const plainText = content.replace(/<[^>]*>/g, '')
    const words = plainText.trim().split(/\s+/).length
    return Math.max(1, Math.ceil(words / 200))
}

export default function NewsDetailClient({ params }: { params: Promise<{ id: string }> }) {
    const language = 'es'

    const router = useRouter()
    const [article, setArticle] = useState<News | null>(null)
    const [related, setRelated] = useState<News[]>([])
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
            fetchRelated(resolvedParams.id)
        }
    }

    async function fetchRelated(currentId: string) {
        const { data } = await supabase
            .from('news')
            .select('id, title, excerpt, image_url, category, author, published_at, views_count')
            .neq('id', currentId)
            .order('published_at', { ascending: false })
            .limit(3)

        if (data) setRelated(data as News[])
    }

    if (!article) {
        return (
            <main className={styles.main}>
                <div className="flex-center" style={{ minHeight: '50vh' }}>
                    <p>Cargando...</p>
                </div>
            </main>
        )
    }

    const readingTime = getReadingTime(article.content)

    return (
        <main className={styles.main}>
            {/* <div className="page-container">
                <nav className="breadcrumbs" aria-label="Breadcrumb">
                    <Link href="/" className="breadcrumb_link">Inicio</Link>
                    <span className="breadcrumb_separator">/</span>
                    <Link href="/news" className="breadcrumb_link">Noticias</Link>
                    <span className="breadcrumb_separator">/</span>
                    <span className="breadcrumb_current">{article.title}</span>
                </nav>

                <div className="navigation_header">
                    <button
                        onClick={() => router.push('/forum')}
                        className="back_button"
                    >
                        <i className='bx bx-arrow-to-left bx-remove-padding'></i>
                        Volver a la Comunidad
                    </button>
                </div>
            </div>

            <div className={styles.content_section_container}>
                <div className={styles.card}>
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
                        {article.category && article.category.length > 0 && (
                            <div className={styles.categories_overlay}>
                                {article.category.map((cat) => (
                                    <span key={cat} className={styles.category_badge}>{cat}</span>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className={styles.meta_section}>
                        <h1 className={styles.title}>{article.title}</h1>

                        {article.excerpt && (
                            <p className={styles.excerpt}>{article.excerpt}</p>
                        )}

                        <div className={styles.meta}>
                            <div className={styles.meta_item}>
                                <i className={`bx bx-calendar-alt bx-remove-padding ${styles.meta_icon}`}></i>
                                <time>{new Date(article.published_at).toLocaleDateString(language === 'es' ? 'es-ES' : 'en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</time>
                            </div>
                            {article.author && (
                                <div className={styles.meta_item}>
                                    <i className={`bx bx-user bx-remove-padding ${styles.meta_icon}`}></i>
                                    <span>{article.author}</span>
                                </div>
                            )}
                            <div className={styles.meta_item}>
                                <i className={`bx bx-eye bx-remove-padding ${styles.meta_icon}`}></i>
                                <span>{article.views_count || 0} vistas</span>
                            </div>
                            <div className={styles.meta_item}>
                                <i className={`bx bx-reading bx-remove-padding ${styles.meta_icon}`}></i>
                                <span>{readingTime} min de lectura</span>
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

                    {related.length > 0 && (
                        <div className={styles.related_section}>
                            <h3 className={styles.related_title}>
                                <i className='bx bx-news bx-remove-padding'></i>
                                {language === 'es' ? 'Artículos Relacionados' : 'Related Articles'}
                            </h3>
                            <div className={styles.related_grid}>
                                {related.map((item) => (
                                    <Link href={`/news/${item.id}`} key={item.id} className={styles.related_item}>
                                        <div className={styles.related_image}>
                                            {item.image_url ? (
                                                <Image
                                                    src={item.image_url}
                                                    alt={item.title}
                                                    fill
                                                    sizes="120px"
                                                    style={{ objectFit: 'cover' }}
                                                />
                                            ) : (
                                                <div className={styles.related_placeholder}>
                                                    <i className='bx bx-music bx-remove-padding'></i>
                                                </div>
                                            )}
                                        </div>
                                        <div className={styles.related_info}>
                                            <p className={styles.related_item_title}>{item.title}</p>
                                            <span className={styles.related_item_date}>
                                                {new Date(item.published_at).toLocaleDateString(language === 'es' ? 'es-ES' : 'en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div> */}
            <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                justifyContent: 'center', 
                minHeight: '60vh',
                textAlign: 'center',
                padding: '2rem'
            }}>
                <i className='bx bx-ghost' style={{ fontSize: '6rem', color: 'var(--color-primary)', marginBottom: '1rem' }}></i>
                <h1 style={{ fontSize: '3.5rem', fontWeight: '800', margin: 0 }}>404</h1>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>¡Vaya! El hilo se ha esfumado</h2>
                <p style={{ maxWidth: '450px', marginBottom: '2.5rem', opacity: 0.7, lineHeight: '1.6' }}>
                    Parece que la discusión que buscas no existe o ha cambiado de escenario. 
                    Tal vez prefieras explorar otros temas en nuestra comunidad.
                </p>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                    <Link href="/forum" className="btn btn-primary">
                        <i className='bx bx-left-arrow-alt'></i> Volver al Foro
                    </Link>
                </div>
            </div>

        </main>
    )
}
