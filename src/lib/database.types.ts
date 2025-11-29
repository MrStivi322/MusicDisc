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
    category: string
    author: string | null
    published_at: string
    views_count?: number
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
