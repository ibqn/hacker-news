import { db } from "@/drizzle/db"
import type { User } from "@/drizzle/schema/auth"
import { postsTable } from "@/drizzle/schema/posts"
import { signedIn } from "@/middleware/signed-in"
import { createPostSchema, type SuccessResponse } from "@/shared/types"
import type { Context } from "@/utils/context"
import { zValidator } from "@hono/zod-validator"
import { Hono } from "hono"

export const postRoute = new Hono<Context>().post("/", signedIn, zValidator("form", createPostSchema), async (c) => {
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

  return c.json<SuccessResponse<{ id: number }>>({ success: true, message: "Hello World", data: { id: post.id } }, 201)
})
