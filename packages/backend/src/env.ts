import { z } from "zod"

const envSchema = z.object({
  DATABASE_URL: z.url(),
})

export type Env = z.infer<typeof envSchema>

const result = envSchema.safeParse(process.env)

if (result.error) {
  console.error("❌ Invalid env:")
  console.error(JSON.stringify(z.flattenError(result.error).fieldErrors, null, 2))
  process.exit(1)
}

export const env = result.data
