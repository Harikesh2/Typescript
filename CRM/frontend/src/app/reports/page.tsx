'use client'

import { PageLayout, PageHeader, Stack, Text } from '@primer/react'
import { TopBar } from '@/components/crm/top-bar'
import { AppSidebar } from '@/components/crm/app-sidebar'
import { ReportsView } from '@/components/crm/reports'

export default function ReportsPage() {
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
                <PageHeader.Title as="h1">Reports</PageHeader.Title>
              </PageHeader.TitleArea>
              <PageHeader.Description>
                <Text style={{ color: 'var(--fgColor-muted)' }}>
                  Aggregate views of your records across time and states.
                </Text>
              </PageHeader.Description>
            </PageHeader>

            <ReportsView />
          </Stack>
        </PageLayout.Content>
      </PageLayout>
    </div>
  )
}
