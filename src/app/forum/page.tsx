"use client"

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ForumService } from '@/services/ForumService'
import { ForumCard } from '@/components/forum/ForumCard'
import { ForumSidebar } from '@/components/forum/ForumSidebar'
import { Modal } from '@/components/Modal'
import { CreateThreadFixedForm } from '@/components/forum/CreateThreadFixedForm'
import styles from '@/styles/pages/Forum.module.css'
import type { ForumCategory, ForumThread } from '@/lib/database.types'
import { useDebounce } from '@/hooks/useDebounce'
import { useAuth } from '@/components/AuthProvider'
import { useLanguage } from '@/contexts/LanguageContext'

// New Standard Components
import { SectionHeader } from '@/components/ui/SectionHeader'
import { FilterBar } from '@/components/ui/FilterBar'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'

import { Suspense } from 'react'

function ForumPageContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const { user } = useAuth()
    const { t } = useLanguage()

    const [categories, setCategories] = useState<ForumCategory[]>([])
    const [threads, setThreads] = useState<ForumThread[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [mounted, setMounted] = useState(false)
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

    // Filter states
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedCategory, setSelectedCategory] = useState('')
    const [sortBy, setSortBy] = useState<'recent' | 'popular' | 'most_commented'>('recent')
    const [showPinnedOnly, setShowPinnedOnly] = useState(false)

    const debouncedSearchQuery = useDebounce(searchQuery, 300)

    // Load initial data and read URL params
    useEffect(() => {
        setMounted(true)

        const loadInitialData = async () => {
            const cats = await ForumService.getCategories()
            setCategories(cats)
        }
        loadInitialData()

        // Read search params
        const category = searchParams.get('category')
        const sort = searchParams.get('sort')
        const q = searchParams.get('q')
        const pinned = searchParams.get('pinned')

        if (category) setSelectedCategory(category)
        if (sort) setSortBy(sort as 'recent' | 'popular' | 'most_commented')
        if (q) setSearchQuery(q)
        if (pinned === 'true') setShowPinnedOnly(true)
    }, [searchParams])

    // Load threads function
    const loadThreads = useCallback(async () => {
        setIsLoading(true)
        try {
            const data = await ForumService.getThreads(
                selectedCategory || undefined,
                sortBy,
                debouncedSearchQuery || undefined,
                showPinnedOnly
            )
            setThreads(data)
        } catch (error) {
            console.error('Error loading threads:', error)
        } finally {
            setIsLoading(false)
        }
    }, [selectedCategory, sortBy, debouncedSearchQuery, showPinnedOnly])

    // Load threads when filters change
    useEffect(() => {
        loadThreads()
    }, [loadThreads])

    // Update URL when filters change
    useEffect(() => {
        if (!mounted) return

        const params = new URLSearchParams()
        if (selectedCategory) params.set('category', selectedCategory)
        if (sortBy !== 'recent') params.set('sort', sortBy)
        if (debouncedSearchQuery) params.set('q', debouncedSearchQuery)
        if (showPinnedOnly) params.set('pinned', 'true')

        router.replace(`/forum?${params.toString()}`, { scroll: false })
    }, [selectedCategory, sortBy, debouncedSearchQuery, showPinnedOnly, router, mounted])

    const handleCreateClick = () => {
        if (!user) {
            alert(t('forum.login_required'))
            return
        }
        setIsCreateModalOpen(true)
    }

    const handleThreadCreated = () => {
        setIsCreateModalOpen(false)
        loadThreads()
        router.refresh()
    }

    return (
        <main className={styles.main}>
            <div className="page-container">
                <SectionHeader
                    title={t('forum.title')}
                    subtitle={t('forum.subtitle')}
                />

                <FilterBar>
                    <div className="flex-grow-1" style={{ minWidth: '250px', flex: '1 1 300px' }}>
                        <Input
                            placeholder={t('forum.search.placeholder')}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            icon="bx-search"
                        />
                    </div>

                    <Select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        style={{ minWidth: '180px' }}
                    >
                        <option value="">{t('forum.category.all')}</option>
                        {categories.map((cat) => (
                            <option key={cat.id} value={cat.id}>
                                {cat.name}
                            </option>
                        ))}
                    </Select>

                    <Select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as 'recent' | 'popular' | 'most_commented')}
                        style={{ minWidth: '160px' }}
                    >
                        <option value="recent">{t('forum.sort.recent')}</option>
                        <option value="popular">{t('forum.sort.popular')}</option>
                        <option value="most_commented">{t('forum.sort.commented')}</option>
                    </Select>

                    <Button
                        variant={showPinnedOnly ? 'primary' : 'outline'}
                        onClick={() => setShowPinnedOnly(!showPinnedOnly)}
                        leftIcon={<i className='bx bxs-pin'></i>}
                    >
                        {t('forum.pinned')}
                    </Button>
                    <Button
                        variant="primary"
                        onClick={handleCreateClick}
                    >
                        {t('forum.new_discussion')}
                    </Button>
                </FilterBar>

                <div className={styles.content_grid}>
                    <div className={styles.feed}>
                        {isLoading ? (
                            <div className={styles.loading}>{t('forum.loading')}</div>
                        ) : threads.length > 0 ? (
                            threads.map(thread => (
                                <ForumCard key={thread.id} thread={thread} />
                            ))
                        ) : (
                            <div className={styles.empty_state}>
                                <i className={`bx bx-message-square-dots ${styles.empty_icon}`}></i>
                                <h3>{t('forum.empty.title')}</h3>
                                <p>{t('forum.empty.message')}{selectedCategory ? ` ${t('forum.empty.message_category')}` : ''}.</p>
                            </div>
                        )}
                    </div>

                    <ForumSidebar />
                </div>
            </div>

            <Modal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                title={t('forum.new_discussion')}
                size="md"
            >
                <CreateThreadFixedForm
                    categories={categories}
                    onSuccess={handleThreadCreated}
                    onCancel={() => setIsCreateModalOpen(false)}
                />
            </Modal>
        </main>
    )
}

export default function ForumPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <ForumPageContent />
        </Suspense>
    )
}
