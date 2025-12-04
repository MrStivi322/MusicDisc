"use client"

import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"

export default function PageTransition({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()
    const [displayChildren, setDisplayChildren] = useState(children)
    const [transitionStage, setTransitionStage] = useState("fadeIn")

    useEffect(() => {
        setTransitionStage("fadeOut")
    }, [pathname])

    useEffect(() => {
        if (transitionStage === "fadeOut") {
            const timeout = setTimeout(() => {
                setDisplayChildren(children)
                setTransitionStage("fadeIn")
            }, 150)
            return () => clearTimeout(timeout)
        }
    }, [transitionStage, children])

    return (
        <main
            id="main-content"
            tabIndex={-1}
            style={{
                animation: `${transitionStage === "fadeOut" ? "fadeOut" : "fadeIn"} 0.15s ease-in-out`,
                opacity: transitionStage === "fadeOut" ? 0 : 1,
                outline: 'none', // Remove outline on focus as it's programmatic
            }}
        >
            {displayChildren}
        </main>
    )
}
