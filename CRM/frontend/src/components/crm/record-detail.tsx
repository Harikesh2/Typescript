'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Button,
  Flash,
  Spinner,
  Stack,
  Text,
  useConfirm,
} from '@primer/react'
import { Blankslate } from '@primer/react/experimental'
import {
  PencilIcon,
  StarIcon,
  TrashIcon,
} from '@primer/octicons-react'
import { LeadScoreBadge } from '@/components/crm/lead-score-badge'
import type { Record } from '@/lib/types'

type Props = {
  id: string
}

const POLL_INTERVAL_MS = 3000
const POLL_TIMEOUT_MS = 60_000

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

  const [scoring, setScoring] = useState(false)
  const [shouldPoll, setShouldPoll] = useState(false)
  const [scoreError, setScoreError] = useState<string | null>(null)
  const [showRetry, setShowRetry] = useState(false)

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
          if (data.scoring_status === 'PROCESSING') {
            setShouldPoll(true)
          }
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

  useEffect(() => {
    if (!shouldPoll) return

    let cancelled = false
    let timer: ReturnType<typeof setTimeout> | null = null
    const deadline = Date.now() + POLL_TIMEOUT_MS

    async function poll() {
      try {
        const res = await fetch(`/api/records/${id}/`)
        if (!res.ok) throw new Error('failed')
        const data: Record = await res.json()
        if (cancelled) return
        if (data.ai_score !== null) {
          setRecord(data)
          setShouldPoll(false)
          return
        }
        if (Date.now() >= deadline) {
          setShouldPoll(false)
          setScoreError('Something went wrong. Scoring did not finish in time.')
          setShowRetry(true)
          return
        }
        timer = setTimeout(() => void poll(), POLL_INTERVAL_MS)
      } catch {
        if (cancelled) return
        if (Date.now() >= deadline) {
          setShouldPoll(false)
          setScoreError('Something went wrong. Scoring did not finish in time.')
          setShowRetry(true)
        } else {
          timer = setTimeout(() => void poll(), POLL_INTERVAL_MS)
        }
      }
    }

    void poll()

    return () => {
      cancelled = true
      if (timer) clearTimeout(timer)
    }
  }, [shouldPoll, id])

  async function handleScore() {
    setScoring(true)
    setScoreError(null)
    setShowRetry(false)
    try {
      const res = await fetch(`/api/records/${id}/score-trigger/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{}',
      })
      const data = await res.json().catch(() => null)
      setScoring(false)
      if (res.status === 202) {
        setShouldPoll(true)
        return
      }
      if (res.status === 409) {
        setScoreError(
          data?.detail ?? 'Scoring already in progress.',
        )
      } else if (res.status === 400) {
        setScoreError(
          data?.detail ?? 'No changes detected. Edit the lead to re-score.',
        )
      } else {
        setScoreError(
          data?.detail ?? 'Something went wrong. Please try again.',
        )
      }
    } catch {
      setScoring(false)
      setScoreError('Something went wrong. Please try again.')
    }
  }

  async function handleRetry() {
    setScoring(true)
    setScoreError(null)
    try {
      const res = await fetch(`/api/records/${id}/reset-scoring/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{}',
      })
      if (!res.ok) {
        setScoring(false)
        setScoreError('Failed to reset scoring. Please try again.')
        return
      }
      try {
        const updatedRes = await fetch(`/api/records/${id}/`)
        if (updatedRes.ok) {
          setRecord(await updatedRes.json())
        }
      } catch {
        // reset succeeded; stale record just means the badge/status refresh later
      }
      setScoring(false)
      setShowRetry(false)
      setScoreError(null)
    } catch {
      setScoring(false)
      setScoreError('Failed to reset scoring. Please try again.')
    }
  }

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
      <div className="crm-card">
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

  const waiting = scoring || shouldPoll
  const scoreDisabled = waiting || record.scoring_status === 'PROCESSING'

  return (
    <Stack direction="vertical" gap="normal">
      {error === 'failed' ? (
        <Flash variant="danger">
          Failed to load this record. Please try again.
        </Flash>
      ) : null}

      <div className="crm-card">
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
            <Stack direction="horizontal" gap="condensed" align="center">
              {waiting ? <Spinner size="small" /> : null}
              <Button
                leadingVisual={StarIcon}
                disabled={scoreDisabled}
                onClick={handleScore}
              >
                {waiting ? 'Scoring…' : 'Score Lead'}
              </Button>
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

          {scoreError ? (
            <Flash variant="danger">
              <Stack
                direction="horizontal"
                justify="space-between"
                align="center"
              >
                <Text>{scoreError}</Text>
                {showRetry ? (
                  <Button size="small" loading={scoring} onClick={handleRetry}>
                    Retry
                  </Button>
                ) : null}
              </Stack>
            </Flash>
          ) : null}

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

          <div>
            <Text size="small" style={{ color: 'var(--fgColor-muted)' }}>
              Description
            </Text>
            <Text as="div">{record.description || '—'}</Text>
          </div>

          <div>
            <Text size="small" style={{ color: 'var(--fgColor-muted)' }}>
              AI score
            </Text>
            {record.ai_score !== null ? (
              <div style={{ marginTop: 'var(--base-size-4)' }}>
                <LeadScoreBadge
                  score={record.ai_score}
                  reason={record.ai_reason}
                />
              </div>
            ) : (
              <Text as="div" weight="semibold">
                —
              </Text>
            )}
          </div>
        </Stack>
      </div>
    </Stack>
  )
}