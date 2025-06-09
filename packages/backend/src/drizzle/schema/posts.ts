import { serial, text, integer, timestamp, uuid } from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"
import { schema } from "../schema"
import { userTable } from "../schema/auth"
import { postUpvotesTable } from "../schema/upvotes"
import { commentsTable } from "../schema/comments"
import { createInsertSchema } from "drizzle-zod"
import { z } from "zod/v3"

export const postsTable = schema.table("posts", {
  id: serial("id").primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => userTable.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  url: text("url"),
  content: text("content"),
  points: integer("points").notNull().default(0),
  commentCount: integer("comment_count").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
})

export const insertPostSchema = createInsertSchema(postsTable, {
  title: z.string().min(3, { message: "Title should have at least 3 characters." }),
  url: z.string().url({ message: "URL must be valid." }).optional().or(z.literal("")),
  content: z.string().optional(),
})

export const postRelations = relations(postsTable, ({ one, many }) => ({
  author: one(userTable, { fields: [postsTable.userId], references: [userTable.id] }),
  postUpvotes: many(postUpvotesTable),
  comments: many(commentsTable),
}))
