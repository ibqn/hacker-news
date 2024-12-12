import type { PaginatedSuccessResponse } from 'backend/src/shared/types'
import type { CommentPaginationSchema } from 'backend/src/validators/pagination'
import { axios } from '@/api'
import type { CommentSearchSchema } from '@/validators/comment-search'
import { infiniteQueryOptions } from '@tanstack/react-query'
import type { Comment } from 'backend/src/queries/comment'

export const getCommentsForPost = async (
  postId: number,
  params: CommentPaginationSchema
) => {
  const { data: response } = await axios.get<
    PaginatedSuccessResponse<Comment[]>
  >(`/posts/${postId}/comments`, { params })
  const { data: comments, pagination } = response
  return { comments, pagination }
}

export type GetCommentsForPost = Awaited<ReturnType<typeof getCommentsForPost>>

export const commentsForPostInfiniteQueryOptions = (
  postId: number,
  queryOptions: CommentSearchSchema
) => {
  const { sortedBy, order } = queryOptions
  return infiniteQueryOptions({
    queryKey: ['comments', 'post', postId, sortedBy, order],
    queryFn: ({ pageParam }) =>
      getCommentsForPost(postId, {
        page: Number(pageParam),
        limit: 10,
        sortedBy,
        order,
        includeChildren: true,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, _allPages, lastPageParam) => {
      if (lastPage.pagination.totalPages <= lastPageParam) {
        return undefined
      }
      return lastPageParam + 1
    },
  })
}

export const getCommentsForComment = async (
  commentId: number,
  params: CommentPaginationSchema
) => {
  const { data: response } = await axios.get<
    PaginatedSuccessResponse<Comment[]>
  >(`/comments/${commentId}/comments`, { params })
  const { data: comments, pagination } = response
  return { comments, pagination }
}

export type GetCommentsForComment = Awaited<
  ReturnType<typeof getCommentsForComment>
>

export const commentsForCommentInfiniteQueryOptions = (
  commentId: number,
  queryOptions: CommentSearchSchema
) => {
  const { sortedBy, order } = queryOptions

  return infiniteQueryOptions({
    queryKey: ['comments', 'comment', commentId, sortedBy, order],
    queryFn: ({ pageParam }) =>
      getCommentsForComment(commentId, {
        page: Number(pageParam),
        limit: 10,
        sortedBy,
        order,
        includeChildren: true,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, _allPages, lastPageParam) => {
      if (lastPage.pagination.totalPages <= lastPageParam) {
        return undefined
      }
      return lastPageParam + 1
    },
  })
}
