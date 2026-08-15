'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Stack, Text } from '@primer/react'
import { RecordForm } from '@/components/crm/record-form'
import type { Record, RecordPayload } from '@/lib/types'

type Props = {
  id: string
}

export function EditRecord({ id }: Props) {
  const router = useRouter()
  const [record, setRecord] = useState<Record | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    fetch(`/api/records/${id}/`)
      .then((res) => {
        if (!res.ok) throw new Error('failed')
        return res.json()
      })
      .then((data: Record) => {
        if (!cancelled) {
          setRecord(data)
          setLoading(false)
        }
      })
      .catch(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [id])

  async function handleSubmit(values: RecordPayload) {
    const res = await fetch(`/api/records/${id}/`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    })
    const data = await res.json().catch(() => null)
    if (!res.ok) return data ?? { non_field_errors: 'Failed to save record.' }
    router.push(`/records/${id}`)
    router.refresh()
    return null
  }

  if (loading) {
    return (
      <div className="crm-card">
        <Text style={{ color: 'var(--fgColor-muted)' }}>
          Loading record…
        </Text>
      </div>
    )
  }

  if (!record) {
    return (
      <div className="crm-card">
        <Text style={{ color: 'var(--fgColor-muted)' }}>
          Record not found.
        </Text>
      </div>
    )
  }

  return (
    <Stack direction="vertical" gap="normal">
      <div className="crm-card">
        <RecordForm
          initial={record}
          submitLabel="Save changes"
          onSubmit={handleSubmit}
        />
      </div>
    </Stack>
  )
}
