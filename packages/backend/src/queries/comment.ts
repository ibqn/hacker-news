import { db } from "@/drizzle/db"
import { userTable, type User } from "@/drizzle/schema/auth"
import { commentsTable } from "@/drizzle/schema/comments"
import { postsTable } from "@/drizzle/schema/posts"
import { commentUpvotesTable } from "@/drizzle/schema/upvotes"
import type { CommentPaginationSchema } from "@/validators/pagination"
import { and, asc, countDistinct, desc, eq, isNull, sql } from "drizzle-orm"
import { HTTPException } from "hono/http-exception"

type GetCommentsCountOptions = {
  id: number
}

export const getCommentsCountForPost = async ({ id: postId }: GetCommentsCountOptions) => {
  const [count] = await db
    .select({ count: countDistinct(commentsTable.id) })
    .from(commentsTable)
    .where(and(eq(commentsTable.postId, postId), isNull(commentsTable.parentCommentId)))

  return count
}

type GetCommentsOptions = CommentPaginationSchema & {
  id: number
  user?: User | null
}

export const getCommentsForPost = async ({
  id: postId,
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

export type Comment = Awaited<ReturnType<typeof getCommentsForPost>>[number]

type CreateCommentOptions = {
  id: number
  content: string
  user: User
}

export const createCommentForComment = async ({ id: commentId, content, user }: CreateCommentOptions) => {
  const comment = await db.transaction(async (trx) => {
    const [parentComment] = await trx
      .select({ id: commentsTable.id, postId: commentsTable.postId, depth: commentsTable.depth })
      .from(commentsTable)
      .where(eq(commentsTable.id, commentId))
      .limit(1)

    if (!parentComment) {
      throw new HTTPException(404, { message: "Comment not found" })
    }

    const [updatedParentComment] = await trx
      .update(commentsTable)
      .set({ commentCount: sql`${commentsTable.commentCount} + 1` })
      .where(eq(commentsTable.id, parentComment.id))
      .returning({ commentCount: commentsTable.commentCount })

    const [updatedPost] = await trx
      .update(postsTable)
      .set({ commentCount: sql`${postsTable.commentCount} + 1` })
      .where(eq(postsTable.id, parentComment.postId))
      .returning({ commentCount: postsTable.commentCount })

    if (!updatedParentComment || !updatedPost) {
      throw new HTTPException(500, { message: "Failed to update comment count" })
    }

    const [comment] = await trx
      .insert(commentsTable)
      .values({
        userId: user.id,
        postId: parentComment.postId,
        depth: parentComment.depth + 1,
        parentCommentId: parentComment.id,
        content,
      })
      .returning({
        id: commentsTable.id,
        userId: commentsTable.userId,
        postId: commentsTable.postId,
        depth: commentsTable.depth,
        parentCommentId: commentsTable.parentCommentId,
        points: commentsTable.points,
        content: commentsTable.content,
        commentCount: commentsTable.commentCount,
        createdAt: commentsTable.createdAt,
      })

    return comment
  })

  return {
    ...comment,
    author: { id: user.id, username: user.username },
    commentUpvotes: [],
    childComments: [],
  } satisfies Comment as Comment
}

export const createCommentForPost = async ({ id: postId, content, user }: CreateCommentOptions) => {
  const comment = await db.transaction(async (trx) => {
    const [updated] = await trx
      .update(postsTable)
      .set({ commentCount: sql`${postsTable.commentCount}+1` })
      .where(eq(postsTable.id, postId))
      .returning({ commentCount: postsTable.commentCount })

    if (!updated) {
      throw new HTTPException(404, { message: "Post not found" })
    }

    const [comment] = await trx
      .insert(commentsTable)
      .values({
        postId: postId,
        userId: user.id,
        content,
      })
      .returning({
        id: commentsTable.id,
        userId: commentsTable.userId,
        postId: commentsTable.postId,
        content: commentsTable.content,
        points: commentsTable.points,
        depth: commentsTable.depth,
        parentCommentId: commentsTable.parentCommentId,
        createdAt: commentsTable.createdAt,
        commentCount: commentsTable.commentCount,
      })

    return comment
  })

  return {
    ...comment,
    author: { username: user.username, id: user.id },
    commentUpvotes: [],
    childComments: [],
  } satisfies Comment as Comment
}

export const getCommentsCountForComment = async ({ id: commentId }: GetCommentsCountOptions) => {
  const [count] = await db
    .select({ count: countDistinct(commentsTable.id) })
    .from(commentsTable)
    .where(eq(commentsTable.parentCommentId, commentId))

  return count
}

export const getCommentsForComment = async ({
  id: commentId,
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

  const [commentExists] = await db
    .select({ exists: sql<boolean>`true` })
    .from(commentsTable)
    .where(eq(commentsTable.id, commentId))
    .limit(1)

  if (!commentExists) {
    throw new HTTPException(404, { message: "Comment not found" })
  }

  const comments = await db.query.comments.findMany({
    where: ({ parentCommentId }, { eq }) => eq(parentCommentId, commentId),
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

type GetCommentOptions = {
  commentId: number
  user?: User | null
  includeChildren?: boolean
}

export const getComment = async ({ commentId, user, includeChildren = false }: GetCommentOptions) => {
  const comment = await db.query.comments.findFirst({
    where: ({ id }, { eq }) => eq(id, commentId),
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
      },
    },
  })

  if (!comment) {
    throw new HTTPException(404, { message: "Comment not found" })
  }

  return comment satisfies Comment
}
