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

          <div className={styles.functions_grid}>
            <div className={styles.function_card}>
              <div className={styles.function_icon}>
                <i className="bx bx-scan-search"></i>
              </div>
              <h3>{t('home.function.search.title')}</h3>
              <p>{t('home.function.search.desc')}</p>
            </div>

            <div className={styles.function_card}>
              <div className={styles.function_icon}>
                <i className="bx bx-message-dots"></i>
              </div>
              <h3>{t('home.function.forum.title')}</h3>
              <p>{t('home.function.forum.desc')}</p>
            </div>

            <div className={styles.function_card}>
              <div className={styles.function_icon}>
                <i className="bx bx-user-circle"></i>
              </div>
              <h3>{t('home.function.profile.title')}</h3>
              <p>{t('home.function.profile.desc')}</p>
            </div>

            <div className={styles.function_card}>
              <div className={styles.function_icon}>
                <i className="bxl bx-spotify"></i>
              </div>
              <h3>{t('home.function.spotify.title')}</h3>
              <p>{t('home.function.spotify.desc')}</p>
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
