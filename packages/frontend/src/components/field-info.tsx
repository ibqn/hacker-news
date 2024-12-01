import { FieldApi } from '@tanstack/react-form'

type Props = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  field: FieldApi<any, any, any, any>
}

export const FieldInfo = ({ field }: Props) => {
  return (
    <div className="flex flex-wrap">
      {field.state.meta.isTouched && field.state.meta.errors.length ? (
        <p className="text-xs font-medium text-destructive">
          {field.state.meta.errors.join(', ')}
        </p>
      ) : null}
      {field.state.meta.isValidating ? 'Validating...' : null}
    </div>
  )
}
