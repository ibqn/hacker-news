import type { Context } from "@/utils/context"
import { Hono } from "hono"
import { zValidator } from "@hono/zod-validator"
import { signupSchema } from "@/validators/signup"
import argon2 from "argon2"
import { db } from "@/drizzle/db"
import { userTable } from "@/drizzle/schema/auth"
import { createSession, generateSessionToken } from "@/lucia"
import { setCookie } from "hono/cookie"
import type { SuccessResponse } from "@/shared/types"
import postgres from "postgres"
import { HTTPException } from "hono/http-exception"

const authRouter = new Hono<Context>()

authRouter.post("/signup", zValidator("form", signupSchema), async (c) => {
  const { username, password } = c.req.valid("form")

  const passwordHash = await argon2.hash(password)

  try {
    const [user] = await db
      .insert(userTable)
      .values({
        username,
        passwordHash,
      })
      .returning({ id: userTable.id })

    const token = generateSessionToken()
    const session = await createSession(token, user.id)

    setCookie(c, "session_token", token)
    // console.log("User created", user)
    return c.json<SuccessResponse>({ success: true, message: "User created" }, 201)
  } catch (error) {
    // console.error("auth", error)
    if (error instanceof postgres.PostgresError && error.code === "23505") {
      throw new HTTPException(409, { message: "Username already exists" })
    } else {
      throw error
    }
  }
})

export { authRouter }
