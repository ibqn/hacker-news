import { axios } from '@/api'
import type { UpvoteData } from 'backend/src/queries/upvote'
import type { SuccessResponse } from 'backend/src/shared/types'

export const upvotePost = async (postId: number) => {
  const { data: response } = await axios.post<SuccessResponse<UpvoteData>>(
    `/posts/${postId}/upvote`
  )
  const { data: upvoteData } = response
  return upvoteData
}

export const upvoteComment = async (commentId: number) => {
  // await new Promise((resolve) => setTimeout(resolve, 5000))
  // throw new Error('Failed to upvote comment')
  const { data: response } = await axios.post<SuccessResponse<UpvoteData>>(
    `/comments/${commentId}/upvote`
  )
  const { data: upvoteData } = response
  return upvoteData
}
