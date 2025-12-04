import { fetchArtistWithCache } from "@/lib/supabase"
import type { Metadata } from "next"
import ArtistDetailClient from "./ArtistDetailClient"

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
    const { id } = await params
    const artist = await fetchArtistWithCache(id)

    if (!artist) {
        return {
            title: 'Artist Not Found',
            description: 'The requested artist could not be found.'
        }
    }

    return {
        title: artist.name,
        description: artist.description ? artist.description.substring(0, 160).replace(/<[^>]*>?/gm, '') : `Listen to ${artist.name} on Music Discovery.`,
        openGraph: {
            title: artist.name,
            description: artist.description ? artist.description.substring(0, 160).replace(/<[^>]*>?/gm, '') : `Listen to ${artist.name} on Music Discovery.`,
            images: [
                {
                    url: artist.image_url || '/default-artist.jpg',
                    width: 1200,
                    height: 630,
                    alt: artist.name,
                }
            ],
        },
        twitter: {
            card: 'summary_large_image',
            title: artist.name,
            description: artist.description ? artist.description.substring(0, 160).replace(/<[^>]*>?/gm, '') : `Listen to ${artist.name} on Music Discovery.`,
            images: [artist.image_url || '/default-artist.jpg'],
        }
    }
}

export default function ArtistPage({ params }: { params: Promise<{ id: string }> }) {
    return <ArtistDetailClient params={params} />
}
