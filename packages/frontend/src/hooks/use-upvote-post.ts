import { type GetPosts, upvotePost } from '@/lib/api'
import {
  InfiniteData,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'
import { Post } from 'backend/src/queries/post'
import { SuccessResponse } from 'backend/src/shared/types'
import { produce, nothing } from 'immer'
import { toast } from 'sonner'

const optimisticPostUpvote = (draft: Post) => {
  draft.points += draft.isUpvoted ? -1 : +1
  draft.isUpvoted = !draft.isUpvoted
}

export const useUpvotePost = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: upvotePost,
    onMutate: async (postId: number) => {
      await queryClient.cancelQueries({ queryKey: ['post', postId] })
      await queryClient.cancelQueries({ queryKey: ['posts'] })

      const previousPostData = queryClient.getQueryData<SuccessResponse<Post>>([
        'post',
        postId,
      ])

      queryClient.setQueryData<SuccessResponse<Post>>(
        ['post', postId],
        produce((draft?: Post) => {
          if (!draft) {
            return nothing
          }
          optimisticPostUpvote(draft)
        })
      )

      const previousPostsData = queryClient.getQueryData<
        InfiniteData<GetPosts>
      >(['posts'])

      queryClient.setQueryData<InfiniteData<GetPosts>>(
        ['posts'],
        produce((draft) => {
          if (!draft) {
            return nothing
          }

          draft.pages.forEach((page) =>
            page.posts.forEach((post: Post) => {
              if (post.id === postId) {
                optimisticPostUpvote(post)
              }
            })
          )
        })
      )

      return { previousPostData, previousPostsData }
    },
    onSettled: (_, postId) => {
      queryClient.invalidateQueries({ queryKey: ['posts'] })
      queryClient.invalidateQueries({ queryKey: ['post', postId] })
    },
    onError: (error, postId, context) => {
      console.error(error)

      toast.error('Failed to upvote post')

      if (context?.previousPostsData) {
        queryClient.setQueryData(['posts'], context.previousPostsData)
      }

      if (context?.previousPostData) {
        queryClient.setQueryData(['post', postId], context.previousPostData)
      }
    },
  })
}
