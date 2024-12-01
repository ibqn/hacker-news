import { SuccessResponse, type UserData } from 'backend/src/shared/types'
import type { SigninSchema } from 'backend/src/validators/signin'
import { queryOptions } from '@tanstack/react-query'
import axiosNative from 'axios'

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
