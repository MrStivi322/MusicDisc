"use client"

import { useTheme } from "next-themes"
import styles from "@/styles/components/ThemeToggle.module.css"

export function ThemeToggle({ className }: { className?: string }) {
    const { setTheme, theme } = useTheme()

    return (
        <button
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            className={`${styles.toggle_btn} ${className || ''}`}
        >
            <i className={`bx bx-sun ${styles.sun_icon}`}></i>
            <i className={`bx bx-moon ${styles.moon_icon}`}></i>
            <span className={styles.sr_only}>Toggle theme</span>
        </button>
    )
}
