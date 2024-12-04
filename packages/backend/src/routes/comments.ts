import type { User } from "@/drizzle/schema/auth"
import { signedIn } from "@/middleware/signed-in"
import { createCommentForComment, type Comment } from "@/queries/comment"
import { createCommentUpvote, type UpvoteData } from "@/queries/upvote"
import { createCommentSchema, type SuccessResponse } from "@/shared/types"
import type { Context } from "@/utils/context"
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