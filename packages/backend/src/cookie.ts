export const sessionCookieName = "lucia_session"

export const getSessionCookieOptions = (expiresAt?: Date) =>
  ({
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    expires: expiresAt ?? new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
    path: "/",
  }) as const
