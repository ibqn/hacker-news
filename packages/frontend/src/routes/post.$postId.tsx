import { PostCard } from '@/components/post-card'
import { useUpvotePost } from '@/hooks/use-upvote-post'
import { postQueryOptions } from '@/lib/api'
import { commentSearchSchema } from '@/validators/comment-search'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, notFound } from '@tanstack/react-router'
import { zodSearchValidator } from '@tanstack/router-zod-adapter'
import { paramIdSchema } from 'backend/src/validators/param'

export const Route = createFileRoute('/post/$postId')({
  component: Post,
  validateSearch: zodSearchValidator(commentSearchSchema),
  loader: async ({ params: { postId } }) => {
    const result = paramIdSchema.safeParse({ id: postId })
    if (!result.success) {
      throw notFound()
    }
  },
})

function Post() {
  const { sortedBy, order } = Route.useSearch()
  const { postId } = Route.useParams()

  const { data: post } = useSuspenseQuery(postQueryOptions(Number(postId)))

  const upvoteMutation = useUpvotePost()
  return (
    <div className="mx-auto w-full max-w-3xl">
      {post && (
        <PostCard
          post={post}
          onUpvote={() => {
            upvoteMutation.mutate(post.id)
          }}
        />
      )}
    </div>
  )
}
