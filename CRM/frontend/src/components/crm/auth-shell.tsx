'use client';

import { Stack } from '@primer/react';
import { ReactNode } from 'react';

interface AuthShellProps {
  children: ReactNode;
}

export function AuthShell({ children }: AuthShellProps) {
  return (
    <main
      style={{
        minHeight: '100dvh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--base-size-24)',
        position: 'relative',
        backgroundColor: 'var(--bgColor-inset)',
        overflow: 'hidden',
      }}
    >
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse 80% 60% at 50% 0%, var(--bgColor-accent-muted) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />
      <Stack direction="vertical" gap="spacious" align="center" style={{ width: '100%', maxWidth: 400, position: 'relative', zIndex: 1 }}>
        {children}
      </Stack>
    </main>
  );
}