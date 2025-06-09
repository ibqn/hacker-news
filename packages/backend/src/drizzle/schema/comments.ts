import { serial, text, integer, timestamp, uuid, type PgColumn } from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"
import { schema } from "../schema"
import { userTable } from "../schema/auth"
import { postsTable } from "../schema/posts"
import { commentUpvotesTable } from "../schema/upvotes"
import { createInsertSchema } from "drizzle-zod"
import { z } from "zod/v3"

export const commentsTable = schema.table("comments", {
  id: serial("id").primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => userTable.id, { onDelete: "cascade" }),
  postId: integer("post_id")
    .notNull()
    .references(() => postsTable.id, { onDelete: "cascade" }),
  parentCommentId: integer("parent_comment_id").references((): PgColumn => commentsTable.id, {
    onDelete: "cascade",
  }),
  content: text("content").notNull(),
  depth: integer("depth").notNull().default(0),
  points: integer("points").notNull().default(0),
  commentCount: integer("comment_count").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
})

export const commentRelations = relations(commentsTable, ({ one, many }) => ({
  author: one(userTable, { fields: [commentsTable.userId], references: [userTable.id] }),
  parentComment: one(commentsTable, {
    fields: [commentsTable.parentCommentId],
    references: [commentsTable.id],
    relationName: "childComments",
  }),
  childComments: many(commentsTable, { relationName: "childComments" }),
  post: one(postsTable, { fields: [commentsTable.postId], references: [postsTable.id] }),
  commentUpvotes: many(commentUpvotesTable),
}))

export const insertCommentSchema = createInsertSchema(commentsTable, {
  content: z.string().min(3, { message: "Content should have at least 3 characters." }),
})
