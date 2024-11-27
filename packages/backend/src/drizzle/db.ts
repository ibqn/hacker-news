import { drizzle } from "drizzle-orm/postgres-js"
import { z } from "zod"

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
})

const processEnv = envSchema.parse(process.env)

export const db = drizzle(processEnv.DATABASE_URL, { schema: {} })

const result = db.execute("select 1")
console.log(result)
