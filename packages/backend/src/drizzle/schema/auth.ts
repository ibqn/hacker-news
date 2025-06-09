import { text, timestamp, uuid } from "drizzle-orm/pg-core"
import { relations, type InferSelectModel } from "drizzle-orm"
import { schema } from "../schema"
import { postsTable } from "../schema/posts"
import { commentsTable } from "../schema/comments"
import { commentUpvotesTable, postUpvotesTable } from "./upvotes"

export const userTable = schema.table("user", {
  id: uuid("id").primaryKey().defaultRandom(),
  username: text("username").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
})

export const userRelations = relations(userTable, ({ many }) => ({
  posts: many(postsTable),
  comments: many(commentsTable),
  postUpvotes: many(postUpvotesTable),
  commentUpvotes: many(commentUpvotesTable),
}))

export const sessionTable = schema.table("session", {
  id: text("id").primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => userTable.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
})

export const sessionRelations = relations(sessionTable, ({ one }) => ({
  user: one(userTable, { fields: [sessionTable.userId], references: [userTable.id] }),
}))

export type User = Omit<InferSelectModel<typeof userTable>, "passwordHash">
export type Session = InferSelectModel<typeof sessionTable>
