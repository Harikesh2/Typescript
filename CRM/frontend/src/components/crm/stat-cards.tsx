'use client'

import { Stack, Text } from '@primer/react'
import {
  PeopleIcon,
  PulseIcon,
  CheckCircleIcon,
  GraphIcon,
} from '@primer/octicons-react'
import type { Icon } from '@primer/octicons-react'

type Stat = {
  label: string
  value: string
  caption: string
  icon: Icon
}

const stats: Stat[] = [
  {
    label: 'Total contacts',
    value: '1,284',
    caption: '+48 this week',
    icon: PeopleIcon,
  },
  {
    label: 'Active leads',
    value: '312',
    caption: '86 need follow-up',
    icon: PulseIcon,
  },
  {
    label: 'Qualified',
    value: '74',
    caption: '+12% vs last month',
    icon: CheckCircleIcon,
  },
  {
    label: 'Pipeline value',
    value: '$482k',
    caption: 'Across 96 open deals',
    icon: GraphIcon,
  },
]

export function StatCards() {
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
