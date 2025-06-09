import { serial, text, integer, timestamp, uuid } from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"
import { schema } from "../schema"
import { userTable } from "../schema/auth"
import { postsTable } from "../schema/posts"
import { commentUpvotesTable } from "../schema/upvotes"
import { createInsertSchema } from "drizzle-zod"
import { z } from "zod"

export const commentsTable = schema.table("comments", {
  id: serial("id").primaryKey(),
  userId: uuid("user_id").notNull(),
  postId: integer("post_id").notNull(),
  parentCommentId: integer("parent_comment_id"),
  content: text("content").notNull(),
  depth: integer("depth").notNull().default(0),
  points: integer("points").notNull().default(0),
  commentCount: integer("comment_count").notNull().default(0),
  createdAt: timestamp("created_at", {
    withTimezone: true,
  })
    .notNull()
    .defaultNow(),
})

export const commentRelations = relations(commentsTable, ({ one, many }) => ({
  author: one(userTable, { fields: [commentsTable.userId], references: [userTable.id] }),
  parentComment: one(commentsTable, { fields: [commentsTable.parentCommentId], references: [commentsTable.id] }),
  childComments: many(commentsTable),
  post: one(postsTable, { fields: [commentsTable.postId], references: [postsTable.id] }),
  commentUpvotes: many(commentUpvotesTable),
}))

export const insertCommentSchema = createInsertSchema(commentsTable, {
  content: z.string().min(3, { message: "Content should have at least 3 characters." }),
})
