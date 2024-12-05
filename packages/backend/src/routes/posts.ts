import { type User } from "@/drizzle/schema/auth"
import { signedIn } from "@/middleware/signed-in"
import { getCommentsCountForPost, getCommentsForPost, type Comment, createCommentForPost } from "@/queries/comment"
import { createPost, getPost, getPosts, getPostsCount, type Post } from "@/queries/post"
import { createPostUpvote, type UpvoteData } from "@/queries/upvote"
import { type PaginatedSuccessResponse, type SuccessResponse } from "@/shared/types"
import type { Context } from "@/utils/context"
import { createCommentSchema } from "@/validators/comment"
import { commentsPaginationSchema, paginationSchema } from "@/validators/pagination"
import { paramIdSchema } from "@/validators/param"
import { createPostSchema } from "@/validators/post"
import { zValidator } from "@hono/zod-validator"
import { Hono } from "hono"
import { HTTPException } from "hono/http-exception"

export const postRoute = new Hono<Context>()
  .post("/", signedIn, zValidator("form", createPostSchema), async (c) => {
    const { title, url, content } = c.req.valid("form")
    const user = c.get("user") as User

    const post = await createPost({ title, url, content, user })

    return c.json<SuccessResponse<Post>>({ success: true, message: "Post created", data: post }, 201)
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

    const { count } = await getCommentsCountForPost({ id })
    const comments = await getCommentsForPost({ id, limit, page, sortedBy, order, includeChildren, user })

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
