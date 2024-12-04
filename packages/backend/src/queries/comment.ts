import { db } from "@/drizzle/db"
import type { User } from "@/drizzle/schema/auth"
import { commentsTable } from "@/drizzle/schema/comments"
import { postsTable } from "@/drizzle/schema/posts"
import { commentUpvotesTable } from "@/drizzle/schema/upvotes"
import type { CommentPaginationSchema } from "@/validators/pagination"
import { and, asc, countDistinct, desc, eq, isNull, sql } from "drizzle-orm"
import { HTTPException } from "hono/http-exception"

type GetCommentsCountOptions = {
  postId: number
}

export const getCommentsCount = async ({ postId }: GetCommentsCountOptions) => {
  const [count] = await db
    .select({ count: countDistinct(commentsTable.id) })
    .from(commentsTable)
    .where(and(eq(commentsTable.postId, postId), isNull(commentsTable.parentCommentId)))

  return count
}

type GetCommentsOptions = CommentPaginationSchema & {
  postId: number
  user?: User | null
}

export const getComments = async ({
  postId,
  limit,
  page,
  sortedBy,
  order,
  includeChildren,
  user,
}: GetCommentsOptions) => {
  const offset = (page - 1) * limit
  const sortByColumn = sortedBy === "points" ? commentsTable.points : commentsTable.createdAt
  const sortOrder = order === "desc" ? desc(sortByColumn) : asc(sortByColumn)

  const [postExists] = await db
    .select({ exists: sql<boolean>`true` })
    .from(postsTable)
    .where(eq(postsTable.id, postId))
    .limit(1)

  if (!postExists) {
    throw new HTTPException(404, { message: "Post not found" })
  }

  const comments = await db.query.comments.findMany({
    where: ({ parentCommentId }, { eq, isNull, and }) => and(eq(commentsTable.postId, postId), isNull(parentCommentId)),
    orderBy: sortOrder,
    limit,
    offset,
    with: {
      author: {
        columns: {
          username: true,
          id: true,
        },
      },
      ...(user && {
        commentUpvotes: {
          where: eq(commentUpvotesTable.userId, user.id),
          columns: { userId: true },
          limit: 1,
        },
      }),
      childComments: {
        limit: includeChildren ? 3 : 0,
        with: {
          author: {
            columns: {
              username: true,
              id: true,
            },
          },
          ...(user && {
            commentUpvotes: {
              where: eq(commentUpvotesTable.userId, user.id),
              columns: { userId: true },
              limit: 1,
            },
          }),
        },
        orderBy: sortOrder,
      },
    },
  })

  return comments
}

export type Comment = Awaited<ReturnType<typeof getComments>>[number]
