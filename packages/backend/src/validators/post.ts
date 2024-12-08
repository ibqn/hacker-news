import { insertPostSchema } from "../drizzle/schema/posts"
import type { z } from "zod"

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

export type CreatePostSchema = z.infer<typeof createPostSchema>
