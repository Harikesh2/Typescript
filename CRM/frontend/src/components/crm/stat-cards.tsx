'use client'

import { useEffect, useState } from 'react'
import { Stack, Text } from '@primer/react'
import {
  PeopleIcon,
  PulseIcon,
  CheckCircleIcon,
  GraphIcon,
} from '@primer/octicons-react'
import type { Icon } from '@primer/octicons-react'
import type { StatsData } from '@/lib/types'

type Stat = {
  label: string
  value: string
  caption: string
  icon: Icon
}

const numberFormat = new Intl.NumberFormat('en-US')

function buildStats(data: StatsData | null): Stat[] {
  const topState = data?.by_state?.[0]
  return [
    {
      label: 'Total records',
      value: data ? numberFormat.format(data.total_records) : '…',
      caption: data ? 'Across all time' : 'Loading…',
      icon: PeopleIcon,
    },
    {
      label: 'This week',
      value: data ? numberFormat.format(data.records_this_week) : '…',
      caption: data ? 'Created since Monday (UTC)' : 'Loading…',
      icon: PulseIcon,
    },
    {
      label: 'This month',
      value: data ? numberFormat.format(data.records_this_month) : '…',
      caption: data ? 'Created this calendar month' : 'Loading…',
      icon: CheckCircleIcon,
    },
    {
      label: 'Top state',
      value: data ? (topState ? topState.state : '—') : '…',
      caption: data
        ? topState
          ? `${numberFormat.format(topState.count)} records`
          : 'No records yet'
        : 'Loading…',
      icon: GraphIcon,
    },
  ]
}

export function StatCards() {
  const [data, setData] = useState<StatsData | null>(null)

  useEffect(() => {
    fetch('/api/stats/')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load stats')
        return res.json()
      })
      .then(setData)
      .catch(() => setData(null))
  }, [])

  const stats = buildStats(data)

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 'var(--base-size-16)',
      }}
    >
      {stats.map((stat) => (
        <div
          key={stat.label}
          style={{
            backgroundColor: 'var(--bgColor-default)',
            border:
              'var(--borderWidth-thin) solid var(--borderColor-default)',
            borderRadius: 'var(--borderRadius-large)',
            boxShadow: 'var(--shadow-resting-xsmall)',
          }}
        >
          <Stack direction="vertical" gap="condensed" padding="normal">
            <Stack
              direction="horizontal"
              align="center"
              justify="space-between"
            >
              <Text size="small" style={{ color: 'var(--fgColor-muted)' }}>
                {stat.label}
              </Text>
              <span
                aria-hidden="true"
                style={{ color: 'var(--fgColor-muted)', display: 'inline-flex' }}
              >
                <stat.icon size={16} />
              </span>
            </Stack>
            <Text
              weight="semibold"
              style={{ fontSize: 'var(--text-title-size-large)' }}
            >
              {stat.value}
            </Text>
            <Text size="small" style={{ color: 'var(--fgColor-muted)' }}>
              {stat.caption}
            </Text>
          </Stack>
        </div>
      ))}
    </div>
  )
}
