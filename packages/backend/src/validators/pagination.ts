import { z } from "zod"

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

export const commentQuerySchema = z.object({ includeChildren: z.coerce.boolean().optional().default(false) })

export const commentsPaginationSchema = paginationSchema.merge(commentQuerySchema).omit({ site: true, author: true })

export type CommentPaginationSchema = z.infer<typeof commentsPaginationSchema>
