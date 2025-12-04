"use client"

import { useState, useEffect } from 'react'
import styles from '@/styles/components/ScrollToTop.module.css'

export function ScrollToTop() {
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        const toggleVisibility = () => {
            if (window.scrollY > 300) {
                setIsVisible(true)
            } else {
                setIsVisible(false)
            }
        }

        window.addEventListener('scroll', toggleVisibility)
        return () => window.removeEventListener('scroll', toggleVisibility)
    }, [])

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        })
    }

    return (
        <>
            <button
                onClick={scrollToTop}
                className={`${styles.scroll_to_top} ${isVisible ? styles.visible : ''}`}
                aria-label="Scroll to top"
                aria-hidden={!isVisible}
                tabIndex={isVisible ? 0 : -1}
            >
                <i className='bx bx-chevron-up'></i>
            </button>
        </>
    )
}
