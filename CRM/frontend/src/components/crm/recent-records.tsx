'use client'

import { useEffect, useState } from 'react'
import { Stack, Text } from '@primer/react'
import { DataTable, Table } from '@primer/react/experimental'
import type { Record } from '@/lib/types'

type RecentRow = {
  id: string
  name: string
  email: string
  city: string
  state: string
  created: string
}

const dateTime = new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' })

export function RecentRecords() {
  const [records, setRecords] = useState<Record[] | null>(null)

  useEffect(() => {
    fetch('/api/records/?ordering=-created_at')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load records')
        return res.json()
      })
      .then((data: Record[]) => setRecords(data))
      .catch(() => setRecords(null))
  }, [])

  if (!records) {
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
          Loading recent records…
        </Text>
      </div>
    )
  }

  const rows: RecentRow[] = records.slice(0, 5).map((record) => ({
    id: String(record.id),
    name: `${record.first_name} ${record.last_name}`.trim(),
    email: record.email,
    city: record.city,
    state: record.state,
    created: record.created_at
      ? dateTime.format(new Date(record.created_at))
      : '—',
  }))

  return (
    <Table.Container>
      <Stack
        direction="horizontal"
        align="center"
        justify="space-between"
        gap="normal"
      >
        <Table.Title as="h2" id="recent-records">
          Recent records
        </Table.Title>
      </Stack>
      <Table.Subtitle as="p" id="recent-records-subtitle">
        Latest {rows.length} records by creation date
      </Table.Subtitle>
      <DataTable
        aria-labelledby="recent-records"
        aria-describedby="recent-records-subtitle"
        data={rows}
        columns={[
          {
            header: 'Name',
            field: 'name',
            rowHeader: true,
            renderCell: (row: RecentRow) => (
              <Text weight="semibold">{row.name}</Text>
            ),
          },
          {
            header: 'Email',
            field: 'email',
            renderCell: (row: RecentRow) => (
              <Text style={{ color: 'var(--fgColor-muted)' }}>{row.email}</Text>
            ),
          },
          {
            header: 'City',
            field: 'city',
            renderCell: (row: RecentRow) => <Text>{row.city}</Text>,
          },
          {
            header: 'State',
            field: 'state',
            renderCell: (row: RecentRow) => <Text>{row.state}</Text>,
          },
          {
            header: 'Created',
            field: 'created',
            renderCell: (row: RecentRow) => (
              <Text size="small" style={{ color: 'var(--fgColor-muted)' }}>
                {row.created}
              </Text>
            ),
          },
        ]}
      />
    </Table.Container>
  )
}
