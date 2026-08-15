'use client'

import { useEffect, useState } from 'react'
import { Stack, Text } from '@primer/react'
import { DataTable, Table } from '@primer/react/experimental'
import { CalendarIcon, NorthStarIcon, PeopleIcon } from '@primer/octicons-react'

type MonthRow = { id: string; month: string; count: number }
type StateRow = { id: string; state: string; count: number }

type ReportData = {
  total_records: number
  records_per_month: { month: string | null; count: number }[]
  by_state: { state: string; count: number }[]
}

function formatMonth(value: string | null) {
  if (!value) return '—'
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    year: 'numeric',
  }).format(new Date(value))
}

export function ReportsView() {
  const [data, setData] = useState<ReportData | null>(null)

  useEffect(() => {
    fetch('/api/reports/')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load reports')
        return res.json()
      })
      .then(setData)
      .catch(() => setData(null))
  }, [])

  if (!data) {
    return (
      <div className="crm-card">
        <Text style={{ color: 'var(--fgColor-muted)' }}>
          Loading reports…
        </Text>
      </div>
    )
  }

  const monthRows: MonthRow[] = data.records_per_month.map((row, i) => ({
    id: String(i),
    month: formatMonth(row.month),
    count: row.count,
  }))

  const stateRows: StateRow[] = data.by_state.map((row, i) => ({
    id: String(i),
    state: row.state,
    count: row.count,
  }))

  return (
    <Stack direction="vertical" gap="spacious">
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 'var(--base-size-16)',
        }}
      >
        <div
          style={{
            backgroundColor: 'var(--bgColor-default)',
            border: 'var(--borderWidth-thin) solid var(--borderColor-default)',
            borderRadius: 'var(--borderRadius-large)',
            boxShadow: 'var(--shadow-resting-xsmall)',
          }}
        >
          <Stack direction="vertical" gap="condensed" padding="normal">
            <Stack direction="horizontal" align="center" justify="space-between">
              <Text size="small" style={{ color: 'var(--fgColor-muted)' }}>
                Total records
              </Text>
              <span
                aria-hidden="true"
                style={{ color: 'var(--fgColor-muted)', display: 'inline-flex' }}
              >
                <PeopleIcon size={16} />
              </span>
            </Stack>
            <Text weight="semibold" style={{ fontSize: 'var(--text-title-size-large)' }}>
              {data.total_records}
            </Text>
            <Text size="small" style={{ color: 'var(--fgColor-muted)' }}>
              Across all time
            </Text>
          </Stack>
        </div>
        <div
          style={{
            backgroundColor: 'var(--bgColor-default)',
            border: 'var(--borderWidth-thin) solid var(--borderColor-default)',
            borderRadius: 'var(--borderRadius-large)',
            boxShadow: 'var(--shadow-resting-xsmall)',
          }}
        >
          <Stack direction="vertical" gap="condensed" padding="normal">
            <Stack direction="horizontal" align="center" justify="space-between">
              <Text size="small" style={{ color: 'var(--fgColor-muted)' }}>
                Months with records
              </Text>
              <span
                aria-hidden="true"
                style={{ color: 'var(--fgColor-muted)', display: 'inline-flex' }}
              >
                <CalendarIcon size={16} />
              </span>
            </Stack>
            <Text weight="semibold" style={{ fontSize: 'var(--text-title-size-large)' }}>
              {monthRows.length}
            </Text>
            <Text size="small" style={{ color: 'var(--fgColor-muted)' }}>
              {monthRows.length === 0 ? 'No records yet' : 'By created month'}
            </Text>
          </Stack>
        </div>
        <div
          style={{
            backgroundColor: 'var(--bgColor-default)',
            border: 'var(--borderWidth-thin) solid var(--borderColor-default)',
            borderRadius: 'var(--borderRadius-large)',
            boxShadow: 'var(--shadow-resting-xsmall)',
          }}
        >
          <Stack direction="vertical" gap="condensed" padding="normal">
            <Stack direction="horizontal" align="center" justify="space-between">
              <Text size="small" style={{ color: 'var(--fgColor-muted)' }}>
                States
              </Text>
              <span
                aria-hidden="true"
                style={{ color: 'var(--fgColor-muted)', display: 'inline-flex' }}
              >
                <NorthStarIcon size={16} />
              </span>
            </Stack>
            <Text weight="semibold" style={{ fontSize: 'var(--text-title-size-large)' }}>
              {stateRows.length}
            </Text>
            <Text size="small" style={{ color: 'var(--fgColor-muted)' }}>
              Distinct record states
            </Text>
          </Stack>
        </div>
      </div>

      <Table.Container>
        <Stack
          direction="horizontal"
          align="center"
          justify="space-between"
          gap="normal"
        >
          <Table.Title as="h2" id="reports-monthly">
            Records per month
          </Table.Title>
        </Stack>
        <Table.Subtitle as="p" id="reports-monthly-subtitle">
          {monthRows.length} months with records
        </Table.Subtitle>
        <DataTable
          aria-labelledby="reports-monthly"
          aria-describedby="reports-monthly-subtitle"
          data={monthRows}
          columns={[
            {
              header: 'Month',
              field: 'month',
              rowHeader: true,
              renderCell: (row: MonthRow) => <Text>{row.month}</Text>,
            },
            {
              header: 'Records',
              field: 'count',
              renderCell: (row: MonthRow) => (
                <Text weight="semibold">{row.count}</Text>
              ),
            },
          ]}
        />
      </Table.Container>

      <Table.Container>
        <Stack
          direction="horizontal"
          align="center"
          justify="space-between"
          gap="normal"
        >
          <Table.Title as="h2" id="reports-states">
            Records by state
          </Table.Title>
        </Stack>
        <Table.Subtitle as="p" id="reports-states-subtitle">
          {stateRows.length} states with records
        </Table.Subtitle>
        <DataTable
          aria-labelledby="reports-states"
          aria-describedby="reports-states-subtitle"
          data={stateRows}
          columns={[
            {
              header: 'State',
              field: 'state',
              rowHeader: true,
              renderCell: (row: StateRow) => <Text>{row.state}</Text>,
            },
            {
              header: 'Records',
              field: 'count',
              renderCell: (row: StateRow) => (
                <Text weight="semibold">{row.count}</Text>
              ),
            },
          ]}
        />
      </Table.Container>
    </Stack>
  )
}
