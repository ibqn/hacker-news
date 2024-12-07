import { type GetPosts, upvotePost } from '@/lib/api'
import {
  InfiniteData,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'
import { Post } from 'backend/src/queries/post'
import { UpvoteData } from 'backend/src/queries/upvote'
import { SuccessResponse } from 'backend/src/shared/types'
import { current, produce } from 'immer'
import { toast } from 'sonner'

const optimisticPostUpvote = (draft: Post) => {
  draft.points += draft.isUpvoted ? -1 : +1
  draft.isUpvoted = !draft.isUpvoted
}

const updatePostUpvote = (draft: Post, upvoteData: UpvoteData) => {
  draft.points = upvoteData.points
  draft.isUpvoted = upvoteData.isUpvoted
}

export const useUpvotePost = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: upvotePost,
    onMutate: async (postId: number) => {
      let previousData
      await queryClient.cancelQueries({ queryKey: ['post', postId] })
      queryClient.setQueryData<SuccessResponse<Post>>(
        ['post', postId],
        produce((draft?: Post) => {
          if (!draft) {
            return undefined
          }
          optimisticPostUpvote(draft)
        })
      )

      queryClient.setQueriesData<InfiniteData<GetPosts>>(
        { queryKey: ['posts'], type: 'active' },
        produce((draft) => {
          previousData = current(draft)
          if (!draft) {
            return undefined
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

      return { previousData }
    },
    onSuccess: (upvoteData, postId) => {
      queryClient.setQueryData<SuccessResponse<Post>>(
        ['post', postId],
        produce((draft: Post) => {
          if (!draft) {
            return undefined
          }
          updatePostUpvote(draft, upvoteData)
        })
      )

      queryClient.setQueriesData<InfiniteData<GetPosts>>(
        { queryKey: ['posts'] },
        produce((draft) => {
          if (!draft) {
            return undefined
          }
          draft.pages.forEach((page) =>
            page.posts.forEach((post: Post) => {
              if (post.id === postId) {
                updatePostUpvote(post, upvoteData)
              }
            })
          )
        })
      )

      queryClient.invalidateQueries({
        queryKey: ['posts'],
        type: 'inactive',
        refetchType: 'none',
      })
    },
    onError: (error, postId, context) => {
      console.error(error)

      queryClient.invalidateQueries({ queryKey: ['post', postId] })
      toast.error('Failed to upvote post')

      if (context?.previousData) {
        queryClient.setQueriesData(
          { queryKey: ['posts'] },
          context.previousData
        )
      }

      queryClient.invalidateQueries({ queryKey: ['posts'] })
    },
  })
}
