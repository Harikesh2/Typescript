'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Button,
  Flash,
  Stack,
  Text,
  useConfirm,
} from '@primer/react'
import { Blankslate } from '@primer/react/experimental'
import { PencilIcon, TrashIcon } from '@primer/octicons-react'
import type { Record } from '@/lib/types'

type Props = {
  id: string
}

const dateTime = new Intl.DateTimeFormat('en-US', {
  dateStyle: 'medium',
  timeStyle: 'short',
})

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <Text size="small" style={{ color: 'var(--fgColor-muted)' }}>
        {label}
      </Text>
      <Text as="div" weight="semibold">
        {value || '—'}
      </Text>
    </div>
  )
}

export function RecordDetail({ id }: Props) {
  const router = useRouter()
  const confirm = useConfirm()

  const [record, setRecord] = useState<Record | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    let cancelled = false
    fetch(`/api/records/${id}/`)
      .then((res) => {
        if (res.status === 404) throw new Error('not-found')
        if (!res.ok) throw new Error('failed')
        return res.json()
      })
      .then((data: Record) => {
        if (!cancelled) {
          setRecord(data)
          setLoading(false)
        }
      })
      .catch((err: Error) => {
        if (!cancelled) {
          setError(err.message === 'not-found' ? 'not-found' : 'failed')
          setLoading(false)
        }
      })
    return () => {
      cancelled = true
    }
  }, [id])

  async function handleDelete() {
    const ok = await confirm({
      title: 'Delete record',
      content: `Delete ${record?.first_name} ${record?.last_name}? This cannot be undone.`,
      confirmButtonContent: 'Delete',
      confirmButtonType: 'danger',
    })
    if (!ok || !record) return
    setDeleting(true)
    const res = await fetch(`/api/records/${record.id}/`, { method: 'DELETE' })
    if (!res.ok) {
      setDeleting(false)
      setError('failed')
      return
    }
    router.push('/records')
    router.refresh()
  }

  if (loading) {
    return (
      <div
        style={{
          padding: 'var(--base-size-24)',
          border: 'var(--borderWidth-thin) solid var(--borderColor-default)',
          borderRadius: 'var(--borderRadius-large)',
          backgroundColor: 'var(--bgColor-default)',
        }}
      >
        <Text style={{ color: 'var(--fgColor-muted)' }}>
          Loading record…
        </Text>
      </div>
    )
  }

  if (error === 'not-found' || !record) {
    return (
      <Blankslate narrow>
        <Blankslate.Heading>Record not found</Blankslate.Heading>
        <Blankslate.Description>
          This record may have been deleted or the address is incorrect.
        </Blankslate.Description>
        <Blankslate.PrimaryAction>
          <Button variant="primary" onClick={() => router.push('/records')}>
            Back to records
          </Button>
        </Blankslate.PrimaryAction>
      </Blankslate>
    )
  }

  return (
    <Stack direction="vertical" gap="normal">
      {error === 'failed' ? (
        <Flash variant="danger">
          Failed to load this record. Please try again.
        </Flash>
      ) : null}

      <div
        style={{
          padding: 'var(--base-size-24)',
          border: 'var(--borderWidth-thin) solid var(--borderColor-default)',
          borderRadius: 'var(--borderRadius-large)',
          backgroundColor: 'var(--bgColor-default)',
        }}
      >
        <Stack direction="vertical" gap="normal">
          <Stack direction="horizontal" justify="space-between" align="center">
            <Stack direction="vertical" gap="condensed">
              <Text
                as="h2"
                weight="semibold"
                style={{ fontSize: 'var(--text-title-size-large)' }}
              >
                {record.first_name} {record.last_name}
              </Text>
              <Text style={{ color: 'var(--fgColor-muted)' }}>
                Created {dateTime.format(new Date(record.created_at))}
              </Text>
            </Stack>
            <Stack direction="horizontal" gap="condensed">
              <Button
                leadingVisual={PencilIcon}
                onClick={() => router.push(`/records/${record.id}/edit`)}
              >
                Edit
              </Button>
              <Button
                leadingVisual={TrashIcon}
                variant="danger"
                loading={deleting}
                onClick={handleDelete}
              >
                Delete
              </Button>
            </Stack>
          </Stack>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
              gap: 'var(--base-size-16)',
            }}
          >
            <Field label="Email" value={record.email} />
            <Field label="Phone" value={record.phone} />
            <Field label="Address" value={record.address} />
            <Field label="City" value={record.city} />
            <Field label="State" value={record.state} />
            <Field label="Zip code" value={record.zipcode} />
          </div>
        </Stack>
      </div>
    </Stack>
  )
}
