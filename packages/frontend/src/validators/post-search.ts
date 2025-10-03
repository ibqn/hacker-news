import { fallback } from '@tanstack/router-zod-adapter'
import { orderSchema, sortedBySchema } from 'backend/src/validators/pagination'
import { z } from 'zod'

const optionalStringSchema = z.string().optional()

export const postSearchSchema = z.object({
  sortedBy: fallback(sortedBySchema, 'recent').default('recent'),
  order: fallback(orderSchema, 'desc').default('desc'),
  author: fallback(optionalStringSchema, ''),
  site: fallback(optionalStringSchema, ''),
})

export type PostSearchSchema = z.infer<typeof postSearchSchema>
