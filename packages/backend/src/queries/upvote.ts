import { db } from "../drizzle/db"
import type { User } from "../drizzle/schema/auth"
import { commentsTable } from "../drizzle/schema/comments"
import { postsTable } from "../drizzle/schema/posts"
import { commentUpvotesTable, postUpvotesTable } from "../drizzle/schema/upvotes"
import { and, eq, sql } from "drizzle-orm"
import { HTTPException } from "hono/http-exception"

type CreateUpvoteOptions = {
  id: number
  user: User
}

export type UpvoteData = {
  points: number
  isUpvoted: boolean
}

export const createCommentUpvote = async ({ id, user }: CreateUpvoteOptions) => {
  const commentUpvoteData = await db.transaction(async (trx) => {
    const [existingUpvote] = await trx
      .select()
      .from(commentUpvotesTable)
      .where(and(eq(commentUpvotesTable.commentId, id), eq(commentUpvotesTable.userId, user.id)))
      .limit(1)

    const pointChange = existingUpvote ? -1 : 1

    const [updated] = await trx
      .update(commentsTable)
      .set({ points: sql`${commentsTable.points}+${pointChange}` })
      .where(eq(commentsTable.id, id))
      .returning({ points: commentsTable.points })

    if (!updated) {
      throw new HTTPException(404, { message: "Comment not found" })
    }

    if (existingUpvote) {
      await trx.delete(commentUpvotesTable).where(eq(commentUpvotesTable.commentId, id))
    } else {
      await trx.insert(commentUpvotesTable).values({ commentId: id, userId: user.id })
    }

    return { points: updated.points, isUpvoted: !existingUpvote }
  })

  return commentUpvoteData satisfies UpvoteData as UpvoteData
}

export const createPostUpvote = async ({ id, user }: CreateUpvoteOptions) => {
  const postUpvoteData = await db.transaction(async (trx) => {
    const [existingUpvote] = await trx
      .select()
      .from(postUpvotesTable)
      .where(and(eq(postUpvotesTable.postId, id), eq(postUpvotesTable.userId, user.id)))
      .limit(1)

    const pointChange = existingUpvote ? -1 : 1

    const [updated] = await trx
      .update(postsTable)
      .set({ points: sql`${postsTable.points}+${pointChange}` })
      .where(eq(postsTable.id, id))
      .returning({ points: postsTable.points })

    if (!updated) {
      throw new HTTPException(404, { message: "Post not found" })
    }

    if (existingUpvote) {
      await trx.delete(postUpvotesTable).where(eq(postUpvotesTable.postId, id))
    } else {
      await trx.insert(postUpvotesTable).values({ postId: id, userId: user.id })
    }

    return { points: updated.points, isUpvoted: !existingUpvote }
  })

  return postUpvoteData satisfies UpvoteData as UpvoteData
}
