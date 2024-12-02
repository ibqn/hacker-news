import { insertPostSchema } from "../drizzle/schema/posts"
import type { SigninSchema } from "../validators/signin"

export type SuccessResponse<T = void> = {
  success: true
  message: string
} & (T extends void ? {} : { data: T })

export type ErrorResponse = {
  success: false
  error: string
  isFormError?: boolean
}

export type UserData = Pick<SigninSchema, "username">

export const createPostSchema = insertPostSchema
  .pick({
    title: true,
    url: true,
    content: true,
  })
  .refine((data) => data.url || data.content, {
    message: "Either URL or Content must be provided.",
    path: ["url", "content"],
  })
