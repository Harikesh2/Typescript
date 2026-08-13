'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Button,
  Flash,
  IconButton,
  Pagination,
  Select,
  Stack,
  Text,
  TextInput,
  useConfirm,
} from '@primer/react'
import { Blankslate, DataTable, Table } from '@primer/react/experimental'
import {
  PencilIcon,
  PlusIcon,
  SearchIcon,
  TrashIcon,
} from '@primer/octicons-react'
import type { Record, RecordsPage, StatsData } from '@/lib/types'

const PAGE_SIZE = 20

type Row = {
  id: string
  name: string
  email: string
  city: string
  state: string
  created: string
}

type SortSpec = { column: string; field: string; direction: 'ASC' | 'DESC' }

const COLUMN_TO_FIELD: { [field: string]: string } = {
  name: 'first_name',
  email: 'email',
  city: 'city',
  state: 'state',
  created: 'created_at',
}

const INITIAL_SORT: SortSpec = {
  column: 'created',
  field: 'created_at',
  direction: 'DESC',
}

const dateTime = new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' })

function buildUrl(
  search: string,
  state: string,
  sort: SortSpec | null,
  page: number,
): string {
  const params = new URLSearchParams()
  if (search) params.set('search', search)
  if (state) params.set('state', state)
  if (sort) {
    params.set(
      'ordering',
      sort.direction === 'DESC' ? `-${sort.field}` : sort.field,
    )
  }
  if (page > 1) params.set('page', String(page))
  const query = params.toString()
  return query ? `/api/records/?${query}` : '/api/records/'
}

