'use client'

import { useRouter } from 'next/navigation'
import { PageLayout, PageHeader, Stack, Text } from '@primer/react'
import { TopBar } from '@/components/crm/top-bar'
import { AppSidebar } from '@/components/crm/app-sidebar'
import { RecordForm } from '@/components/crm/record-form'
import type { Record, RecordPayload } from '@/lib/types'

export default function AddRecordPage() {
  const router = useRouter()

  async function handleSubmit(values: RecordPayload) {
    const res = await fetch('/api/records/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    })
    const data = await res.json().catch(() => null)
    if (!res.ok) return data ?? { non_field_errors: 'Failed to create record.' }
    const record = data as Record
    router.push(`/records/${record.id}`)
    router.refresh()
    return null
  }

  return (
    <div style={{ minHeight: '100dvh', backgroundColor: 'var(--bgColor-inset)' }}>
      <TopBar />
      <PageLayout containerWidth="full" padding="normal">
        <PageLayout.Pane position="start" width="small" sticky>
          <AppSidebar />
        </PageLayout.Pane>
        <PageLayout.Content>
          <Stack direction="vertical" gap="spacious">
            <PageHeader role="banner">
              <PageHeader.TitleArea>
                <PageHeader.Title as="h1">Add record</PageHeader.Title>
              </PageHeader.TitleArea>
              <PageHeader.Description>
                <Text style={{ color: 'var(--fgColor-muted)' }}>
                  Create a new CRM record.
                </Text>
              </PageHeader.Description>
            </PageHeader>

            <div
              style={{
                padding: 'var(--base-size-24)',
                border: 'var(--borderWidth-thin) solid var(--borderColor-default)',
                borderRadius: 'var(--borderRadius-large)',
                backgroundColor: 'var(--bgColor-default)',
              }}
            >
              <RecordForm
                submitLabel="Create record"
                onSubmit={handleSubmit}
              />
            </div>
          </Stack>
        </PageLayout.Content>
      </PageLayout>
    </div>
  )
}
