import type { AnyFieldApi } from '@tanstack/react-form'

type Props = {
  field: AnyFieldApi
}

export const FieldInfo = ({ field }: Props) => {
  return (
    <div className="flex flex-wrap">
      {field.state.meta.isTouched && field.state.meta.errors.length ? (
        <p className="text-destructive text-xs font-medium">
          {field.state.meta.errors.map((error) => error.message).join(', ')}
        </p>
      ) : null}
      {field.state.meta.isValidating ? 'Validating...' : null}
    </div>
  )
}
