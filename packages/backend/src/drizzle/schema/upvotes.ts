import { serial, text, integer, timestamp } from "drizzle-orm/pg-core"
import { relations, type InferSelectModel } from "drizzle-orm"
import { schema } from "@/drizzle/schema"
import { postsTable } from "@/drizzle/schema/posts"
import { userTable } from "@/drizzle/schema/auth"
import { commentsTable } from "@/drizzle/schema/comments"

export const postUpvotesTable = schema.table("post_upvotes", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  postId: integer("post_id").notNull(),
  createdAt: timestamp("created_at", {
    withTimezone: true,
    mode: "date",
  })
    .notNull()
    .defaultNow(),
})

export const postUpvotesRelations = relations(postUpvotesTable, ({ one }) => ({
  post: one(postsTable, {
    fields: [postUpvotesTable.postId],
    references: [postsTable.id],
    relationName: "postUpvotes",
  }),
  user: one(userTable, {
    fields: [postUpvotesTable.userId],
    references: [userTable.id],
    relationName: "user",
  }),
}))

export const commentUpvotesTable = schema.table("comment_upvotes", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  commentId: integer("comment_id").notNull(),
  createdAt: timestamp("created_at", {
    withTimezone: true,
    mode: "date",
  })
    .notNull()
    .defaultNow(),
})

export const commentUpvotesRelations = relations(commentUpvotesTable, ({ one }) => ({
  post: one(commentsTable, {
    fields: [commentUpvotesTable.commentId],
    references: [commentsTable.id],
    relationName: "commentUpvotes",
  }),
  user: one(userTable, {
    fields: [commentUpvotesTable.userId],
    references: [userTable.id],
    relationName: "user",
  }),
}))
