import type { Config } from "drizzle-kit"

export default {
  schema: "src/drizzle/schema",
  dialect: "postgresql",
  out: "src/drizzle/migrations",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  verbose: true,
  strict: true,
} satisfies Config
