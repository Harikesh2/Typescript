'use client'

import { useMemo, useState } from 'react'
import {
  ActionList,
  ActionMenu,
  Avatar,
  Button,
  IconButton,
  Label,
  Stack,
  Text,
  TextInput,
} from '@primer/react'
import { DataTable, Table } from '@primer/react/experimental'
import {
  SearchIcon,
  PlusIcon,
  FilterIcon,
  KebabHorizontalIcon,
} from '@primer/octicons-react'
import { contacts, statusMeta, type Contact } from '@/lib/contacts'

const currency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
})

function initials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

export function ContactsTable() {
  const [query, setQuery] = useState('')

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return contacts
    return contacts.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.company.toLowerCase().includes(q),
    )
  }, [query])

  return (
    <Table.Container>
      <Stack
        direction="horizontal"
        align="center"
        justify="space-between"
        gap="normal"
        wrap="wrap"
      >
        <Table.Title as="h2" id="contacts-table">
          Contacts &amp; leads
        </Table.Title>
        <Stack direction="horizontal" align="center" gap="condensed" wrap="wrap">
          <TextInput
            leadingVisual={SearchIcon}
            placeholder="Filter contacts…"
            aria-label="Filter contacts"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <Button leadingVisual={FilterIcon}>Filter</Button>
          <Button variant="primary" leadingVisual={PlusIcon}>
            Add contact
          </Button>
        </Stack>
      </Stack>
      <Table.Subtitle as="p" id="contacts-table-subtitle">
        {rows.length} of {contacts.length} contacts
      </Table.Subtitle>

      <DataTable
        aria-labelledby="contacts-table"
        aria-describedby="contacts-table-subtitle"
        data={rows}
        columns={[
          {
            header: 'Name',
            field: 'name',
            rowHeader: true,
            renderCell: (row: Contact) => (
              <Stack direction="horizontal" align="center" gap="condensed">
                <Avatar
                  src={`/placeholder.svg?height=32&width=32&query=${initials(
                    row.name,
                  )}`}
                  size={28}
                  alt=""
                />
                <Stack direction="vertical" gap="none">
                  <Text weight="semibold">{row.name}</Text>
                  <Text size="small" style={{ color: 'var(--fgColor-muted)' }}>
                    {row.email}
                  </Text>
                </Stack>
              </Stack>
            ),
          },
          {
            header: 'Company',
            field: 'company',
            renderCell: (row: Contact) => <Text>{row.company}</Text>,
          },
          {
            header: 'Status',
            field: 'status',
            renderCell: (row: Contact) => (
              <Label variant={statusMeta[row.status].variant}>
                {statusMeta[row.status].label}
              </Label>
            ),
          },
          {
            header: 'Owner',
            field: 'owner',
            renderCell: (row: Contact) => (
              <Text style={{ color: 'var(--fgColor-muted)' }}>{row.owner}</Text>
            ),
          },
          {
            header: 'Value',
            field: 'value',
            renderCell: (row: Contact) => (
              <Text weight="semibold">{currency.format(row.value)}</Text>
            ),
          },
          {
            header: 'Last activity',
            field: 'lastActivity',
            renderCell: (row: Contact) => (
              <Text size="small" style={{ color: 'var(--fgColor-muted)' }}>
                {row.lastActivity}
              </Text>
            ),
          },
          {
            id: 'actions',
            header: '',
            renderCell: (row: Contact) => (
              <ActionMenu>
                <ActionMenu.Anchor>
                  <IconButton
                    icon={KebabHorizontalIcon}
                    aria-label={`Actions for ${row.name}`}
                    variant="invisible"
                    size="small"
                  />
                </ActionMenu.Anchor>
                <ActionMenu.Overlay align="end">
                  <ActionList>
                    <ActionList.Item onSelect={() => {}}>
                      View contact
                    </ActionList.Item>
                    <ActionList.Item onSelect={() => {}}>
                      Edit
                    </ActionList.Item>
                    <ActionList.Item onSelect={() => {}}>
                      Log activity
                    </ActionList.Item>
                    <ActionList.Divider />
                    <ActionList.Item variant="danger" onSelect={() => {}}>
                      Delete
                    </ActionList.Item>
                  </ActionList>
                </ActionMenu.Overlay>
              </ActionMenu>
            ),
          },
        ]}
      />
    </Table.Container>
  )
}
