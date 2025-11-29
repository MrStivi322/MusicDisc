import styles from "@/styles/components/SkeletonLoader.module.css"

interface SkeletonCardProps {
    variant?: 'artist' | 'news'
    count?: number
}

export function SkeletonCard({ variant = 'artist', count = 6 }: SkeletonCardProps) {
    return (
        <>
            {Array.from({ length: count }).map((_, index) => (
                <div key={index} className={`${styles.skeleton_card} ${styles[variant]}`}>
                    <div className={styles.skeleton_image}></div>

                    {variant === 'artist' ? (
                        <div className={styles.skeleton_content}>
                            <div className={styles.skeleton_text} style={{ width: '70%' }}></div>
                        </div>
                    ) : (
                        <div className={styles.skeleton_content}>
                            <div className={styles.skeleton_text} style={{ width: '40%', height: '12px' }}></div>
                            <div className={styles.skeleton_text} style={{ width: '90%', height: '20px', marginTop: '8px' }}></div>
                            <div className={styles.skeleton_text} style={{ width: '100%', height: '14px', marginTop: '8px' }}></div>
                            <div className={styles.skeleton_text} style={{ width: '85%', height: '14px', marginTop: '4px' }}></div>
                            <div className={styles.skeleton_footer}>
                                <div className={styles.skeleton_text} style={{ width: '100px', height: '14px' }}></div>
                                <div className={styles.skeleton_text} style={{ width: '80px', height: '14px' }}></div>
                            </div>
                        </div>
                    )}
                </div>
            ))}
        </>
    )
}

export function SkeletonText({ width = '100%', height = '16px' }: { width?: string; height?: string }) {
    return <div className={styles.skeleton_text} style={{ width, height }}></div>
}

export function SkeletonNewsDetail() {
    return (
        <div className={styles.skeleton_news_detail}>
            <div className={styles.skeleton_news_grid}>
                <div className={styles.skeleton_news_image}>
                    <div className={styles.skeleton_badge}></div>
                </div>
                <div className={styles.skeleton_news_meta}>
                    <div className={styles.skeleton_text} style={{ width: '100%', height: '32px', marginBottom: '1rem' }}></div>
                    <div className={styles.skeleton_text} style={{ width: '60%', height: '16px' }}></div>
                    <div className={styles.skeleton_text} style={{ width: '50%', height: '16px', marginTop: '0.5rem' }}></div>
                    <div className={styles.skeleton_text} style={{ width: '55%', height: '16px', marginTop: '0.5rem' }}></div>
                </div>
            </div>
            <div className={styles.skeleton_news_content}>
                <div className={styles.skeleton_text} style={{ width: '100%', height: '16px' }}></div>
                <div className={styles.skeleton_text} style={{ width: '95%', height: '16px', marginTop: '0.75rem' }}></div>
                <div className={styles.skeleton_text} style={{ width: '100%', height: '16px', marginTop: '0.75rem' }}></div>
                <div className={styles.skeleton_text} style={{ width: '90%', height: '16px', marginTop: '0.75rem' }}></div>
                <div className={styles.skeleton_text} style={{ width: '85%', height: '16px', marginTop: '0.75rem' }}></div>
            </div>
        </div>
    )
}

export function SkeletonProfile() {
    return (
        <div className={styles.skeleton_profile}>
            <div className={styles.skeleton_profile_hero}></div>

            <div className={styles.skeleton_profile_content}>
                <div className={styles.skeleton_profile_main}>
                    <div className={styles.skeleton_profile_section}>
                        <div className={styles.skeleton_section_header}>
                            <div className={styles.skeleton_text} style={{ width: '150px', height: '28px' }}></div>
                            <div className={styles.skeleton_icon}></div>
                        </div>
                        <div className={styles.skeleton_text} style={{ width: '100%', height: '18px', marginTop: '1rem' }}></div>
                        <div className={styles.skeleton_text} style={{ width: '95%', height: '18px', marginTop: '0.75rem' }}></div>
                        <div className={styles.skeleton_text} style={{ width: '100%', height: '18px', marginTop: '0.75rem' }}></div>
                        <div className={styles.skeleton_text} style={{ width: '85%', height: '18px', marginTop: '0.75rem' }}></div>
                    </div>

                    <div className={styles.skeleton_profile_section}>
                        <div className={styles.skeleton_section_header}>
                            <div className={styles.skeleton_text} style={{ width: '180px', height: '28px' }}></div>
                            <div className={styles.skeleton_icon}></div>
                        </div>
                        <div className={styles.skeleton_albums_grid}>
                            <div className={styles.skeleton_album}></div>
                            <div className={styles.skeleton_album}></div>
                        </div>
                    </div>
                </div>

                <div className={styles.skeleton_profile_sidebar}>
                    <div className={styles.skeleton_section_header}>
                        <div className={styles.skeleton_text} style={{ width: '100px', height: '28px' }}></div>
                        <div className={styles.skeleton_icon}></div>
                    </div>
                    <div className={styles.skeleton_stats_grid}>
                        <div className={styles.skeleton_stat}></div>
                        <div className={styles.skeleton_stat}></div>
                        <div className={styles.skeleton_stat}></div>
                        <div className={styles.skeleton_stat}></div>
                    </div>
                </div>
            </div>
        </div>
    )
}

