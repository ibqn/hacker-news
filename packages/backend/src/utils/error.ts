import type { HTTPResponseError } from "hono/types"

export const isFormError = (error: Error | HTTPResponseError) =>
  error.cause && typeof error.cause === "object" && "form" in error.cause ? error.cause.form === true : false

export const getErrorMessage = (error: Error | HTTPResponseError) =>
  process.env.NODE_ENV === "production" ? "Internal server error" : error.stack ?? error.message
