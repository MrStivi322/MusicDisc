
import { ForumService } from '@/services/ForumService'
import { ThreadView } from '@/app/forum/thread/[slug]/ThreadView'

export const dynamic = 'force-dynamic'

export default async function ThreadPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params
    const thread = await ForumService.getThreadBySlug(slug)
    const comments = await ForumService.getComments(thread.id)

    return <ThreadView thread={thread} initialComments={comments} />
}
