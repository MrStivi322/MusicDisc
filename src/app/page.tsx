"use client"

import styles from "@/styles/home/Home.module.css"

import { useEffect, useState } from "react"

function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className={styles.footer}>
          <h3 className={styles.brand_title}>AUIDIONAUTA</h3>
          <p className={styles.copyright}>© {currentYear} All rights reserved.</p>
    </footer>
  )
}

export default function Home() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <>
      <main className={styles.main}>

          <div className={`${styles.hero_content} ${mounted ? styles.mounted : ''}`}>

            <h1 className={styles.hero_title}>Descubre tus Artistas</h1>

            <div className={styles.functions_grid}>
              <div className={styles.function_card}>
                <div className={styles.function_icon}>
                  <i className="bx bx-user bx-remove-padding"></i>
                </div>
                <h3>Nuestro Publico</h3>
                <p>Jóvenes interesados en la música y a explorar nuevos generos</p>
              </div>

              <div className={styles.function_card}>
                <div className={styles.function_icon}>
                  <i className="bx bx-search bx-remove-padding" />
                </div>
                <h3>Qué nos hace especial</h3>
                <p>Otras plataformas te hacen navegar por menús confusos, aquí tenemos todo sin buscar por minutos para encontrarlo</p>
              </div>

              <div className={styles.function_card}>
                <div className={styles.function_icon}>
                  <i className="bx bx-message-dots bx-remove-padding"></i>
                </div>
                <h3>Proyecto personal</h3>
                <p>Porque me gusta la musica y ya tenía este proyecto empezado desde hace tiempo</p>
              </div>
            </div>

            <div className={styles.social_section}>
              <a href="https://www.facebook.com"
                target="_blank" rel="noopener noreferrer" className={styles.social_link} aria-label="Facebook" >
                <i style={{ color: '#1e85ff' }} className="bxl bx-facebook-circle bx-remove-padding"></i>
                <span>Facebook</span>
              </a>
              <a href="https://www.tiktok.com"
                target="_blank" rel="noopener noreferrer" className={styles.social_link} aria-label="TikTok" >
                <i style={{ color: '#fff' }} className="bxl bx-tiktok bx-remove-padding"></i>
                <span>TikTok</span>
              </a>
              <a href="https://www.instagram.com"
                target="_blank" rel="noopener noreferrer" className={styles.social_link} aria-label="Instagram" >
                <i style={{ color: '#e1306c' }} className="bxl bx-instagram bx-remove-padding"></i>
                <span>Instagram</span>
              </a>

              <a href="https://www.twitter.com"
                target="_blank" rel="noopener noreferrer" className={styles.social_link} aria-label="Twitter" >
                <i style={{ color: '#000' }} className="bxl bx-twitter-x bx-remove-padding"></i>
                <span>Twitter</span>
              </a>

              <a href="https://www.youtube.com"
                target="_blank" rel="noopener noreferrer" className={styles.social_link} aria-label="YouTube" >
                <i style={{ color: '#ff0000' }} className="bxl bx-youtube bx-remove-padding"></i>
                <span>YouTube</span>
              </a>
            </div>

            <div className={styles.stats_container}>
              <div className={styles.stat_item}>
                <div className={styles.stat_number}>+1000</div>
                <div className={styles.stat_label}>Artistas</div>
              </div>

              <div className={styles.stat_divider}></div>

              <div className={styles.stat_item}>
                <div className={styles.stat_number}>+500</div>
                <div className={styles.stat_label}>Noticias</div>
              </div>

              <div className={styles.stat_divider}></div>

              <div className={styles.stat_item}>
                <div className={styles.stat_number}>24/7</div>
                <div className={styles.stat_label}>Servicio</div>
              </div>
            </div>

          </div>
      </main>
      <Footer />
    </>
  )
}
