import type { User } from "@/drizzle/schema/auth"
import { signedIn } from "@/middleware/signed-in"
import {
  createCommentForComment,
  getComment,
  getCommentsCountForComment,
  getCommentsForComment,
  type Comment,
} from "@/queries/comment"
import { createCommentUpvote, type UpvoteData } from "@/queries/upvote"
import { type PaginatedSuccessResponse, type SuccessResponse } from "@/shared/types"
import type { Context } from "@/utils/context"
import { createCommentSchema } from "@/validators/comment"
import { commentQuerySchema, commentsPaginationSchema, paginationSchema } from "@/validators/pagination"
import { paramIdSchema } from "@/validators/param"
import { zValidator } from "@hono/zod-validator"
import { Hono } from "hono"

export const commentRoute = new Hono<Context>()
  .post("/:id", signedIn, zValidator("param", paramIdSchema), zValidator("form", createCommentSchema), async (c) => {
    const { content } = c.req.valid("form")
    const { id } = c.req.valid("param")
    const user = c.get("user") as User

    const comment = await createCommentForComment({ id, content, user })

    return c.json<SuccessResponse<Comment>>({ success: true, message: "Comment created", data: comment }, 201)
  })
  .post("/:id/upvote", signedIn, zValidator("param", paramIdSchema), async (c) => {
    const { id } = c.req.valid("param")
    const user = c.get("user") as User

    const commentUpvote = await createCommentUpvote({ id, user })

    return c.json<SuccessResponse<UpvoteData>>({ success: true, message: "Comment upvoted", data: commentUpvote }, 201)
  })
  .get(
    "/:id/comments",
    zValidator("param", paramIdSchema),
    zValidator("query", commentsPaginationSchema),
    async (c) => {
      const { id } = c.req.valid("param")
      const user = c.get("user")
      const { limit, page, sortedBy, order, includeChildren } = c.req.valid("query")

      const { count } = await getCommentsCountForComment({ id })
      const comments = await getCommentsForComment({ id, limit, page, sortedBy, order, includeChildren, user })

      return c.json<PaginatedSuccessResponse<Comment[]>>(
        {
          success: true,
          message: "Comments fetched successfully",
          data: comments,
          pagination: { page, totalPages: Math.ceil(count / limit) },
        },
        200
      )
    }
  )
  .get("/:id", zValidator("param", paramIdSchema), zValidator("query", commentQuerySchema), async (c) => {
    const { id } = c.req.valid("param")
    const user = c.get("user")
    const { includeChildren } = c.req.valid("query")

    const comment = await getComment({ commentId: id, user, includeChildren })

    return c.json<SuccessResponse<Comment>>(
      { success: true, message: "Comment fetched successfully", data: comment },
      200
    )
  })
