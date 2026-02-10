"use client"

import { useEffect } from 'react'
import Lenis from 'lenis'

export default function SmoothScroll() {
    useEffect(() => {
        const lenis = new Lenis({
            duration: 1.5,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            orientation: 'vertical',
            gestureOrientation: 'vertical',
            smoothWheel: true,
            wheelMultiplier: 1,
            touchMultiplier: 2,
        })

        let rafId: number

        function raf(time: number) {
            lenis.raf(time)
            rafId = requestAnimationFrame(raf)
        }

        rafId = requestAnimationFrame(raf)

        // Stop Lenis when modal is open (body overflow: hidden)
        const observer = new MutationObserver(() => {
            if (document.body.style.overflow === 'hidden') {
                lenis.stop()
            } else {
                lenis.start()
            }
        })

        observer.observe(document.body, {
            attributes: true,
            attributeFilter: ['style']
        })

        return () => {
            lenis.destroy()
            cancelAnimationFrame(rafId)
            observer.disconnect()
        }
    }, [])

    return null
}
