'use client'

import { PageLayout, PageHeader, Stack, Text } from '@primer/react'
import { TopBar } from '@/components/crm/top-bar'
import { AppSidebar } from '@/components/crm/app-sidebar'
import { StatCards } from '@/components/crm/stat-cards'
import { RecentRecords } from '@/components/crm/recent-records'

export default function DashboardPage() {
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
                <PageHeader.Title as="h1">Dashboard</PageHeader.Title>
              </PageHeader.TitleArea>
              <PageHeader.Description>
                <Text style={{ color: 'var(--fgColor-muted)' }}>
                  Key metrics and your most recent records at a glance.
                </Text>
              </PageHeader.Description>
            </PageHeader>

            <StatCards />
            <RecentRecords />
          </Stack>
        </PageLayout.Content>
      </PageLayout>
    </div>
  )
}
