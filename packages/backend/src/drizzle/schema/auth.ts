import { text, timestamp, uuid } from "drizzle-orm/pg-core"
import { relations, type InferSelectModel } from "drizzle-orm"
import { schema } from "@/drizzle/schema"
import { postsTable } from "./posts"
import { commentsTable } from "./comments"
import { commentUpvotesTable, postUpvotesTable } from "./upvotes"

export const userTable = schema.table("user", {
  id: uuid("id").primaryKey().defaultRandom(),
  username: text("username").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
})

export const userRelations = relations(userTable, ({ many }) => ({
  posts: many(postsTable, { relationName: "author" }),
  comments: many(commentsTable, { relationName: "author" }),
  postUpvotes: many(postUpvotesTable, { relationName: "postUpvotes" }),
  commentUpvotes: many(commentUpvotesTable, { relationName: "commentUpvotes" }),
}))

export const sessionTable = schema.table("session", {
  id: text("id").primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => userTable.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at", {
    withTimezone: true,
    mode: "date",
  }).notNull(),
})

export const sessionRelations = relations(sessionTable, ({ one }) => ({
  user: one(userTable, { fields: [sessionTable.userId], references: [userTable.id] }),
}))

export type User = InferSelectModel<typeof userTable>
export type Session = InferSelectModel<typeof sessionTable>
