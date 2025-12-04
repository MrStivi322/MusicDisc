import { fetchNewsWithCache } from "@/lib/supabase"
import type { Metadata } from "next"
import NewsDetailClient from "./NewsDetailClient"

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
    const { id } = await params
    const { data: news } = await fetchNewsWithCache(id)

    if (!news) {
        return {
            title: 'News Not Found',
            description: 'The requested news article could not be found.'
        }
    }

    return {
        title: news.title,
        description: news.content ? news.content.substring(0, 160).replace(/<[^>]*>?/gm, '') : news.title,
        openGraph: {
            title: news.title,
            description: news.content ? news.content.substring(0, 160).replace(/<[^>]*>?/gm, '') : news.title,
            images: [
                {
                    url: news.image_url || '/default-news.jpg',
                    width: 1200,
                    height: 630,
                    alt: news.title,
                }
            ],
            type: 'article',
            publishedTime: news.published_at,
            authors: [news.author || 'Music Discovery Team'],
        },
        twitter: {
            card: 'summary_large_image',
            title: news.title,
            description: news.content ? news.content.substring(0, 160).replace(/<[^>]*>?/gm, '') : news.title,
            images: [news.image_url || '/default-news.jpg'],
        }
    }
}

export default function NewsDetailPage({ params }: { params: Promise<{ id: string }> }) {
    return <NewsDetailClient params={params} />
}
