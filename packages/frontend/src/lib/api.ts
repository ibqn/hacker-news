import {
  type PaginatedSuccessResponse,
  type SuccessResponse,
  type User,
} from 'backend/src/shared/types'
import { type Post } from 'backend/src/queries/post'
import type { SigninSchema } from 'backend/src/validators/signin'
import type {
  CommentPaginationSchema,
  PaginationSchema,
} from 'backend/src/validators/pagination'
import { queryOptions } from '@tanstack/react-query'
import axiosNative from 'axios'
import type { PostSearchSchema } from '@/validators/post-search'
import { infiniteQueryOptions } from '@tanstack/react-query'
import type { UpvoteData } from 'backend/src/queries/upvote'
import type { CreatePostSchema } from 'backend/src/validators/post'
import type { Comment } from 'backend/src/queries/comment'
import { CommentSearchSchema } from '@/validators/comment-search'

const defaultOptions = {
  baseURL: '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'multipart/form-data',
  },
}

export const axios = axiosNative.create(defaultOptions)

export const postSignup = async (formData: SigninSchema) => {
  return axios.post('/auth/signup', formData)
}

export const postSignin = async (formData: SigninSchema) => {
  return axios.post('/auth/signin', formData)
}

export const getSignout = async () => {
  return axios.get('/auth/signout')
}

export const getUser = async () => {
  const { data: response } =
    await axios.get<SuccessResponse<User>>('/auth/user')
  const { data: user } = response
  return user
}

export const userQueryOptions = () =>
  queryOptions({
    queryKey: ['user'],
    queryFn: getUser,
  })

export const getPosts = async (params: PaginationSchema) => {
  const { data: response } = await axios.get<PaginatedSuccessResponse<Post[]>>(
    '/posts',
    { params }
  )
  const { data: posts, pagination } = response
  return { posts, pagination }
}
export type GetPosts = Awaited<ReturnType<typeof getPosts>>

export const postsInfiniteQueryOptions = (queryOptions: PostSearchSchema) => {
  const { sortedBy, order, author = '', site = '' } = queryOptions
  return infiniteQueryOptions({
    queryKey: ['posts', sortedBy, order, author, site],
    queryFn: ({ pageParam }) =>
      getPosts({
        page: Number(pageParam),
        limit: 10,
        sortedBy,
        order,
        author,
        site,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages, lastPageParam) => {
      if (lastPage.pagination.totalPages <= lastPageParam) {
        return undefined
      }
      return lastPageParam + 1
    },
  })
}

export const upvotePost = async (postId: number) => {
  const { data: response } = await axios.post<SuccessResponse<UpvoteData>>(
    `/posts/${postId}/upvote`
  )
  const { data: upvoteData } = response
  return upvoteData
}

export const upvoteComment = async (commentId: number) => {
  const { data: response } = await axios.post<SuccessResponse<UpvoteData>>(
    `/comments/${commentId}/upvote`
  )
  const { data: upvoteData } = response
  return upvoteData
}

export const postSubmit = async (postForm: CreatePostSchema) => {
  const { data: response } = await axios.post<SuccessResponse<UpvoteData>>(
    `/posts`,
    postForm
  )
  const { data: postData } = response
  return postData
}

export const getPost = async (postId: number) => {
  const { data: response } = await axios.get<SuccessResponse<Post>>(
    `/posts/${postId}`
  )
  const { data: post } = response
  return post
}

export const postQueryOptions = (postId: number) =>
  queryOptions({
    queryKey: ['post', postId],
    queryFn: () => getPost(postId),
    retry: false,
    throwOnError: true,
  })

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
    getNextPageParam: (lastPage, allPages, lastPageParam) => {
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
    getNextPageParam: (lastPage, allPages, lastPageParam) => {
      if (lastPage.pagination.totalPages <= lastPageParam) {
        return undefined
      }
      return lastPageParam + 1
    },
  })
}
