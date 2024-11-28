import { drizzle } from "drizzle-orm/postgres-js"
import { z } from "zod"
import { userTable, sessionTable, sessionRelations } from "@/drizzle/schema/auth"

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
})

const processEnv = envSchema.parse(process.env)

export const db = drizzle(processEnv.DATABASE_URL, {
  schema: {
    user: userTable,
    session: sessionTable,
    sessionRelations,
  },
})

const result = db.execute("select 1")
console.log(result)
