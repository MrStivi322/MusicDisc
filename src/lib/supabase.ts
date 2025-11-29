import { createBrowserClient } from '@supabase/ssr'
import { cache } from './cache'
import type { Artist, News } from './database.types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);

export async function fetchGenresWithCache(): Promise<string[]> {
    const cacheKey = 'genres_list';

    const cached = cache.get<string[]>(cacheKey);
    if (cached) {
        // console.log('✅ Cache hit: genres');
        return cached;
    }

    // console.log('🔄 Cache miss: genres - fetching from DB');
    const { data, error } = await supabase
        .from('artists')
        .select('genre')
        .order('genre');

    if (error) {
        // console.error('Error fetching genres:', error);
        return ['All'];
    }

    const uniqueGenres = Array.from(
        new Set(data?.map(item => item.genre).filter(Boolean))
    ) as string[];

    const result = ['All', ...uniqueGenres];

    cache.set(cacheKey, result, 10 * 60 * 1000);

    return result;
}

export async function fetchCategoriesWithCache(): Promise<string[]> {
    const cacheKey = 'categories_list';

    const cached = cache.get<string[]>(cacheKey);
    if (cached) {
        // console.log('✅ Cache hit: categories');
        return cached;
    }

    // console.log('🔄 Cache miss: categories - fetching from DB');
    const { data, error } = await supabase
        .from('news')
        .select('category')
        .order('category');

    if (error) {
        // console.error('Error fetching categories:', error);
        return ['All'];
    }

    const uniqueCategories = Array.from(
        new Set(data?.map(item => item.category).filter(Boolean))
    ) as string[];

    const result = ['All', ...uniqueCategories];

    cache.set(cacheKey, result, 10 * 60 * 1000);

    return result;
}

export async function fetchArtistWithCache(id: string) {
    const cacheKey = `artist_${id}`;

    const cached = cache.get<Artist>(cacheKey);
    if (cached) {
        // console.log(`✅ Cache hit: artist ${id}`);
        return cached;
    }

    // console.log(`🔄 Cache miss: artist ${id} - fetching from DB`);
    const { data, error } = await supabase
        .from('artists')
        .select('*')
        .eq('id', id)
        .single();

    if (error || !data) {
        return null;
    }

    cache.set(cacheKey, data, 5 * 60 * 1000);

    return data;
}

export async function fetchNewsWithCache(id: string) {
    const cacheKey = `news_${id}`;

    const cached = cache.get<News>(cacheKey);
    if (cached) {
        // console.log(`✅ Cache hit: news ${id}`);
        return { data: cached, error: null };
    }

    // console.log(`🔄 Cache miss: news ${id} - fetching from DB`);
    const { data, error } = await supabase
        .from('news')
        .select('*')
        .eq('id', id)
        .single();

    if (!error && data) {
        cache.set(cacheKey, data, 5 * 60 * 1000);
    }

    return { data, error };
}

export function clearCache(key: string) {
    cache.clear(key);
}

export function clearAllCache() {
    cache.clearAll();
}
