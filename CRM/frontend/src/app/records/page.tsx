'use client'

import { PageLayout, PageHeader, Stack, Text } from '@primer/react'
import { TopBar } from '@/components/crm/top-bar'
import { AppSidebar } from '@/components/crm/app-sidebar'
import { RecordsList } from '@/components/crm/records-list'

export default function RecordsPage() {
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
                <PageHeader.Title as="h1">Records</PageHeader.Title>
              </PageHeader.TitleArea>
              <PageHeader.Description>
                <Text style={{ color: 'var(--fgColor-muted)' }}>
                  Search, filter, and manage your CRM records.
                </Text>
              </PageHeader.Description>
            </PageHeader>

            <RecordsList />
          </Stack>
        </PageLayout.Content>
      </PageLayout>
    </div>
  )
}