export function RecordsList() {
  const router = useRouter()
  const confirm = useConfirm()

  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [stateFilter, setStateFilter] = useState('')
  const [states, setStates] = useState<string[]>([])
  const [sort, setSort] = useState<SortSpec>(INITIAL_SORT)
  const [page, setPage] = useState(1)
  const [reloadKey, setReloadKey] = useState(0)

  const [data, setData] = useState<RecordsPage | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput.trim())
      setPage(1)
    }, 350)
    return () => clearTimeout(timer)
  }, [searchInput])

  useEffect(() => {
    fetch('/api/stats/')
      .then((res) => (res.ok ? res.json() : null))
      .then((stats: StatsData | null) =>
        setStates(stats?.by_state.map((s) => s.state) ?? []),
      )
      .catch(() => setStates([]))
  }, [])

  useEffect(() => {
    let cancelled = false
    fetch(buildUrl(search, stateFilter, sort, page))
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load records')
        return res.json()
      })
      .then((next: RecordsPage) => {
        if (!cancelled) {
          setData(next)
          setError(null)
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError('Failed to load records. Please try again.')
        }
      })
    return () => {
      cancelled = true
    }
  }, [search, stateFilter, sort, page, reloadKey])

  async function handleDelete(record: Record) {
    const ok = await confirm({
      title: 'Delete record',
      content: `Delete ${record.first_name} ${record.last_name}? This cannot be undone.`,
      confirmButtonContent: 'Delete',
      confirmButtonType: 'danger',
    })
    if (!ok) return
    const res = await fetch(`/api/records/${record.id}/`, { method: 'DELETE' })
    if (!res.ok) {
      setError('Failed to delete record. Please try again.')
      return
    }
    if (data && data.results.length === 1 && page > 1) {
      setPage((current) => current - 1)
    } else {
      setReloadKey((key) => key + 1)
    }
  }

  function handleToggleSort(
    columnId: string | number,
    direction: 'ASC' | 'DESC',
  ) {
    const field = COLUMN_TO_FIELD[String(columnId)]
    if (!field) return
    setSort({ column: String(columnId), field, direction })
    setPage(1)
  }

  const rows: Row[] =
    data?.results.map((record) => ({
      id: String(record.id),
      name: `${record.first_name} ${record.last_name}`.trim(),
      email: record.email,
      city: record.city,
      state: record.state,
      created: record.created_at
        ? dateTime.format(new Date(record.created_at))
        : '—',
    })) ?? []

  const pageCount = data ? Math.ceil(data.count / PAGE_SIZE) : 0

  return (
    <Stack direction="vertical" gap="normal">
      <Stack direction="horizontal" justify="space-between" gap="normal">
        <Stack direction="horizontal" gap="normal" align="center">
          <TextInput
            aria-label="Search records"
            placeholder="Search name or email"
            leadingVisual={SearchIcon}
            block
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
          <Select
            aria-label="Filter by state"
            value={stateFilter}
            onChange={(e) => {
              setStateFilter(e.target.value)
              setPage(1)
            }}
          >
            <Select.Option value="">All states</Select.Option>
            {states.map((state) => (
              <Select.Option key={state} value={state}>
                {state}
              </Select.Option>
            ))}
          </Select>
        </Stack>
        <Button
          leadingVisual={PlusIcon}
          variant="primary"
          onClick={() => router.push('/records/new')}
        >
          Add record
        </Button>
      </Stack>

      {error ? <Flash variant="danger">{error}</Flash> : null}

      <Table.Container>
        <Stack
          direction="horizontal"
          align="center"
          justify="space-between"
          gap="normal"
        >
          <Table.Title as="h2" id="records-table">
            Records
          </Table.Title>
        </Stack>
        <Table.Subtitle as="p" id="records-table-subtitle">
          {data
            ? `${data.count} record${data.count === 1 ? '' : 's'} found`
            : error
              ? 'No records'
              : 'Loading records…'}
        </Table.Subtitle>

        {!data && !error ? (
          <div
            style={{
              padding: 'var(--base-size-32)',
              textAlign: 'center',
            }}
          >
            <Text style={{ color: 'var(--fgColor-muted)' }}>
              Loading records…
            </Text>
          </div>
        ) : rows.length === 0 ? (
          <Blankslate narrow>
            <Blankslate.Heading>No records found</Blankslate.Heading>
            <Blankslate.Description>
              {search || stateFilter
                ? 'Try adjusting your search or filters.'
                : 'Create your first record to get started.'}
            </Blankslate.Description>
          </Blankslate>
        ) : (
          <DataTable
            key={`${sort.column}-${sort.direction}`}
            aria-labelledby="records-table"
            aria-describedby="records-table-subtitle"
            externalSorting
            initialSortColumn={sort.column}
            initialSortDirection={sort.direction}
            onToggleSort={handleToggleSort}
            data={rows}
            columns={[
              {
                header: 'Name',
                field: 'name',
                rowHeader: true,
                sortBy: true,
                renderCell: (row: Row) => (
                  <Link href={`/records/${row.id}`}>
                    <Text weight="semibold">{row.name}</Text>
                  </Link>
                ),
              },
              {
                header: 'Email',
                field: 'email',
                sortBy: true,
                renderCell: (row: Row) => (
                  <Text style={{ color: 'var(--fgColor-muted)' }}>
                    {row.email}
                  </Text>
                ),
              },
              {
                header: 'City',
                field: 'city',
                sortBy: true,
                renderCell: (row: Row) => <Text>{row.city}</Text>,
              },
              {
                header: 'State',
                field: 'state',
                sortBy: true,
                renderCell: (row: Row) => <Text>{row.state}</Text>,
              },
              {
                header: 'Created',
                field: 'created',
                sortBy: true,
                renderCell: (row: Row) => (
                  <Text size="small" style={{ color: 'var(--fgColor-muted)' }}>
                    {row.created}
                  </Text>
                ),
              },
              {
                header: 'Actions',
                renderCell: (row: Row) => (
                  <Stack direction="horizontal" gap="condensed">
                    <IconButton
                      aria-label={`Edit ${row.name}`}
                      icon={PencilIcon}
                      variant="invisible"
                      onClick={() => router.push(`/records/${row.id}/edit`)}
                    />
                    <IconButton
                      aria-label={`Delete ${row.name}`}
                      icon={TrashIcon}
                      variant="invisible"
                      onClick={() => {
                        const record = data?.results.find(
                          (r) => String(r.id) === row.id,
                        )
                        if (record) handleDelete(record)
                      }}
                    />
                  </Stack>
                ),
              },
            ]}
          />
        )}

        {data && pageCount > 1 ? (
          <Stack
            direction="horizontal"
            align="center"
            justify="center"
            padding="normal"
          >
            <Pagination
              pageCount={pageCount}
              currentPage={page}
              onPageChange={(e, n) => {
                e.preventDefault()
                setPage(n)
              }}
              showPages={pageCount <= 7}
            />
          </Stack>
        ) : null}
      </Table.Container>
    </Stack>
  )
}
