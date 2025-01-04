import type { SigninSchema } from 'backend/src/validators/signin'
import { axios } from '@/api'
import type { ApiResponse, User } from 'backend/src/shared/types'
import { queryOptions } from '@tanstack/react-query'

export const postSignup = async (formData: SigninSchema) => {
  return axios.post('/auth/signup', formData)
}

export const postSignin = async (formData: SigninSchema) => {
  return axios.post('/auth/signin', formData)
}

export const getSignout = async () => {
  return axios.get('/auth/signout')
}

export const getUser = async (): Promise<User | null> => {
  const { data: response } = await axios.get<ApiResponse<User>>('/auth/user')
  if (!response.success) {
    return null
  }
  const { data: user } = response
  return user
}

export const userQueryOptions = () =>
  queryOptions({ queryKey: ['user'] as const, queryFn: getUser })
