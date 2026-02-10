import { supabase } from '@/lib/supabase'
import type { ForumCategory, ForumThread, ForumComment } from '@/lib/database.types'

const isValidUUID = (uuid: string) => {
    const regex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    return regex.test(uuid)
}

export const ForumService = {
    // Categories
    async getCategories() {
        const { data, error } = await supabase
            .from('forum_categories')
            .select('*')
            .order('is_official', { ascending: false })
            .order('name')

        if (error) throw error
        return data as ForumCategory[]
    },

    async createCategory(categoryData: { name: string; description?: string; icon?: string }) {
        // Generate slug from name
        const slug = categoryData.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)+/g, '')

        // Check for duplicate slug
        const { data: existing } = await supabase
            .from('forum_categories')
            .select('id')
            .eq('slug', slug)
            .maybeSingle()

        if (existing) {
            // Return existing category instead of creating duplicate
            const { data, error } = await supabase
                .from('forum_categories')
                .select('*')
                .eq('slug', slug)
                .single()

            if (error) throw error
            return data as ForumCategory
        }

        const { data, error } = await supabase
            .from('forum_categories')
            .insert({
                name: categoryData.name,
                slug,
                description: categoryData.description || null,
                icon: categoryData.icon || 'bx-folder',
                is_official: false
            })
            .select()
            .single()

        if (error) throw error
        return data as ForumCategory
    },

    // Threads
    async getThreads(
        categoryId?: string,
        sortBy: 'recent' | 'popular' | 'most_commented' = 'recent',
        searchQuery?: string,
        pinnedOnly?: boolean
    ) {
        let query = supabase
            .from('forum_threads')
            .select(`
                *,
                author:author_id(username, avatar_url),
                category:category_id(name, slug, icon),
                comments:forum_comments(id)
            `)

        if (categoryId && isValidUUID(categoryId)) {
            query = query.eq('category_id', categoryId)
        }

        if (searchQuery && searchQuery.trim()) {
            query = query.ilike('title', `%${searchQuery.trim()}%`)
        }

        if (pinnedOnly) {
            query = query.eq('is_pinned', true)
        }

        // Always order by pinned first, then by selected sort
        query = query.order('is_pinned', { ascending: false })

        if (sortBy === 'popular') {
            query = query.order('likes_count', { ascending: false })
        } else if (sortBy === 'most_commented') {
            // We'll sort by comments count in memory since it's computed
            query = query.order('created_at', { ascending: false })
        } else {
            query = query.order('created_at', { ascending: false })
        }

        const { data, error } = await query
        if (error) throw error

        let threads = data.map((thread: any) => ({
            ...thread,
            comments_count: thread.comments?.length || 0
        })) as ForumThread[]

        // If sorting by most_commented, sort in memory
        if (sortBy === 'most_commented') {
            threads.sort((a, b) => {
                // Keep pinned threads first
                if (a.is_pinned !== b.is_pinned) {
                    return a.is_pinned ? -1 : 1
                }
                return (b.comments_count || 0) - (a.comments_count || 0)
            })
        }

        return threads
    },

    async getThreadBySlug(slug: string) {
        const { data, error } = await supabase
            .from('forum_threads')
            .select(`
                *,
                author:author_id(username, avatar_url),
                category:category_id(name, slug, icon),
                comments:forum_comments(id)
            `)
            .eq('slug', slug)
            .single()

        if (error) throw error

        const thread = data as any
        return {
            ...thread,
            comments_count: thread.comments?.length || 0
        } as ForumThread
    },

    async createThread(threadData: { title: string; content: string; category_id: string; author_id: string; media_url?: string; media_type?: 'image' | 'video' }) {
        // Generate slug from title
        const slug = threadData.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)+/g, '') + '-' + Date.now().toString().slice(-4)

        const payload = {
            title: threadData.title.trim(),
            content: threadData.content.trim(),
            category_id: threadData.category_id,
            author_id: threadData.author_id,
            media_url: threadData.media_url || null,
            media_type: threadData.media_type || null,
            slug,
            views_count: 0,
            likes_count: 0,
            is_pinned: false
        }

        const { data, error } = await supabase
            .from('forum_threads')
            .insert(payload)
            .select()
            .single()

        if (error) {
            console.error('Supabase Error in createThread:', error)
            throw error
        }
        return data as ForumThread
    },

    async incrementView(threadId: string) {
        // Get current view count first to ensure accuracy
        const { data: thread } = await supabase
            .from('forum_threads')
            .select('views_count')
            .eq('id', threadId)
            .single()

        if (thread) {
            const newCount = (thread.views_count || 0) + 1
            await supabase
                .from('forum_threads')
                .update({ views_count: newCount })
                .eq('id', threadId)
        }
    },

    // Comments
    async getComments(threadId: string) {
        const { data, error } = await supabase
            .from('forum_comments')
            .select(`
                *,
                author:author_id(username, avatar_url)
            `)
            .eq('thread_id', threadId)
            .order('created_at', { ascending: true })

        if (error) throw error
        return data as ForumComment[]
    },

    async createComment(commentData: { content: string; thread_id: string; author_id: string; parent_id?: string }) {
        const { data, error } = await supabase
            .from('forum_comments')
            .insert(commentData)
            .select(`
                *,
                author:author_id(username, avatar_url)
            `)
            .single()

        if (error) throw error
        return data as ForumComment
    },

    // Likes
    async hasUserLiked(threadId: string, userId: string) {
        const { data, error } = await supabase
            .from('forum_likes')
            .select('id')
            .eq('thread_id', threadId)
            .eq('user_id', userId)
            .maybeSingle()

        if (error) return false
        return !!data
    },

    async toggleThreadLike(threadId: string, userId: string) {
        // Check if already liked
        const { data: existingLike } = await supabase
            .from('forum_likes')
            .select('id')
            .eq('thread_id', threadId)
            .eq('user_id', userId)
            .maybeSingle()

        // Get current thread stats
        const { data: thread } = await supabase
            .from('forum_threads')
            .select('likes_count')
            .eq('id', threadId)
            .single()

        const currentLikes = thread?.likes_count || 0

        if (existingLike) {
            // Unlike: Delete like and decrement count
            const { error: deleteError } = await supabase
                .from('forum_likes')
                .delete()
                .eq('id', existingLike.id)

            if (!deleteError) {
                await supabase
                    .from('forum_threads')
                    .update({ likes_count: Math.max(0, currentLikes - 1) })
                    .eq('id', threadId)
                return false
            }
        } else {
            // Like: Insert like and increment count
            const { error: insertError } = await supabase
                .from('forum_likes')
                .insert({ thread_id: threadId, user_id: userId })

            if (!insertError) {
                await supabase
                    .from('forum_threads')
                    .update({ likes_count: currentLikes + 1 })
                    .eq('id', threadId)
                return true
            }
        }
        return !!existingLike // Return original state if query failed
    },

    async hasUserLikedComment(commentId: string, userId: string) {
        const { data, error } = await supabase
            .from('forum_likes')
            .select('id')
            .eq('comment_id', commentId)
            .eq('user_id', userId)
            .maybeSingle()

        if (error) return false
        return !!data
    },

    async toggleCommentLike(commentId: string, userId: string) {
        // Check if already liked
        const { data: existingLike } = await supabase
            .from('forum_likes')
            .select('id')
            .eq('comment_id', commentId)
            .eq('user_id', userId)
            .maybeSingle()

        // Get current comment stats
        const { data: comment } = await supabase
            .from('forum_comments')
            .select('likes_count')
            .eq('id', commentId)
            .single()

        const currentLikes = comment?.likes_count || 0

        if (existingLike) {
            // Unlike: Delete like and decrement count
            const { error: deleteError } = await supabase
                .from('forum_likes')
                .delete()
                .eq('id', existingLike.id)

            if (!deleteError) {
                await supabase
                    .from('forum_comments')
                    .update({ likes_count: Math.max(0, currentLikes - 1) })
                    .eq('id', commentId)
                return false
            }
        } else {
            // Like: Insert like and increment count
            const { error: insertError } = await supabase
                .from('forum_likes')
                .insert({ comment_id: commentId, user_id: userId })

            if (!insertError) {
                await supabase
                    .from('forum_comments')
                    .update({ likes_count: currentLikes + 1 })
                    .eq('id', commentId)
                return true
            }
        }
        return !!existingLike // Return original state if query failed
    },

    // Storage
    async uploadMedia(file: File) {
        const fileExt = file.name.split('.').pop()
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
        const filePath = `${fileName}`

        const { error: uploadError } = await supabase.storage
            .from('forum-uploads')
            .upload(filePath, file)

        if (uploadError) throw uploadError

        const { data } = supabase.storage
            .from('forum-uploads')
            .getPublicUrl(filePath)

        return data.publicUrl
    }
}
