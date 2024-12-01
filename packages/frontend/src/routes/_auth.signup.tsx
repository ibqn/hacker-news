import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { z } from 'zod'
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
import { postSignup } from '@/lib/api'
import { toast } from 'sonner'
import { useMutation } from '@tanstack/react-query'
import { queryClient } from '@/query-client'
import { AxiosError } from 'axios'
import { ErrorResponse } from 'backend/src/shared/types'
import { searchSchema } from '@/validators/search'

const signupSchema = signinSchema
  .merge(
    z.object({
      confirm: z.string(),
    })
  )
  .refine((data) => data.password === data.confirm, {
    message: 'Passwords do not match',
    path: ['confirm'],
  })

export const Route = createFileRoute('/_auth/signup')({
  component: Signup,
  validateSearch: zodSearchValidator(searchSchema),
})

function Signup() {
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
      confirm: '',
    },
    validatorAdapter: zodValidator(),
    validators: {
      onChange: signupSchema,
    },
    onSubmit: async ({ value }) => {
      const { username, password } = value
      console.log('submit', value)
      signup({ username, password })
    },
  })

  const { mutate: signup } = useMutation({
    mutationFn: postSignup,
    onSuccess: async () => {
      console.log('Signin success')
      await queryClient.invalidateQueries({
        queryKey: ['user'],
      })

      await navigate({ to: search.redirect })
    },
    onError: (error) => {
      let message = 'Signup failed'

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
          <CardTitle className="text-center">Sign up</CardTitle>
          <CardDescription className="text-center">
            Enter your details below to create an account
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

            <form.Field
              name="confirm"
              children={(field) => (
                <div className="grid gap-2">
                  <Label htmlFor={field.name}>Confirm password</Label>
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
                  {isSubmitting ? '...' : 'Sign up'}
                </Button>
              )}
            />
          </form>

          <div className="mt-4 text-center text-sm">
            Already have an account?{' '}
            <Link to="/signin" className="underline">
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
