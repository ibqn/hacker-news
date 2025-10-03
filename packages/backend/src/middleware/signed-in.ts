import type { ExtEnv } from "@/utils/extended-env"
import { createMiddleware } from "hono/factory"
import { HTTPException } from "hono/http-exception"

export const signedIn = createMiddleware<ExtEnv>(async (c, next) => {
  const user = c.get("user")
  if (!user) {
    throw new HTTPException(401, { message: "You must be signed in to access this resource" })
  }

  await next()
})
