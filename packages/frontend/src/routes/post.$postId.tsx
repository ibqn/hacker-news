import { CommentCard } from '@/components/comment-card'
import { PostCard } from '@/components/post-card'
import { SortBar } from '@/components/sort-bar'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useUpvotePost } from '@/hooks/use-upvote-post'
import {
  commentsForPostInfiniteQueryOptions,
  postQueryOptions,
} from '@/lib/api'
import { commentSearchSchema } from '@/validators/comment-search'
import {
  useSuspenseInfiniteQuery,
  useSuspenseQuery,
} from '@tanstack/react-query'
import { createFileRoute, notFound } from '@tanstack/react-router'
import { zodSearchValidator } from '@tanstack/router-zod-adapter'
import { paramIdSchema } from 'backend/src/validators/param'
import { ChevronDownIcon } from 'lucide-react'
import { useState } from 'react'

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

  const [activeReplyId, setActiveReplyId] = useState<number | null>(null)

  const { data: post } = useSuspenseQuery(postQueryOptions(Number(postId)))

  const {
    data: comments,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useSuspenseInfiniteQuery(
    commentsForPostInfiniteQueryOptions(Number(postId), { sortedBy, order })
  )

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

      <div className="mb-4 mt-8">
        <h2 className="mb-2 text-base font-semibold text-foreground">
          Comments
        </h2>

        {comments && comments.pages[0].comments.length > 0 && (
          <SortBar sortedBy={sortedBy} order={order} />
        )}
      </div>

      {comments && comments.pages[0].comments.length > 0 && (
        <Card className="border-border/25">
          <CardContent className="p-4">
            {comments.pages.map((page) =>
              page.comments.map((comment) => (
                <CommentCard
                  key={comment.id}
                  comment={comment}
                  activeReplyId={activeReplyId}
                  setActiveReplyId={setActiveReplyId}
                />
              ))
            )}

            {hasNextPage && (
              <div className="mt-2">
                <Button
                  variant="ghost"
                  className="flex h-auto items-center gap-0 space-x-1 p-0 text-xs text-muted-foreground hover:text-foreground"
                  onClick={() => {
                    fetchNextPage()
                  }}
                  disabled={!hasNextPage || isFetchingNextPage}
                >
                  {isFetchingNextPage ? (
                    <span>Loading...</span>
                  ) : (
                    <>
                      <ChevronDownIcon size={12} />
                      <span>More replies</span>
                    </>
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
