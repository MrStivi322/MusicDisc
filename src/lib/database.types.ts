export interface Artist {
    id: number
    name: string
    genre: string
    image_url: string | null
    image_landscape_url: string | null
    hero_images: string[] | null
    followers_count: string
    description: string | null
    is_top: boolean
    is_wide: boolean
    created_at: string
}

export interface Album {
    id: number
    artist_id: number
    title: string
    cover_url: string | null
    release_year: number | null
    created_at: string
}

export interface Song {
    id: number
    artist_id: number
    album_id: number | null
    title: string
    duration: string | null
    plays_count: string
    spotify_id: string | null
    created_at: string
}

export interface News {
    id: number
    title: string
    excerpt: string | null
    content: string | null
    image_url: string | null
    category: string[]  // Changed from string to string[] for multiple categories
    author: string | null
    published_at: string
    views_count?: number
}

export interface ForumCategory {
    id: string
    name: string
    slug: string
    description: string | null
    icon: string | null
    is_official: boolean
    created_at: string
}

export interface ForumThread {
    id: string
    author_id: string
    category_id: string | null
    title: string
    content: string
    slug: string
    views_count: number
    likes_count: number
    media_url: string | null
    media_type: 'image' | 'video' | null
    is_pinned: boolean
    created_at: string
    updated_at: string
    author?: Profile // Join
    category?: ForumCategory // Join
    user_has_liked?: boolean // Computed
    comments_count?: number // Computed from relation
    comments?: { count: number }[] // Raw relation response
}

export interface ForumComment {
    id: string
    thread_id: string
    author_id: string
    parent_id: string | null
    content: string
    likes_count: number
    created_at: string
    updated_at: string
    author?: Profile // Join
    replies?: ForumComment[] // Computed
    user_has_liked?: boolean // Computed
}

export interface ForumLike {
    id: string
    user_id: string
    thread_id: string | null
    comment_id: string | null
    created_at: string
}

export interface Comment {
    id: number
    news_id: number
    user_id: string
    content: string
    created_at: string
    profiles?: Profile
}

export interface Profile {
    id: string
    email: string | null
    full_name: string | null
    username: string | null
    avatar_url: string | null
    created_at: string
}

export interface Favorite {
    id: number
    user_id: string
    artist_id: number
    created_at: string
}

export interface UpcomingRelease {
    id: number
    artist_id: number
    album_title: string
    release_date: string
    created_at: string
    artists?: Artist
}
