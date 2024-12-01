import { ClientResponse, hc } from 'hono/client'
import type {
  ApiRoutes,
  SuccessResponse,
  ErrorResponse,
  UserData,
} from 'backend/src/shared/types'
import type { SigninSchema } from 'backend/src/validators/signin'
import { queryOptions } from '@tanstack/react-query'

const client = hc<ApiRoutes>('/', {
  fetch: (input: RequestInfo | URL, init?: RequestInit) =>
    fetch(input, {
      ...init,
      credentials: 'include',
    }),
})

async function processApi<T = void>(
  promise: Promise<ClientResponse<T>>
): Promise<SuccessResponse<T> | ErrorResponse> {
  try {
    const response = await promise

    if (response.ok) {
      const data = await response.json()
      return data as SuccessResponse<T>
    }

    const data = await response.json()
    return data as ErrorResponse
  } catch (error) {
    return {
      success: false,
      error: String(error),
    } satisfies ErrorResponse as ErrorResponse
  }
}

export const postSignup = async (formData: SigninSchema) => {
  return processApi(client.api.auth.signup.$post({ form: formData }))
}

export const getUser = async () => {
  return processApi<UserData>(client.api.auth.user.$get({}))
}

export const userQueryOptions = () =>
  queryOptions({
    queryKey: ['user'],
    queryFn: getUser,
  })
