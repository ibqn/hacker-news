import { z } from "zod"

export const sortedByValues = ["points", "recent"] as const
export const sortedBySchema = z.enum(sortedByValues)
export type SortedBySchema = z.infer<typeof sortedBySchema>

export const orderSchema = z.enum(["asc", "desc"])
export type OrderSchema = z.infer<typeof orderSchema>

export const paginationSchema = z.object({
  limit: z.coerce.number().optional().default(10),
  page: z.coerce.number().optional().default(1),
  sortedBy: sortedBySchema.optional().default("recent"),
  order: orderSchema.optional().default("desc"),
  author: z.string().optional(),
  site: z.string().optional(),
})

export type PaginationSchema = z.infer<typeof paginationSchema>

export const commentQuerySchema = z.object({ includeChildren: z.coerce.boolean().optional().default(false) })

export const commentsPaginationSchema = paginationSchema.merge(commentQuerySchema).omit({ site: true, author: true })

export type CommentPaginationSchema = z.infer<typeof commentsPaginationSchema>
