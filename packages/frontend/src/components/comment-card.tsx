import { cn } from '@/lib/utils'
import type { Comment } from 'backend/src/queries/comment'
import { Button } from '@/components/ui/button'
import { commentsForCommentInfiniteQueryOptions } from '@/api/comment'
import { useQuery, useSuspenseInfiniteQuery } from '@tanstack/react-query'
import {
  ChevronDownIcon,
  ChevronUpIcon,
  MessageSquareIcon,
  MinusIcon,
  PlusIcon,
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { Dispatch, SetStateAction, useState } from 'react'
import { Separator } from '@/components/ui/separator'
import { queryClient } from '@/query-client'
import { useUpvoteComment } from '@/hooks/use-upvote-comment'
import { userQueryOptions } from '@/api/auth'

type Props = {
  comment: Comment
  activeReplyId: number | null
  setActiveReplyId: Dispatch<SetStateAction<number | null>>
  isLast: boolean
}

export function CommentCard({
  comment,
  activeReplyId,
  setActiveReplyId,
  isLast,
}: Props) {
  const { data: user } = useQuery(userQueryOptions())

  const [isCollapsed, setIsCollapsed] = useState(false)

  const {
    id,
    content,
    depth,
    points,
    author,
    createdAt,
    childComments,
    commentCount,
    commentUpvotes,
    parentCommentId,
    postId,
  } = comment

  const isUpvoted = commentUpvotes?.length > 0

  const isReplying = activeReplyId === id

  const {
    data: comments,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useSuspenseInfiniteQuery({
    ...commentsForCommentInfiniteQueryOptions(id, {
      sortedBy: 'recent',
      order: 'desc',
    }),
    initialData: {
      pages: [
        {
          comments:
            childComments?.map((comment) => ({
              ...comment,
              childComments: [],
            })) ?? [],
          pagination: {
            page: 1,
            totalPages: Math.ceil(commentCount / 10),
          },
        },
      ],
      pageParams: [1],
    },
  })

  const loadFirstPage =
    comments.pages[0].comments.length === 0 && commentCount > 0

  const upvoteMutation = useUpvoteComment()

  return (
    <div className={cn(depth > 0 && 'ml-4 border-l border-border pl-4')}>
      <div className="py-2">
        <div className="mb-2 flex items-center space-x-1 text-xs">
          <Button
            disabled={!user}
            variant="ghost"
            className={cn(
              'flex h-auto items-center gap-0 space-x-1 p-0 text-xs hover:text-primary',
              isUpvoted ? 'text-primary' : 'text-muted-foreground'
            )}
            onClick={() => {
              upvoteMutation.mutate({
                commentId: id,
                postId,
                userId: user?.id ?? '',
                parentCommentId,
              })
            }}
          >
            <ChevronUpIcon size={14} />
            <span className="font-medium">{points}</span>
          </Button>
          <span className="text-muted-foreground">·</span>
          <span className="font-medium">{author.username}</span>
          <span className="text-muted-foreground">·</span>
          <span className="font-medium">
            {formatDistanceToNow(createdAt, { addSuffix: true })}
          </span>
          <span className="text-muted-foreground">·</span>
          <Button
            variant="ghost"
            className="flex h-auto gap-0 p-0 text-muted-foreground hover:text-foreground"
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            {isCollapsed ? <PlusIcon size={14} /> : <MinusIcon size={14} />}
          </Button>
        </div>

        {!isCollapsed && (
          <>
            <p className="mb-2 text-sm text-foreground">{content}</p>
            {user && (
              <Button
                variant="ghost"
                onClick={() => setActiveReplyId(isReplying ? null : id)}
                className="flex h-auto items-center gap-0 space-x-1 p-0 text-xs text-muted-foreground hover:text-foreground"
              >
                <MessageSquareIcon size={12} />
                <span>reply</span>
              </Button>
            )}

            {isReplying && <div className="mt-2">CommentForm</div>}
          </>
        )}
      </div>
      {/* <pre>{JSON.stringify(comments)}</pre> */}
      {!isCollapsed &&
        comments.pages.map((page, index) => {
          const isLastPage = index === comments.pages.length - 1
          return page.comments.map((comment, commentIndex) => (
            <CommentCard
              key={comment.id}
              comment={comment}
              activeReplyId={activeReplyId}
              setActiveReplyId={setActiveReplyId}
              isLast={isLastPage && commentIndex === page.comments.length - 1}
            />
          ))
        })}

      {!isCollapsed && (loadFirstPage || hasNextPage) && (
        <div className="mt-2">
          <Button
            variant="ghost"
            className="flex h-auto items-center gap-0 space-x-1 p-0 text-xs text-muted-foreground hover:text-foreground"
            onClick={() => {
              if (loadFirstPage) {
                queryClient.invalidateQueries({
                  queryKey: ['comments', 'comment', id],
                })
              } else {
                fetchNextPage()
              }
            }}
            disabled={!(hasNextPage || loadFirstPage) || isFetchingNextPage}
          >
            {isFetchingNextPage ? (
              <span>"Loading..."</span>
            ) : (
              <>
                <ChevronDownIcon size={12} />
                <span>More replies</span>
              </>
            )}
          </Button>
        </div>
      )}

      {!isLast && <Separator className="my-2" />}
    </div>
  )
}
