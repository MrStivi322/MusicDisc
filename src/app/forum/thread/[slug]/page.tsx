
import { ForumService } from '@/services/ForumService'
import { ThreadView } from '@/components/forum/ThreadView'
import styles from '@/styles/pages/Forum.module.css'

export const dynamic = 'force-dynamic'

export default async function ThreadPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params
    const thread = await ForumService.getThreadBySlug(slug)
    const comments = await ForumService.getComments(thread.id)

    // Increment view count (server-side logic ideally, but we'll do it via service side-effect)
    // ForumService.incrementView(thread.id) // This is better separate to avoid waiting

    return <ThreadView thread={thread} comments={comments} />
}
