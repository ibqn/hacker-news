import { hc } from 'hono/client'
import type {
  ApiRoutes,
  SuccessResponse,
  ErrorResponse,
} from 'backend/src/shared/types'

const client = hc<ApiRoutes>('/')

export const postSignup = async (username: string, password: string) => {
  try {
    const response = await client.api.auth.signin.$post({
      form: { username, password },
    })

    if (response.ok) {
      const data = await response.json()
      return data as SuccessResponse
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
