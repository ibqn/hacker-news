import {
  type PaginatedSuccessResponse,
  type SuccessResponse,
  type UserData,
} from 'backend/src/shared/types'
import { type Post } from 'backend/src/queries/post'
import type { SigninSchema } from 'backend/src/validators/signin'
import type { PaginationSchema } from 'backend/src/validators/pagination'
import { queryOptions } from '@tanstack/react-query'
import axiosNative from 'axios'
import type { PostSearchSchema } from '@/validators/post-search'
import { infiniteQueryOptions } from '@tanstack/react-query'
import type { UpvoteData } from 'backend/src/queries/upvote'
import type { CreatePostSchema } from 'backend/src/validators/post'
import type { ParamIdSchema } from 'backend/src/validators/param'

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
    await axios.get<SuccessResponse<UserData>>('/auth/user')
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

export const postSubmit = async (postForm: CreatePostSchema) => {
  // throw new Error('Not implemented')
  const { data: response } = await axios.post<SuccessResponse<UpvoteData>>(
    `/posts`,
    postForm
  )
  const { data: postData } = response
  return postData
}

export const getPost = async (param: ParamIdSchema) => {
  const { data: response } = await axios.get<SuccessResponse<Post>>(
    `/posts/${param.id}`
  )
  const { data: post } = response
  return post
}

export const postQueryOptions = (postId: number) =>
  queryOptions({
    queryKey: ['post', postId],
    queryFn: () => getPost({ id: postId }),
    retry: false,
    throwOnError: true,
  })
