import type { PaginationSchema } from 'backend/src/validators/pagination'
import { axios } from '@/api'
import type {
  PaginatedSuccessResponse,
  SuccessResponse,
} from 'backend/src/shared/types'
import type { Post } from 'backend/src/queries/post'
import type { PostSearchSchema } from '@/validators/post-search'
import { infiniteQueryOptions, queryOptions } from '@tanstack/react-query'
import type { CreatePostSchema } from 'backend/src/validators/post'

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
    getNextPageParam: (lastPage, _allPages, lastPageParam) => {
      if (lastPage.pagination.totalPages <= lastPageParam) {
        return undefined
      }
      return lastPageParam + 1
    },
  })
}

export const postSubmit = async (postForm: CreatePostSchema) => {
  const { data: response } = await axios.post<SuccessResponse<Post>>(
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
