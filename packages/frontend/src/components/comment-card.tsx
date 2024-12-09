import { cn } from '@/lib/utils'
import type { Comment } from 'backend/src/queries/comment'
import { Button } from '@/components/ui/button'
import {
  commentsForCommentInfiniteQueryOptions,
  userQueryOptions,
} from '@/lib/api'
import { useQuery, useSuspenseInfiniteQuery } from '@tanstack/react-query'
import {
  ChevronUpIcon,
  MessageSquareIcon,
  MinusIcon,
  PlusIcon,
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { Dispatch, SetStateAction, useState } from 'react'
import { Separator } from '@/components/ui/separator'

type Props = {
  comment: Comment
  activeReplyId: number | null
  setActiveReplyId: Dispatch<SetStateAction<number | null>>
  isLast?: boolean
}

export function CommentCard({
  comment,
  activeReplyId,
  setActiveReplyId,
  isLast = true,
}: Props) {
  const { data: user } = useQuery(userQueryOptions())

  const [isCollapsed, setIsCollapsed] = useState(false)

  const {
    id,
    content,
    depth,
    isUpvoted,
    points,
    author,
    createdAt,
    childComments,
    commentCount,
  } = comment

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
          comments: childComments ?? [],
          pagination: {
            page: 1,
            totalPages: Math.ceil(commentCount / 10),
          },
        },
      ],
      pageParams: [1],
    },
  })

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

      {!isLast && <Separator className="my-2" />}
    </div>
  )
}
