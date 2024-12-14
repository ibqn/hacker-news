import {
  postComment,
  type GetCommentsForComment,
  type GetCommentsForPost,
} from '@/api/comment'
import { PostCommentSchema } from '@/validators/post-comment'
import {
  InfiniteData,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'
import type { Comment } from 'backend/src/queries/comment'
import { User } from 'backend/src/shared/types'
import { produce, nothing } from 'immer'
import { toast } from 'sonner'

type QueriesComments = InfiniteData<GetCommentsForPost | GetCommentsForComment>

export const useCreateComment = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (params: PostCommentSchema) => postComment(params),
    onMutate: async ({ postId, commentId, content }: PostCommentSchema) => {
      const queryKey = commentId
        ? ['comments', 'comment', commentId]
        : ['comments', 'post', postId]

      await queryClient.cancelQueries({ queryKey })

      const previousCommentsData = queryClient.getQueriesData<QueriesComments>({
        queryKey,
      })

      const user = queryClient.getQueryData<User>(['user'])

      queryClient.setQueriesData<QueriesComments>(
        { queryKey },
        produce((draft) => {
          if (!draft) {
            return nothing
          }

          const comment = {
            id: -1,
            content,
            points: 0,
            author: {
              id: user?.id ?? '',
              username: user?.username ?? 'unknown',
            },
            createdAt: new Date(),
            childComments: [],
            commentCount: 0,
            commentUpvotes: [],
            parentCommentId: commentId ?? null,
            postId: postId ?? 0,
            userId: user?.id ?? '',
            depth: 0,
          } satisfies Comment as Comment

          draft.pages[0].comments.unshift(comment)
        })
      )

      return { previousCommentsData }
    },
    onSettled: (_data, _error, { postId, commentId }) => {
      const queryKey = commentId
        ? ['comments', 'comment', commentId]
        : ['comments', 'post', postId]
      queryClient.invalidateQueries({ queryKey })
    },
    onError: (error, _variables, context) => {
      console.error(error)

      toast.error('Failed to create comment')

      if (context?.previousCommentsData) {
        context.previousCommentsData.forEach(([queryKey, data]) =>
          queryClient.setQueriesData<QueriesComments>({ queryKey }, data)
        )
      }
    },
  })
}
