import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { PostSearchSchema } from '@/validators/post-search'
import { useNavigate } from '@tanstack/react-router'
import {
  OrderSchema,
  SortedBySchema,
  sortedByValues,
} from 'backend/src/validators/pagination'
import { ArrowUpIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type Props = {
  sortedBy: SortedBySchema
  order: OrderSchema
}

export function SortBar({ sortedBy, order }: Props) {
  const navigate = useNavigate()
  return (
    <div className="mb-4 flex items-center justify-between">
      <Select
        value={sortedBy}
        onValueChange={(sortedBy: SortedBySchema) => {
          navigate({
            to: '.',
            search: (prev: PostSearchSchema) => ({
              ...prev,
              sortedBy,
            }),
          })
        }}
      >
        <SelectTrigger className="w-[180px] bg-background capitalize">
          <SelectValue placeholder="Sorted by" />
        </SelectTrigger>

        <SelectContent defaultValue={sortedByValues[0]}>
          {sortedByValues.map((key, index) => (
            <SelectItem key={index} value={key} className="capitalize">
              {key}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button
        aria-label={`Sort ${order === 'asc' ? 'Ascending' : 'Descending'}`}
        variant="outline"
        size="icon"
        onClick={() => {
          navigate({
            to: '.',
            search: (prev: PostSearchSchema) => ({
              ...prev,
              order: order === 'asc' ? 'desc' : 'asc',
            }),
          })
        }}
      >
        <ArrowUpIcon
          className={cn(
            'size-4 transition-transform duration-300',
            order === 'desc' && 'rotate-180'
          )}
        />
      </Button>
    </div>
  )
}
