import axiosNative from 'axios'

const defaultOptions = {
  baseURL: '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'multipart/form-data',
  },
}

export const axios = axiosNative.create(defaultOptions)
