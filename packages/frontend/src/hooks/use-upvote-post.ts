import { upvotePost } from '@/api/upvote'
import { type GetPosts } from '@/api/post'
import {
  InfiniteData,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'
import type { Post } from 'backend/src/queries/post'
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

      const previousPostData = queryClient.getQueryData<Post>(['post', postId])

      queryClient.setQueryData<Post>(
        ['post', postId],
        produce((draft) => {
          if (!draft) {
            return nothing
          }

          optimisticPostUpvote(draft)
        })
      )

      const previousPostsData = queryClient.getQueriesData<
        InfiniteData<GetPosts>
      >({ queryKey: ['posts'] })

      console.log('previousPostsData', previousPostsData)

      queryClient.setQueriesData<InfiniteData<GetPosts>>(
        {
          queryKey: ['posts'],
        },
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
    onSettled: (_data, _error, postId) => {
      queryClient.invalidateQueries({ queryKey: ['posts'] })
      queryClient.invalidateQueries({ queryKey: ['post', postId] })
    },
    onError: (error, postId, context) => {
      console.error(error)

      toast.error('Failed to upvote post')

      if (context?.previousPostsData) {
        console.log('setting previous posts data', context.previousPostsData)
        context.previousPostsData.forEach(([queryKey, data]) => {
          queryClient.setQueriesData({ queryKey }, data)
        })
      }

      if (context?.previousPostData) {
        queryClient.setQueryData(['post', postId], context.previousPostData)
      }
    },
  })
}
