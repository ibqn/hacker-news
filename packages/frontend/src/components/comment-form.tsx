import { useForm } from '@tanstack/react-form'
import { zodValidator } from '@tanstack/zod-form-adapter'
import { createCommentSchema } from 'backend/src/validators/comment'
import { Button } from '@/components/ui/button'
import { FieldInfo } from '@/components/field-info'
import { Textarea } from '@/components/ui/textarea'
import { useCreateComment } from '@/hooks/use-create-comment'
import { PostCommentSchema } from '@/validators/post-comment'

type Props = (
  | {
      postId: number
      commentId?: undefined
    }
  | {
      postId?: undefined
      commentId: number
    }
) & { onSubmitted?: () => void }

export function CommentForm({ postId, commentId, onSubmitted }: Props) {
  const commentMutate = useCreateComment()

  const form = useForm({
    defaultValues: {
      content: '',
    },
    validatorAdapter: zodValidator(),
    validators: { onChange: createCommentSchema },
    onSubmit: async ({ value }) => {
      console.log('Submit', value)
      commentMutate.mutate(
        { ...value, postId, commentId } as PostCommentSchema,
        {
          onSuccess: () => {
            form.reset()
            onSubmitted?.()
          },
        }
      )
    },
  })

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        event.stopPropagation()
        form.handleSubmit()
      }}
      className="grid gap-4"
    >
      <form.Field
        name="content"
        children={(field) => (
          <div className="grid gap-2">
            <Textarea
              id={field.name}
              value={field.state.value}
              name={field.name}
              onBlur={field.handleBlur}
              onChange={({ target: { value } }) => field.handleChange(value)}
            />
            <FieldInfo field={field} />
          </div>
        )}
      />

      <form.Subscribe
        selector={(state) => [state.errorMap]}
        children={([errorMap]) =>
          errorMap.onSubmit ? (
            <p className="text-sm font-medium text-destructive">
              {errorMap.onSubmit?.toString()}
            </p>
          ) : null
        }
      />

      <div className="flex justify-end space-x-2">
        <form.Subscribe
          selector={(state) => [state.canSubmit, state.isSubmitting]}
          children={([canSubmit, isSubmitting]) => (
            <Button type="submit" disabled={!canSubmit || isSubmitting}>
              {isSubmitting ? '...' : 'Add Comment'}
            </Button>
          )}
        />
      </div>
    </form>
  )
}
