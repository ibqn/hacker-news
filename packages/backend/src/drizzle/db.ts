import { drizzle } from "drizzle-orm/postgres-js"
import { z } from "zod"
import { userTable, sessionTable, sessionRelations } from "@/drizzle/schema/auth"
import { postRelations, postsTable } from "@/drizzle/schema/posts"
import { commentRelations, commentsTable } from "@/drizzle/schema/comments"
import {
  commentUpvotesRelations,
  commentUpvotesTable,
  postUpvotesRelations,
  postUpvotesTable,
} from "@/drizzle/schema/upvotes"

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
})

const processEnv = envSchema.parse(process.env)

export const db = drizzle(processEnv.DATABASE_URL, {
  schema: {
    user: userTable,
    session: sessionTable,
    sessionRelations,
    posts: postsTable,
    comments: commentsTable,
    commentUpvotes: commentUpvotesTable,
    postUpvotes: postUpvotesTable,
    postRelations,
    commentRelations,
    postUpvotesRelations,
    commentUpvotesRelations,
  },
})

const result = db.execute("select 1")
console.log(result)
