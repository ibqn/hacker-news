import { FieldInfo } from '@/components/field-info'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { postSubmit } from '@/lib/api'
import { queryClient } from '@/query-client'
import { useForm } from '@tanstack/react-form'
import { useMutation } from '@tanstack/react-query'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { zodValidator } from '@tanstack/zod-form-adapter'
import { AxiosError } from 'axios'
import { ErrorResponse } from 'backend/src/shared/types'
import { createPostSchema } from 'backend/src/validators/post'
import { toast } from 'sonner'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'

export const Route = createFileRoute('/_protected/submit')({
  component: Submit,
})

function Submit() {
  const navigate = useNavigate()
  const { mutate: submitPost } = useMutation({
    mutationFn: postSubmit,
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: ['posts'] })

      await navigate({ to: `post/id` })
    },
    onError: (error) => {
      let message = 'Signin failed'

      if (error instanceof AxiosError) {
        const response = error.response?.data as ErrorResponse
        message = response.error
      }

      form.setErrorMap({
        onSubmit: message,
      })
      toast.error('Submit failed', { description: message })
    },
  })

  const form = useForm({
    defaultValues: {
      title: '',
      content: '',
      url: '',
    },
    validatorAdapter: zodValidator(),
    validators: {
      onChange: createPostSchema,
    },
    onSubmit: async ({ value }) => {
      console.log('Submit', value)
      submitPost(value)
    },
  })

  return (
    <div className="w-full">
      <Card className="mx-auto mt-12 max-w-lg border-border/25">
        <CardHeader>
          <CardTitle>Create New Post</CardTitle>
          <CardDescription>
            Leave url blank to submit a question for discussion. If there is no
            url, text will appear at the top of the thread. If there is a url,
            text is optional.
          </CardDescription>
        </CardHeader>

        <form
          onSubmit={(event) => {
            event.preventDefault()
            event.stopPropagation()
            form.handleSubmit()
          }}
          className="grid gap-4"
        >
          <CardContent>
            <div className="grid gap-4">
              <form.Field
                name="title"
                children={(field) => (
                  <div className="grid gap-2">
                    <Label htmlFor={field.name}>Title</Label>
                    <Input
                      id={field.name}
                      value={field.state.value}
                      name={field.name}
                      onBlur={field.handleBlur}
                      onChange={({ target: { value } }) =>
                        field.handleChange(value)
                      }
                    />
                    <FieldInfo field={field} />
                  </div>
                )}
              />

              <form.Field
                name="url"
                children={(field) => (
                  <div className="grid gap-2">
                    <Label htmlFor={field.name}>URL</Label>
                    <Input
                      id={field.name}
                      value={field.state.value}
                      name={field.name}
                      onBlur={field.handleBlur}
                      onChange={({ target: { value } }) =>
                        field.handleChange(value)
                      }
                    />
                    <FieldInfo field={field} />
                  </div>
                )}
              />

              <form.Field
                name="content"
                children={(field) => (
                  <div className="grid gap-2">
                    <Label htmlFor={field.name}>Content</Label>
                    <Textarea
                      id={field.name}
                      value={field.state.value}
                      name={field.name}
                      onBlur={field.handleBlur}
                      onChange={({ target: { value } }) =>
                        field.handleChange(value)
                      }
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

              <form.Subscribe
                selector={(state) => [state.canSubmit, state.isSubmitting]}
                children={([canSubmit, isSubmitting]) => (
                  <Button
                    type="submit"
                    disabled={!canSubmit || isSubmitting}
                    className="w-full"
                  >
                    {isSubmitting ? '...' : 'Create Post'}
                  </Button>
                )}
              />
            </div>
          </CardContent>
        </form>
      </Card>
    </div>
  )
}
