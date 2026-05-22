import { supabase } from '@/lib/supabase'
import type { ForumCategory, ForumThread, ForumComment } from '@/lib/database.types'

const isValidUUID = (uuid: string) => {
    const regex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    return regex.test(uuid)
}

export const ForumService = {
    async getCategories() {
        const { data, error } = await supabase
            .from('forum_categories')
            .select('*')
            .order('is_official', { ascending: false })
            .order('name')

        if (error) throw error
        return data as ForumCategory[]
    },

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

        query = query.order('is_pinned', { ascending: false })

        if (sortBy === 'popular') {
            query = query.order('likes_count', { ascending: false })
        } else if (sortBy === 'most_commented') {
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

        if (sortBy === 'most_commented') {
            threads.sort((a, b) => {
                if (a.is_pinned !== b.is_pinned) {
                    return a.is_pinned ? -1 : 1
                }
                return (b.comments_count || 0) - (a.comments_count || 0)
            })
        }

        return threads
    },

    async getThreadsPaginated(
        categoryId?: string,
        sortBy: 'recent' | 'popular' | 'most_commented' = 'recent',
        searchQuery?: string,
        pinnedOnly?: boolean,
        from = 0,
        to = 11
    ): Promise<{ data: ForumThread[]; count: number }> {
        let query = supabase
            .from('forum_threads')
            .select(`
                *,
                author:author_id(username, avatar_url),
                category:category_id(name, slug, icon),
                comments:forum_comments(id)
            `, { count: 'exact' })
            .range(from, to)

        if (categoryId && isValidUUID(categoryId)) {
            query = query.eq('category_id', categoryId)
        }

        if (searchQuery && searchQuery.trim()) {
            query = query.ilike('title', `%${searchQuery.trim()}%`)
        }

        if (pinnedOnly) {
            query = query.eq('is_pinned', true)
        }

        query = query.order('is_pinned', { ascending: false })

        if (sortBy === 'popular') {
            query = query.order('likes_count', { ascending: false })
        } else {
            query = query.order('created_at', { ascending: false })
        }

        const { data, error, count } = await query
        if (error) throw error

        let threads = (data || []).map((thread: any) => ({
            ...thread,
            comments_count: thread.comments?.length || 0
        })) as ForumThread[]

        if (sortBy === 'most_commented') {
            threads.sort((a, b) => {
                if (a.is_pinned !== b.is_pinned) return a.is_pinned ? -1 : 1
                return (b.comments_count || 0) - (a.comments_count || 0)
            })
        }

        return { data: threads, count: count || 0 }
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

    async getRelatedThreads(categoryId: string | null, currentThreadId: string, limit = 5) {
        let query = supabase
            .from('forum_threads')
            .select(`
                id,
                title,
                slug,
                created_at,
                views_count,
                category:category_id(icon)
            `)
            .neq('id', currentThreadId)
            .order('created_at', { ascending: false })
            .limit(limit)

        if (categoryId) {
            query = query.eq('category_id', categoryId)
        }

        const { data, error } = await query
        if (error) {
            console.error('Error fetching related threads:', error)
            return []
        }
        return data as unknown as Partial<ForumThread>[]
    },

    async createThread(threadData: { title: string; content: string; category_id: string; author_id: string; media_url?: string; media_type?: 'image' | 'video' }) {
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
        const { error } = await supabase.rpc('increment_thread_view', { thread_id: threadId })
        if (error) console.error('Error incrementing view:', error)
    },

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
        const { data: existingLike } = await supabase
            .from('forum_likes')
            .select('id')
            .eq('thread_id', threadId)
            .eq('user_id', userId)
            .maybeSingle()

        if (existingLike) {
            const { error: deleteError } = await supabase
                .from('forum_likes')
                .delete()
                .eq('id', existingLike.id)

            if (deleteError) throw deleteError
            return false
        } else {
            const { error: insertError } = await supabase
                .from('forum_likes')
                .insert({ thread_id: threadId, user_id: userId })

            if (insertError) throw insertError
            return true
        }
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
        const { data: existingLike } = await supabase
            .from('forum_likes')
            .select('id')
            .eq('comment_id', commentId)
            .eq('user_id', userId)
            .maybeSingle()

        if (existingLike) {
            const { error: deleteError } = await supabase
                .from('forum_likes')
                .delete()
                .eq('id', existingLike.id)

            if (deleteError) throw deleteError
            return false
        } else {
            const { error: insertError } = await supabase
                .from('forum_likes')
                .insert({ comment_id: commentId, user_id: userId })

            if (insertError) throw insertError
            return true
        }
    },

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
