import { db } from "@/drizzle/db"
import { type User } from "@/drizzle/schema/auth"
import { postsTable } from "@/drizzle/schema/posts"
import { signedIn } from "@/middleware/signed-in"
import { getPosts, getPostsCount, type Post } from "@/queries/post"
import { createPostSchema, paginationSchema, type PaginatedSuccessResponse, type SuccessResponse } from "@/shared/types"
import type { Context } from "@/utils/context"
import { zValidator } from "@hono/zod-validator"
import { Hono } from "hono"

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
      { success: true, message: "Hello World", data: { id: post.id } },
      201
    )
  })
  .get("/", zValidator("query", paginationSchema), async (c) => {
    const { limit, page, sortedBy, order, author, site } = c.req.valid("query")
    const user = c.get("user")

    const { count } = await getPostsCount({ author, site })
    const posts = await getPosts({ limit, page, sortedBy, order, author, site, user })

    return c.json<PaginatedSuccessResponse<{ posts: Post[] }>>(
      {
        success: true,
        message: "Posts fetched successfully",
        data: { posts },
        pagination: { page, totalPages: Math.ceil(count / limit) },
      },
      200
    )
  })
