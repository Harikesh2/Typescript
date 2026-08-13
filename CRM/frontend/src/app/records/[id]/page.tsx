'use client'

import { use } from 'react'
import { PageLayout, PageHeader, Stack, Text } from '@primer/react'
import { TopBar } from '@/components/crm/top-bar'
import { AppSidebar } from '@/components/crm/app-sidebar'
import { RecordDetail } from '@/components/crm/record-detail'

export default function RecordDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)

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
                <PageHeader.Title as="h1">Record details</PageHeader.Title>
              </PageHeader.TitleArea>
              <PageHeader.Description>
                <Text style={{ color: 'var(--fgColor-muted)' }}>
                  View and manage a single record.
                </Text>
              </PageHeader.Description>
            </PageHeader>

            <RecordDetail key={id} id={id} />
          </Stack>
        </PageLayout.Content>
      </PageLayout>
    </div>
  )
}
