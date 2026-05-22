"use client"

import styles from "@/styles/home/Home.module.css"

import { useEffect, useState } from "react"

import Link from "next/link"

function Footer() {
  const t = (k: string) => k


  const currentYear = new Date().getFullYear()

  const footerLinks = [
    { label:'Privacy', href: '/legal?type=privacy' },
    { label: 'Terms', href: '/legal?type=terms' },
  ]

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.left}>
          <h3 className={styles.brand_title}>AUIDIONAUTA</h3>
          <p className={styles.copyright}>© {currentYear} All rights reserved.</p>
        </div>

        <div className={styles.center}>
          {footerLinks.map((link) => (
            <Link key={link.href} href={link.href} className={styles.footer_link}>
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  )
}

export default function Home() {
  const t = (k: string) => k


  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <>
      <main className={styles.main}>
        <div className={styles.hero_section}>

          <div className={`${styles.hero_content} ${mounted ? styles.mounted : ''}`}>

            <h1 className={styles.hero_title}>Descubre tus Artistas</h1>

            <div className={styles.functions_grid}>
              <div className={styles.function_card}>
                <div className={styles.function_icon}>
                  <i className="bx bx-user bx-remove-padding"></i>
                </div>
                <h3>Nuestro Publico</h3>
                <p>Jóvenes interesados en la música y interesados a explorar nuevos generos</p>
              </div>

              <div className={styles.function_card}>
                <div className={styles.function_icon}>
                  <i className="bx bx-search bx-remove-padding" />
                </div>
                <h3>Qué nos hace especial</h3>
                <p>Mientras otras plataformas te hacen navegar por algoritmos y menús confusos, tenemos directamente sin buscar por minutos para encontrar lo que
quieres</p>
              </div>

              <div className={styles.function_card}>
                <div className={styles.function_icon}>
                  <i className="bx bx-message-dots bx-remove-padding"></i>
                </div>
                <h3>Proyecto personal</h3>
                <p>Porque me gusta la musica y ya tenía este proyecto empezado desde hace tiempo</p>
              </div>
            </div>

            <div className={styles.stats_container}>
              <div className={styles.stat_item}>
                <div className={styles.stat_number}>1000+</div>
                <div className={styles.stat_label}>Artistas</div>
              </div>

              <div className={styles.stat_divider}></div>

              <div className={styles.stat_item}>
                <div className={styles.stat_number}>500+</div>
                <div className={styles.stat_label}>Noticias</div>
              </div>

              <div className={styles.stat_divider}></div>

              <div className={styles.stat_item}>
                <div className={styles.stat_number}>24/7</div>
                <div className={styles.stat_label}>Actualizaciones</div>
              </div>
            </div>
          </div>

        </div>
      </main>
      <Footer />
    </>
  )
}
