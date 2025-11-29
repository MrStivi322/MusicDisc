"use client"

import styles from "@/styles/pages/Home.module.css"
import { useLanguage } from "@/contexts/LanguageContext"
import { useEffect, useState } from "react"

export default function Home() {
  const { t } = useLanguage()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <main className={styles.main}>
      <div className={styles.hero_section}>

        <div className={`${styles.hero_content} ${mounted ? styles.mounted : ''}`}>

          <h1 className={styles.hero_title}>
            {t('home.hero.title')}
          </h1>

          <p className={styles.hero_subtitle}>
            {t('home.hero.subtitle')}
          </p>

          <div className={styles.cta_container}>
            <div className={styles.cta_card}>
              <div className={styles.cta_icon}>
                <i className="bx bx-search-alt"></i>
              </div>
              <h3>{t('home.features.discover.title')}</h3>
              <p>{t('home.features.discover.desc')}</p>
            </div>

            <div className={styles.cta_card}>
              <div className={styles.cta_icon}>
                <i className="bx bx-news"></i>
              </div>
              <h3>{t('home.features.news.title')}</h3>
              <p>{t('home.features.news.desc')}</p>
            </div>

            <div className={styles.cta_card}>
              <div className={styles.cta_icon}>
                <i className="bx bx-play-circle"></i>
              </div>
              <h3>{t('home.features.listen.title')}</h3>
              <p>{t('home.features.listen.desc')}</p>
            </div>
          </div>

          <div className={styles.stats_container}>
            <div className={styles.stat_item}>
              <div className={styles.stat_number}>1000+</div>
              <div className={styles.stat_label}>{t('home.stats.artists')}</div>
            </div>

            <div className={styles.stat_divider}></div>

            <div className={styles.stat_item}>
              <div className={styles.stat_number}>500+</div>
              <div className={styles.stat_label}>{t('home.stats.news')}</div>
            </div>

            <div className={styles.stat_divider}></div>

            <div className={styles.stat_item}>
              <div className={styles.stat_number}>24/7</div>
              <div className={styles.stat_label}>{t('home.stats.updates')}</div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
