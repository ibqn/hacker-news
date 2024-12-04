import { db } from "@/drizzle/db"
import { type User } from "@/drizzle/schema/auth"
import { postsTable } from "@/drizzle/schema/posts"
import { signedIn } from "@/middleware/signed-in"
import { getCommentsCount, getComments, type Comment, createCommentForPost } from "@/queries/comment"
import { getPost, getPosts, getPostsCount, type Post } from "@/queries/post"
import { createPostUpvote, type UpvoteData } from "@/queries/upvote"
import {
  createCommentSchema,
  createPostSchema,
  type PaginatedSuccessResponse,
  type SuccessResponse,
} from "@/shared/types"
import type { Context } from "@/utils/context"
import { commentsPaginationSchema, paginationSchema } from "@/validators/pagination"
import { paramIdSchema } from "@/validators/param"
import { zValidator } from "@hono/zod-validator"
import { Hono } from "hono"
import { HTTPException } from "hono/http-exception"

export const postRoute = new Hono<Context>()
  .post("/", signedIn, zValidator("form", createPostSchema), async (c) => {
    const { title, url, content } = c.req.valid("form")
    const user = c.get("user") as User

    const [post] = await db
      .insert(postsTable)
      .values({
        userId: user.id,
        title,
        url,
        content,
      })
      .returning({ id: postsTable.id })

    return c.json<SuccessResponse<{ id: number }>>(
      { success: true, message: "Post created", data: { id: post.id } },
      201
    )
  })
  .get("/", zValidator("query", paginationSchema), async (c) => {
    const { limit, page, sortedBy, order, author, site } = c.req.valid("query")
    const user = c.get("user")

    const { count } = await getPostsCount({ author, site })
    const posts = await getPosts({ limit, page, sortedBy, order, author, site, user })

    return c.json<PaginatedSuccessResponse<Post[]>>(
      {
        success: true,
        message: "Posts fetched successfully",
        data: posts,
        pagination: { page, totalPages: Math.ceil(count / limit) },
      },
      200
    )
  })
  .post(":id/upvote", signedIn, zValidator("param", paramIdSchema), async (c) => {
    const { id } = c.req.valid("param")
    const user = c.get("user") as User

    const upvoteData = await createPostUpvote({ id, user })

    return c.json<SuccessResponse<UpvoteData>>({ success: true, message: "Post upvoted", data: upvoteData }, 201)
  })
  .post(
    ":id/comment",
    signedIn,
    zValidator("param", paramIdSchema),
    zValidator("form", createCommentSchema),
    async (c) => {
      const { id } = c.req.valid("param")
      const user = c.get("user") as User
      const { content } = c.req.valid("form")

      const comment = await createCommentForPost({ id, content, user })

      return c.json<SuccessResponse<Comment>>({ success: true, message: "Comment created", data: comment }, 201)
    }
  )
  .get(":id/comments", zValidator("param", paramIdSchema), zValidator("query", commentsPaginationSchema), async (c) => {
    const { limit, page, sortedBy, order, includeChildren } = c.req.valid("query")
    const { id } = c.req.valid("param")
    const user = c.get("user")

    const { count } = await getCommentsCount({ postId: id })
    const comments = await getComments({ postId: id, limit, page, sortedBy, order, includeChildren, user })

    return c.json<PaginatedSuccessResponse<Comment[]>>(
      {
        success: true,
        message: "Comments fetched successfully",
        data: comments,
        pagination: { page, totalPages: Math.ceil(count / limit) },
      },
      200
    )
  })
  .get(":id", zValidator("param", paramIdSchema), async (c) => {
    const { id } = c.req.valid("param")
    const user = c.get("user")

    const post = await getPost({ postId: id, user })

    if (!post) {
      throw new HTTPException(404, { message: "Post not found" })
    }

    return c.json<SuccessResponse<Post>>({ success: true, message: "Post fetched successfully", data: post }, 200)
  })
