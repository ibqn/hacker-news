import { z } from "zod"

export const signinSchema = z.object({
  username: z
    .string()
    .min(3)
    .max(32)
    .regex(/^[a-zA-Z0-9_]+$/),
  password: z.string().min(6),
})

export type SigninSchema = z.infer<typeof signinSchema>
