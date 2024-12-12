import {
  type GetCommentsForComment,
  type GetCommentsForPost,
  upvoteComment,
} from '@/lib/api'
import {
  InfiniteData,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'
import type { Comment } from 'backend/src/queries/comment'
import { produce, nothing } from 'immer'
import { toast } from 'sonner'

type UpvoteCommentMutationFn = {
  commentId: number
  postId: number
  parentCommentId: number | null
  userId: string
}

function optimisticCommentUpvote(comment: Comment, userId: string) {
  const isUpvoted = comment.commentUpvotes?.length > 0
  comment.points += isUpvoted ? -1 : 1
  comment.commentUpvotes = isUpvoted ? [] : [{ userId }]
}

export const useUpvoteComment = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ commentId }: UpvoteCommentMutationFn) =>
      upvoteComment(commentId),
    onMutate: async ({
      commentId,
      postId,
      parentCommentId,
      userId,
    }: UpvoteCommentMutationFn) => {
      const queryKey = parentCommentId
        ? ['comments', 'comment', parentCommentId]
        : ['comments', 'post', postId]

      await queryClient.cancelQueries({ queryKey })

      const previousCommentsData = queryClient.getQueriesData<
        InfiniteData<GetCommentsForPost | GetCommentsForComment>
      >({ queryKey })

      queryClient.setQueriesData<
        InfiniteData<GetCommentsForPost | GetCommentsForPost>
      >(
        {
          queryKey,
        },
        produce((draft) => {
          if (!draft) {
            return nothing
          }

          draft.pages.forEach((page) =>
            page.comments.forEach((comment: Comment) => {
              if (comment.id === commentId) {
                optimisticCommentUpvote(comment, userId)
              }
            })
          )
        })
      )

      return { previousCommentsData }
    },
    onSettled: (_data, _error, { postId, parentCommentId }) => {
      const queryKey = parentCommentId
        ? ['comments', 'comment', parentCommentId]
        : ['posts', 'comment', postId]
      queryClient.invalidateQueries({ queryKey })
    },
    onError: (error, _variables, context) => {
      console.error(error)

      toast.error('Failed to upvote post')

      if (context?.previousCommentsData) {
        context.previousCommentsData.forEach(([queryKey, data]) =>
          queryClient.setQueriesData({ queryKey }, data)
        )
      }
    },
  })
}
