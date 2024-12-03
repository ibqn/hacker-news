import { z } from "zod"
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

export const sortBySchema = z.enum(["points", "recent"])
export const orderSchema = z.enum(["asc", "desc"])

export const paginationSchema = z.object({
  limit: z.coerce.number().optional().default(10),
  page: z.coerce.number().optional().default(1),
  sortedBy: sortBySchema.optional().default("recent"),
  order: orderSchema.optional().default("desc"),
  author: z.string().optional(),
  site: z.string().optional(),
})

export type PaginationSchema = z.infer<typeof paginationSchema>

export type PaginatedSuccessResponse<T> = SuccessResponse<T> & {
  pagination: {
    page: number
    totalPages: number
  }
}
