import { PostCard } from '@/components/post-card'
import { useUpvotePost } from '@/hooks/use-upvote-post'
import { postQueryOptions } from '@/lib/api'
import { postSearchSchema } from '@/validators/post-search'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { zodSearchValidator } from '@tanstack/router-zod-adapter'

export const Route = createFileRoute('/post')({
  component: Post,
  validateSearch: zodSearchValidator(postSearchSchema),
})

function Post() {
  const { id } = Route.useSearch()
  const { data: post } = useSuspenseQuery(postQueryOptions(id))

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
