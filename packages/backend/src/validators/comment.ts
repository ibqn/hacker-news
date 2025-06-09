import { insertCommentSchema } from "../drizzle/schema/comments"
import type { z } from "zod/v3"

export const createCommentSchema = insertCommentSchema.pick({ content: true })

export type CreateCommentSchema = z.infer<typeof createCommentSchema>
