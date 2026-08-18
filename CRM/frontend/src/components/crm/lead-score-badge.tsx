'use client'

import { Label, Stack, Text } from '@primer/react'
import type { LabelColorOptions } from '@primer/react'

type Props = {
  score: number | null
  reason: string | null
}

function scoreTone(score: number): LabelColorOptions {
  if (score <= 3) return 'danger'
  if (score <= 6) return 'attention'
  return 'success'
}

export function LeadScoreBadge({ score, reason }: Props) {
  if (score === null) return null

  return (
    <Stack direction="horizontal" gap="condensed" align="center">
      <Label variant={scoreTone(score)}>{score} / 10</Label>
      {reason ? (
        <Text size="small" style={{ color: 'var(--fgColor-muted)' }}>
          {reason}
        </Text>
      ) : null}
    </Stack>
  )
}