'use client'

import { useState } from 'react'
import { Button, FormControl, Stack, TextInput, Textarea } from '@primer/react'
import type { Record, RecordPayload } from '@/lib/types'

type FormErrors = Partial<{ [K in keyof RecordPayload]: string }> & {
  non_field_errors?: string
}

type Props = {
  initial?: Record
  submitLabel: string
  onSubmit: (values: RecordPayload) => Promise<FormErrors | null>
}

const EMPTY_VALUES: RecordPayload = {
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  state: '',
  zipcode: '',
  description: '',
}

const OPTIONAL_FIELDS: (keyof RecordPayload)[] = ['description']

function fieldError(
  errors: FormErrors,
  field: keyof RecordPayload,
): string | undefined {
  const value = errors[field]
  return typeof value === 'string' ? value : undefined
}

export function RecordForm({ initial, submitLabel, onSubmit }: Props) {
  const [values, setValues] = useState<RecordPayload>(() =>
    initial
      ? {
          first_name: initial.first_name,
          last_name: initial.last_name,
          email: initial.email,
          phone: initial.phone,
          address: initial.address,
          city: initial.city,
          state: initial.state,
          zipcode: initial.zipcode,
          description: initial.description ?? '',
        }
      : EMPTY_VALUES,
  )
  const [errors, setErrors] = useState<FormErrors>({})
  const [submitting, setSubmitting] = useState(false)

  function setValue(field: keyof RecordPayload, value: string) {
    setValues((current) => ({ ...current, [field]: value }))
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const nextErrors: FormErrors = {}
    const trimmed: RecordPayload = { ...values }
    const fields = Object.keys(trimmed) as (keyof RecordPayload)[]

    fields.forEach((field) => {
      trimmed[field] = trimmed[field].trim()
    })

    fields.forEach((field) => {
      if (!OPTIONAL_FIELDS.includes(field) && !trimmed[field]) {
        nextErrors[field] = 'This field is required'
      }
    })

    if (trimmed.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed.email)) {
      nextErrors.email = 'Enter a valid email address'
    }

    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    setSubmitting(true)
    try {
      const serverErrors = await onSubmit(trimmed)
      if (serverErrors) {
        setErrors(serverErrors)
        setSubmitting(false)
      }
    } catch {
      setErrors({ non_field_errors: 'Something went wrong. Please try again.' })
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <Stack direction="vertical" gap="normal">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
            gap: 'var(--base-size-16)',
          }}
        >
          <FormControl>
            <FormControl.Label>First name</FormControl.Label>
            <TextInput
              name="first_name"
              block
              value={values.first_name}
              onChange={(e) => setValue('first_name', e.target.value)}
              validationStatus={
                fieldError(errors, 'first_name') ? 'error' : undefined
              }
            />
            {fieldError(errors, 'first_name') ? (
              <FormControl.Validation variant="error">
                {fieldError(errors, 'first_name')}
              </FormControl.Validation>
            ) : null}
          </FormControl>

          <FormControl>
            <FormControl.Label>Last name</FormControl.Label>
            <TextInput
              name="last_name"
              block
              value={values.last_name}
              onChange={(e) => setValue('last_name', e.target.value)}
              validationStatus={
                fieldError(errors, 'last_name') ? 'error' : undefined
              }
            />
            {fieldError(errors, 'last_name') ? (
              <FormControl.Validation variant="error">
                {fieldError(errors, 'last_name')}
              </FormControl.Validation>
            ) : null}
          </FormControl>

          <FormControl>
            <FormControl.Label>Email</FormControl.Label>
            <TextInput
              name="email"
              type="email"
              block
              value={values.email}
              onChange={(e) => setValue('email', e.target.value)}
              validationStatus={fieldError(errors, 'email') ? 'error' : undefined}
            />
            {fieldError(errors, 'email') ? (
              <FormControl.Validation variant="error">
                {fieldError(errors, 'email')}
              </FormControl.Validation>
            ) : null}
          </FormControl>

          <FormControl>
            <FormControl.Label>Phone</FormControl.Label>
            <TextInput
              name="phone"
              block
              value={values.phone}
              onChange={(e) => setValue('phone', e.target.value)}
              validationStatus={fieldError(errors, 'phone') ? 'error' : undefined}
            />
            {fieldError(errors, 'phone') ? (
              <FormControl.Validation variant="error">
                {fieldError(errors, 'phone')}
              </FormControl.Validation>
            ) : null}
          </FormControl>

          <FormControl>
            <FormControl.Label>Address</FormControl.Label>
            <TextInput
              name="address"
              block
              value={values.address}
              onChange={(e) => setValue('address', e.target.value)}
              validationStatus={
                fieldError(errors, 'address') ? 'error' : undefined
              }
            />
            {fieldError(errors, 'address') ? (
              <FormControl.Validation variant="error">
                {fieldError(errors, 'address')}
              </FormControl.Validation>
            ) : null}
          </FormControl>

          <FormControl>
            <FormControl.Label>City</FormControl.Label>
            <TextInput
              name="city"
              block
              value={values.city}
              onChange={(e) => setValue('city', e.target.value)}
              validationStatus={fieldError(errors, 'city') ? 'error' : undefined}
            />
            {fieldError(errors, 'city') ? (
              <FormControl.Validation variant="error">
                {fieldError(errors, 'city')}
              </FormControl.Validation>
            ) : null}
          </FormControl>

          <FormControl>
            <FormControl.Label>State</FormControl.Label>
            <TextInput
              name="state"
              block
              value={values.state}
              onChange={(e) => setValue('state', e.target.value)}
              validationStatus={fieldError(errors, 'state') ? 'error' : undefined}
            />
            {fieldError(errors, 'state') ? (
              <FormControl.Validation variant="error">
                {fieldError(errors, 'state')}
              </FormControl.Validation>
            ) : null}
          </FormControl>

          <FormControl>
            <FormControl.Label>Zip code</FormControl.Label>
            <TextInput
              name="zipcode"
              block
              value={values.zipcode}
              onChange={(e) => setValue('zipcode', e.target.value)}
              validationStatus={
                fieldError(errors, 'zipcode') ? 'error' : undefined
              }
            />
            {fieldError(errors, 'zipcode') ? (
              <FormControl.Validation variant="error">
                {fieldError(errors, 'zipcode')}
              </FormControl.Validation>
            ) : null}
          </FormControl>
        </div>

        <FormControl>
          <FormControl.Label>Description</FormControl.Label>
          <FormControl.Caption>
            Optional context used by the AI lead scoring prompt.
          </FormControl.Caption>
          <Textarea
            name="description"
            block
            resize="vertical"
            value={values.description}
            onChange={(e) => setValue('description', e.target.value)}
            validationStatus={
              fieldError(errors, 'description') ? 'error' : undefined
            }
          />
          {fieldError(errors, 'description') ? (
            <FormControl.Validation variant="error">
              {fieldError(errors, 'description')}
            </FormControl.Validation>
          ) : null}
        </FormControl>

        {errors.non_field_errors ? (
          <FormControl.Validation variant="error">
            {errors.non_field_errors}
          </FormControl.Validation>
        ) : null}

        <Stack direction="horizontal" gap="normal">
          <Button
            type="submit"
            variant="primary"
            loading={submitting}
            loadingAnnouncement="Saving…"
          >
            {submitLabel}
          </Button>
        </Stack>
      </Stack>
    </form>
  )
}
