import { z } from "zod/v3"

export const paramIdSchema = z.object({
  id: z.coerce.number(),
})

export type ParamIdSchema = z.infer<typeof paramIdSchema>
