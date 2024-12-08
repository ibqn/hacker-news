import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { zodSearchValidator } from '@tanstack/router-zod-adapter'
import { useForm } from '@tanstack/react-form'
import { zodValidator } from '@tanstack/zod-form-adapter'
import { signinSchema } from 'backend/src/validators/signin'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { FormEvent } from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { FieldInfo } from '@/components/field-info'
import { Button } from '@/components/ui/button'
import { useMutation } from '@tanstack/react-query'
import { postSignin } from '@/lib/api'
import { queryClient } from '@/query-client'
import { toast } from 'sonner'
import { ErrorResponse } from 'backend/src/shared/types'
import { AxiosError } from 'axios'
import { searchSchema } from '@/validators/search'

export const Route = createFileRoute('/_auth/signin')({
  component: Signin,
  validateSearch: zodSearchValidator(searchSchema),
})

function Signin() {
  const search = Route.useSearch()
  const navigate = useNavigate()

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    event.stopPropagation()
    form.handleSubmit()
  }

  const form = useForm({
    defaultValues: {
      username: '',
      password: '',
    },
    validatorAdapter: zodValidator(),
    validators: {
      onChange: signinSchema,
    },
    onSubmit: async ({ value }) => {
      signin(value)
    },
  })

  const { mutate: signin } = useMutation({
    mutationFn: postSignin,
    onSuccess: async () => {
      console.log('Signin success')
      await queryClient.invalidateQueries({
        queryKey: ['user'],
      })

      await navigate({ to: search.redirect })
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
      toast.error('Signup failed', { description: message })
    },
  })

  return (
    <div className="flex flex-1 items-center justify-center">
      <Card className="mx-auto max-w-sm grow border-border/25">
        <CardHeader>
          <CardTitle className="text-center">Sign in</CardTitle>
          <CardDescription className="text-center">
            Enter your details below to sign in
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid gap-4">
            <form.Field
              name="username"
              children={(field) => (
                <div className="grid gap-2">
                  <Label htmlFor={field.name}>Username</Label>
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
              name="password"
              children={(field) => (
                <div className="grid gap-2">
                  <Label htmlFor={field.name}>Password</Label>
                  <Input
                    type="password"
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
                  {isSubmitting ? '...' : 'Sign in'}
                </Button>
              )}
            />
          </form>

          <div className="mt-4 text-center text-sm">
            Don't have an account?{' '}
            <Link to="/signup" className="underline">
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
