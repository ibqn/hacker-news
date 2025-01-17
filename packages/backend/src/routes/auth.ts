import type { Context } from "@/utils/context"
import { Hono } from "hono"
import { zValidator } from "@hono/zod-validator"
import { signinSchema } from "@/validators/signin"
import argon2 from "argon2"
import { db } from "@/drizzle/db"
import { userTable, type User } from "@/drizzle/schema/auth"
import { createSession, generateSessionToken, invalidateSessionToken } from "@/lucia"
import { deleteCookie, getCookie, setCookie } from "hono/cookie"
import type { SuccessResponse } from "@/shared/types"
import postgres from "postgres"
import { HTTPException } from "hono/http-exception"
import { signedIn } from "@/middleware/signed-in"
import { getSessionCookieOptions, sessionCookieName } from "@/cookie"

const authRoute = new Hono<Context>()
  .post("/signup", zValidator("form", signinSchema), async (c) => {
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

      setCookie(c, sessionCookieName, token, getSessionCookieOptions())
      return c.json<SuccessResponse>({ success: true, message: "User created" }, 201)
    } catch (error) {
      if (error instanceof postgres.PostgresError && error.code === "23505") {
        throw new HTTPException(409, { message: "Username already exists", cause: { form: true } })
      } else {
        throw error
      }
    }
  })
  .post("/signin", zValidator("form", signinSchema), async (c) => {
    const { username, password } = c.req.valid("form")

    const user = await db.query.user.findFirst({
      where: ({ username: u }, { eq }) => eq(u, username),
    })

    if (!user) {
      throw new HTTPException(401, { message: "Invalid username or password" })
    }

    const validPassword = await argon2.verify(user.passwordHash, password)

    if (!validPassword) {
      throw new HTTPException(401, { message: "Invalid username or password" })
    }

    const token = generateSessionToken()
    const session = await createSession(token, user.id)

    setCookie(c, sessionCookieName, token, getSessionCookieOptions())
    return c.json<SuccessResponse>({ success: true, message: "Signed in" }, 201)
  })
  .get("/signout", signedIn, async (c) => {
    const token = getCookie(c, sessionCookieName)
    if (token) {
      await invalidateSessionToken(token)
      deleteCookie(c, sessionCookieName)
      return c.json<SuccessResponse>({ success: true, message: "Signed out" })
    }
    throw new HTTPException(401, { message: "You must be signed in to sign out" })
  })
  .get("/user", signedIn, async (c) => {
    const user = c.get("user") as User
    return c.json<SuccessResponse<User>>({ success: true, data: user, message: "User data" })
  })

export { authRoute }
