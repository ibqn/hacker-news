import { db } from "@/drizzle/db"
import type { User } from "@/drizzle/schema/auth"
import { commentsTable } from "@/drizzle/schema/comments"
import { postsTable } from "@/drizzle/schema/posts"
import { signedIn } from "@/middleware/signed-in"
import { createCommentSchema, type SuccessResponse } from "@/shared/types"
import type { Context } from "@/utils/context"
import { paramIdSchema } from "@/validators/param"
import { zValidator } from "@hono/zod-validator"
import { eq, sql } from "drizzle-orm"
import { Hono } from "hono"
import { HTTPException } from "hono/http-exception"

export const commentRoute = new Hono<Context>().post(
  "/:id",
  signedIn,
  zValidator("param", paramIdSchema),
  zValidator("form", createCommentSchema),
  async (c) => {
    const { content } = c.req.valid("form")
    const { id } = c.req.valid("param")
    const user = c.get("user") as User

    const comment = await db.transaction(async (trx) => {
      const [parentComment] = await trx
        .select({ id: commentsTable.id, postId: commentsTable.postId, depth: commentsTable.depth })
        .from(commentsTable)
        .where(eq(commentsTable.id, id))
        .limit(1)

      if (!parentComment) {
        throw new HTTPException(404, { message: "Comment not found" })
      }

      const [updatedParentComment] = await trx
        .update(commentsTable)
        .set({ commentCount: sql`${commentsTable.commentCount} + 1` })
        .where(eq(commentsTable.id, id))
        .returning({ commentCount: commentsTable.commentCount })

      const [updatedPost] = await trx
        .update(postsTable)
        .set({ commentCount: sql`${postsTable.commentCount} + 1` })
        .where(eq(postsTable.id, parentComment.postId))
        .returning({ commentCount: postsTable.commentCount })

      if (!updatedParentComment || !updatedPost) {
        throw new HTTPException(500, { message: "Failed to update comment count" })
      }

      const [comment] = await trx
        .insert(commentsTable)
        .values({
          userId: user.id,
          postId: parentComment.postId,
          depth: parentComment.depth + 1,
          parentCommentId: parentComment.id,
          content,
        })
        .returning({
          id: commentsTable.id,
          userId: commentsTable.userId,
          postId: commentsTable.postId,
          depth: commentsTable.depth,
          parentCommentId: commentsTable.parentCommentId,
          points: commentsTable.points,
          content: commentsTable.content,
          commentCount: commentsTable.commentCount,
          createdAt: commentsTable.createdAt,
        })

      return comment
    })

    return c.json<SuccessResponse<typeof comment>>({ success: true, message: "Comment created", data: comment }, 201)
  }
)
