'use client'

import { PageLayout, PageHeader, Stack, Text } from '@primer/react'
import { TopBar } from '@/components/crm/top-bar'
import { AppSidebar } from '@/components/crm/app-sidebar'

export function StubPage({
  title,
  description,
}: {
  title: string
  description: string
}) {
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
                <PageHeader.Title as="h1">{title}</PageHeader.Title>
              </PageHeader.TitleArea>
              <PageHeader.Description>
                <Text style={{ color: 'var(--fgColor-muted)' }}>
                  {description}
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
              <Text style={{ color: 'var(--fgColor-muted)' }}>
                Coming in a later phase.
              </Text>
            </div>
          </Stack>
        </PageLayout.Content>
      </PageLayout>
    </div>
  )
}
