import { fallback } from '@tanstack/router-zod-adapter'
import { z } from 'zod/v3'

export const searchSchema = z.object({
  redirect: fallback(z.string(), '/').default('/'),
})
