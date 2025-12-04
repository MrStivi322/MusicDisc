"use client"

import Link from "next/link"
import Image from "next/image"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import type { News, UpcomingRelease } from "@/lib/database.types"
import styles from "@/styles/components/Sidebar.module.css"
import { useLanguage } from "@/contexts/LanguageContext"

export function Sidebar() {
    const { t } = useLanguage()
    const [topNews, setTopNews] = useState<News[]>([])
    const [upcomingReleases, setUpcomingReleases] = useState<UpcomingRelease[]>([])

    useEffect(() => {
        async function fetchData() {
            const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
            const { data: newsData } = await supabase
                .from('news')
                .select('*')
                .gte('published_at', sevenDaysAgo)
                .order('views_count', { ascending: false })
                .limit(4)

            const { data: releasesData, error: releasesError } = await supabase
                .from('upcoming_releases')
                .select('*, artists(*)')
                .gte('release_date', new Date().toISOString().split('T')[0])
                .order('release_date', { ascending: true })

            if (releasesError) {
            } else {
                setUpcomingReleases(releasesData || [])
            }

            setTopNews(newsData || [])
        }

        fetchData()
    }, [])

    return (
        <aside className={styles.sidebar}>
            <div className={styles.section}>
                <div className={styles.section_header}>
                    <i className={`bx bx-news ${styles.section_icon}`}></i>
                    <h3 className={styles.section_title}>{t('home.news.title')}</h3>
                </div>
                <div className={styles.section_content}>
                    {topNews.length > 0 ? (
                        topNews.map((news) => (
                            <Link href={`/news/${news.id}`} key={news.id} className={styles.news_item}>
                                <div className={styles.news_card}>
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
                                            <div className={styles.news_placeholder}>News</div>
                                        )}
                                    </div>
                                    <div className={styles.news_content}>
                                        <h4>{news.title}</h4>
                                    </div>
                                </div>
                            </Link>
                        ))
                    ) : (
                        <p className={styles.empty_state}>{t('news.empty')}</p>
                    )}
                </div>
            </div>

            <div className={styles.section}>
                <div className={styles.section_header}>
                    <i className={`bx bx-calendar-alt ${styles.section_icon}`}></i>
                    <h3 className={styles.section_title}>{t('category.Releases')}</h3>
                </div>
                <div className={styles.section_content}>
                    {upcomingReleases.length > 0 ? (
                        upcomingReleases.map((release) => {
                            const releaseDate = new Date(release.release_date)
                            const month = releaseDate.toLocaleDateString('en-US', { month: 'short' })
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
                                        <p className={styles.release_artist}>{release.artists?.name || 'Unknown'}</p>
                                    </div>
                                    <div className={styles.release_date_badge}>
                                        <span className={styles.release_month}>{month}</span>
                                        <span className={styles.release_day}>{day}</span>
                                    </div>
                                </div>
                            )
                        })
                    ) : (
                        <p className={styles.empty_state}>{t('news.empty')}</p>
                    )}
                </div>
            </div>
        </aside>
    )
}
