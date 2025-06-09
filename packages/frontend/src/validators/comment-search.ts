import { fallback } from '@tanstack/router-zod-adapter'
import { orderSchema, sortedBySchema } from 'backend/src/validators/pagination'
import { z } from 'zod/v3'

export const commentSearchSchema = z.object({
  sortedBy: fallback(sortedBySchema, 'recent').default('recent'),
  order: fallback(orderSchema, 'desc').default('desc'),
})

export type CommentSearchSchema = z.infer<typeof commentSearchSchema>
