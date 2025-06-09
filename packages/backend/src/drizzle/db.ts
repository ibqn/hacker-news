import { drizzle } from "drizzle-orm/postgres-js"
import { userTable, sessionTable, sessionRelations, userRelations } from "./schema/auth"
import { postRelations, postsTable } from "./schema/posts"
import { commentRelations, commentsTable } from "./schema/comments"
import { commentUpvotesRelations, commentUpvotesTable, postUpvotesRelations, postUpvotesTable } from "./schema/upvotes"
import { env } from "../env"

export const db = drizzle(env.DATABASE_URL, {
  schema: {
    user: userTable,
    session: sessionTable,
    sessionRelations,
    userRelations,
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
