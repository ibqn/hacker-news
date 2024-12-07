import { fallback } from '@tanstack/router-zod-adapter'
import { orderSchema, sortedBySchema } from 'backend/src/validators/pagination'
import { z } from 'zod'

export const postSearchSchema = z.object({
  sortedBy: fallback(sortedBySchema, 'recent').default('recent'),
  order: fallback(orderSchema, 'desc').default('desc'),
  author: fallback(z.string().optional(), ''),
  site: fallback(z.string().optional(), ''),
})

export type PostSearchSchema = z.infer<typeof postSearchSchema>
