import { Post } from 'backend/src/queries/post'
import { Card, CardContent, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { ChevronUpIcon } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { badgeVariants } from '@/components/ui/badge'
import { formatDistanceToNow } from 'date-fns'

type Props = {
  post: Post
  onUpvote?: () => void
}

export function PostCard({ post, onUpvote }: Props) {
  const {
    id,
    isUpvoted,
    points,
    title,
    url,
    content,
    author,
    createdAt,
    commentCount,
  } = post

  const LinkComp = url ? <a href={url} /> : <Link to="/" />

  return (
    <Card className="flex grow items-start justify-start border-border/25 pt-3">
      <Button
        onClick={() => {
          onUpvote?.()
        }}
        variant="ghost"
        className={cn(
          'ml-3 flex h-auto flex-col items-center justify-center text-muted-foreground hover:text-primary',
          isUpvoted && 'text-primary'
        )}
      >
        <ChevronUpIcon size={20} />
        <span className="text-xs font-medium">{points}</span>
      </Button>

      <div className="flex grow flex-col justify-between">
        <div className="flex items-start p-3 py-0">
          <div className="flex grow flex-wrap items-center gap-x-2 pb-1">
            <CardTitle className="text-xl font-medium">
              <LinkComp.type
                {...LinkComp.props}
                className="text-foreground hover:text-primary hover:underline"
              >
                {title}
              </LinkComp.type>
            </CardTitle>

            {post.url && (
              <Link
                className={cn(
                  badgeVariants({ variant: 'secondary' }),
                  'cursor-pointer text-xs font-normal transition-colors hover:bg-primary/80 hover:text-primary-foreground hover:underline'
                )}
                to="/"
                search={{ site: url }}
              >
                {new URL(url).hostname}
              </Link>
            )}
          </div>
        </div>

        <CardContent className="p-3 pt-0">
          {content && <p className="mb-2 text-sm text-foreground">{content}</p>}
          <div className="flex flex-wrap items-center gap-x-1 text-xs text-muted-foreground">
            <span>
              by{' '}
              <Link
                className="hover:underline"
                to={'/'}
                search={{ author: author.id }}
              >
                {author.username}
              </Link>
            </span>
            <span>·</span>
            <span>{formatDistanceToNow(createdAt, { addSuffix: true })}</span>
            <span>·</span>
            <Link to={'/post'} search={{ id }} className="hover:underline">
              {commentCount} comments
            </Link>
          </div>
        </CardContent>
      </div>
    </Card>
  )
}
