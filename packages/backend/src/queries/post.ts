import { db } from "../drizzle/db"
import { userTable, type User } from "../drizzle/schema/auth"
import { postsTable } from "../drizzle/schema/posts"
import { postUpvotesTable } from "../drizzle/schema/upvotes"
import type { PaginationSchema } from "../validators/pagination"
import type { CreatePostSchema } from "../validators/post"
import { and, asc, countDistinct, desc, eq, sql } from "drizzle-orm"

type GetPostsCountOptions = Pick<PaginationSchema, "author" | "site">

export const getPostsCount = async ({ author, site }: GetPostsCountOptions) => {
  const whereClause = and(
    author ? eq(postsTable.userId, author) : undefined,
    site ? eq(postsTable.url, site) : undefined
  )

  const [count] = await db
    .select({ count: countDistinct(postsTable.id) })
    .from(postsTable)
    .where(whereClause)

  return count
}

type GetPostsOptions = PaginationSchema & {
  user?: User | null
}

export const getPosts = async ({ limit, page, sortedBy, order, author, site, user }: GetPostsOptions) => {
  const offset = (page - 1) * limit
  const sortByColumn = sortedBy === "points" ? postsTable.points : postsTable.createdAt
  const sortOrder = order === "desc" ? desc(sortByColumn) : asc(sortByColumn)

  const whereClause = and(
    author ? eq(postsTable.userId, author) : undefined,
    site ? eq(postsTable.url, site) : undefined
  )

  const postsQuery = db
    .select({
      id: postsTable.id,
      title: postsTable.title,
      url: postsTable.url,
      content: postsTable.content,
      points: postsTable.points,
      createdAt: postsTable.createdAt,
      commentCount: postsTable.commentCount,
      author: { id: userTable.id, username: userTable.username },
      isUpvoted: user
        ? sql<boolean>`case when ${postUpvotesTable.userId} is not null then true else false end`
        : sql<boolean>`false`,
    })
    .from(postsTable)
    .leftJoin(userTable, eq(postsTable.userId, userTable.id))
    .orderBy(sortOrder)
    .limit(limit)
    .offset(offset)
    .where(whereClause)

  if (user) {
    postsQuery.leftJoin(
      postUpvotesTable,
      and(eq(postUpvotesTable.userId, user.id), eq(postUpvotesTable.postId, postsTable.id))
    )
  }

  const posts = await postsQuery
  return posts
}

export type Post = Awaited<ReturnType<typeof getPosts>>[number]

type GetPostOptions = {
  postId: number
  user?: User | null
}

export const getPost = async ({ postId, user }: GetPostOptions) => {
  const postQuery = db
    .select({
      id: postsTable.id,
      title: postsTable.title,
      url: postsTable.url,
      content: postsTable.content,
      points: postsTable.points,
      createdAt: postsTable.createdAt,
      commentCount: postsTable.commentCount,
      author: { id: userTable.id, username: userTable.username },
      isUpvoted: user
        ? sql<boolean>`case when ${postUpvotesTable.userId} is not null then true else false end`
        : sql<boolean>`false`,
    })
    .from(postsTable)
    .leftJoin(userTable, eq(postsTable.userId, userTable.id))
    .where(eq(postsTable.id, postId))
    .limit(1)

  if (user) {
    postQuery.leftJoin(
      postUpvotesTable,
      and(eq(postUpvotesTable.userId, user.id), eq(postUpvotesTable.postId, postsTable.id))
    )
  }

  const [post] = await postQuery
  return post
}

type CreatePostOptions = CreatePostSchema & {
  user: User
}

export const createPost = async ({ title, url, content, user }: CreatePostOptions) => {
  const [post] = await db
    .insert(postsTable)
    .values({
      userId: user.id,
      title,
      url,
      content,
    })
    .returning({
      id: postsTable.id,
      title: postsTable.title,
      url: postsTable.url,
      content: postsTable.content,
      createdAt: postsTable.createdAt,
      points: postsTable.points,
      commentCount: postsTable.commentCount,
    })

  return {
    ...post,
    author: { id: user.id, username: user.username },
    isUpvoted: false,
  } satisfies Post as Post
}
