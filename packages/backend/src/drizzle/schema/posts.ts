import { serial, text, integer, timestamp } from "drizzle-orm/pg-core"
import { relations, type InferSelectModel } from "drizzle-orm"
import { schema } from "@/drizzle/schema"
import { userTable } from "@/drizzle/schema/auth"
import { postUpvotesTable } from "@/drizzle/schema/upvotes"
import { commentsTable } from "@/drizzle/schema/comments"
import { createInsertSchema } from "drizzle-zod"
import { z } from "zod"

export const postsTable = schema.table("posts", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  title: text("title").notNull(),
  url: text("url"),
  content: text("content"),
  points: integer("points").notNull().default(0),
  commentCount: integer("comment_count").notNull().default(0),
  createdAt: timestamp("created_at", {
    withTimezone: true,
    mode: "date",
  })
    .notNull()
    .defaultNow(),
})

export const insertPostSchema = createInsertSchema(postsTable, {
  title: z.string().min(3, { message: "Title should have at least 3 characters." }),
  url: z.string().trim().url({ message: "URL must be valid." }).optional(),
  content: z.string().optional(),
})

export const postRelations = relations(postsTable, ({ one, many }) => ({
  author: one(userTable, {
    fields: [postsTable.userId],
    references: [userTable.id],
    relationName: "author",
  }),
  postUpvotes: many(postUpvotesTable, { relationName: "postUpvotes" }),
  comments: many(commentsTable),
}))
