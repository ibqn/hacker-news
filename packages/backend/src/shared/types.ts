export type { User } from "../drizzle/schema/auth"

export type SuccessResponse<T = void> = {
  success: true
  message: string
} & (T extends void ? {} : { data: T })

export type ErrorResponse = {
  success: false
  error: string
  isFormError?: boolean
}

export type PaginatedSuccessResponse<T> = SuccessResponse<T> & {
  pagination: {
    page: number
    totalPages: number
  }
}
