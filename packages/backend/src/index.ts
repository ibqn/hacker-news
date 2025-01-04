import { serve } from "@hono/node-server"
import { Hono } from "hono"
import { HTTPException } from "hono/http-exception"
import type { ErrorResponse, SuccessResponse } from "@/shared/types"
import { getErrorMessage, isFormError } from "@/utils/error"
import type { Context } from "@/utils/context"
import { validateSessionToken } from "@/lucia"
import { deleteCookie, getCookie, setCookie } from "hono/cookie"
import { authRoute } from "@/routes/auth"
import { cors } from "hono/cors"
import { prettyJSON } from "hono/pretty-json"
import { postRoute } from "@/routes/posts"
import { commentRoute } from "@/routes/comments"
import { getSessionCookieOptions, sessionCookieName } from "./cookie"

const app = new Hono<Context>()

app.use(prettyJSON())

app.notFound((c) => c.json<ErrorResponse>({ error: "Not Found", success: false }, 404))

app.get("/", (c) => {
  return c.json<SuccessResponse>({ success: true, message: "Hello Hono!" }, 201)
})

app.use("*", cors(), async (c, next) => {
  const token = getCookie(c, sessionCookieName)
  // console.log("token", token)
  if (!token) {
    c.set("user", null)
    c.set("session", null)
    return await next()
  }

  const { session, user } = await validateSessionToken(token)
  if (session) {
    setCookie(c, sessionCookieName, token, getSessionCookieOptions())
  } else {
    deleteCookie(c, sessionCookieName)
  }
  c.set("session", session)
  c.set("user", user)

  await next()
})

export const routes = app
  .basePath("/api")
  .route("/auth", authRoute)
  .route("/posts", postRoute)
  .route("/comments", commentRoute)

app.onError((error, c) => {
  // console.error(error)

  if (error instanceof HTTPException) {
    const errorResponse =
      error.res ??
      c.json<ErrorResponse>(
        {
          success: false,
          error: error.message,
          isFormError: isFormError(error),
        },
        error.status
      )
    return errorResponse
  }

  return c.json<ErrorResponse>({ success: false, error: getErrorMessage(error) }, 500)
})

const port = 3333
console.log(`Server is running on http://localhost:${port}`)

serve({ fetch: app.fetch, port })
