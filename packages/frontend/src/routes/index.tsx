import { PostCard } from '@/components/post-card'
import { SortBar } from '@/components/sort-bar'
import { postsInfiniteQueryOptions } from '@/lib/api'
import { postSearchSchema } from '@/validators/post-search'
import { useSuspenseInfiniteQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { zodSearchValidator } from '@tanstack/router-zod-adapter'

export const Route = createFileRoute('/')({
  component: Index,
  validateSearch: zodSearchValidator(postSearchSchema),
})

function Index() {
  const searchParams = Route.useSearch()

  const { data, isFetchingNextPage, fetchNextPage, hasNextPage } =
    useSuspenseInfiniteQuery(postsInfiniteQueryOptions(searchParams))

  return (
    <div className="mx-auto flex max-w-3xl grow flex-col p-4">
      <h1 className="mb-6 text-2xl font-bold text-foreground">Submissions</h1>
      <SortBar sortedBy={searchParams.sortedBy} order={searchParams.order} />

      <div className="space-y-4">
        {data.pages.map((page) =>
          page.posts.map((post) => <PostCard key={post.id} post={post} />)
        )}
      </div>
    </div>
  )
}
