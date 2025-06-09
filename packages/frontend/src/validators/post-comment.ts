import { z } from 'zod/v4'

export const postCommentSchema = z
  .object({ content: z.string() })
  .and(
    z
      .object({ postId: z.number(), commentId: z.undefined() })
      .or(z.object({ postId: z.undefined(), commentId: z.number() }))
  )

export type PostCommentSchema = z.infer<typeof postCommentSchema>
