'use client';

import { useRouter } from 'next/navigation';
import {
  ActionList,
  ActionMenu,
  Avatar,
  IconButton,
  Stack,
  Text,
  TextInput,
} from '@primer/react';
import {
  StackIcon,
  SearchIcon,
  BellIcon,
  SignOutIcon,
  PersonIcon,
  GearIcon,
} from '@primer/octicons-react';

export function TopBar() {
  const router = useRouter();

  async function handleSignOut() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  }

  return (
    <header
      style={{
        borderBottom:
          'var(--borderWidth-thin) solid var(--borderColor-default)',
        backgroundColor: 'var(--bgColor-default)',
        padding: 'var(--base-size-12) var(--base-size-24)',
      }}
    >
      <Stack
        direction="horizontal"
        align="center"
        justify="space-between"
        gap="normal"
      >
        <Stack direction="horizontal" align="center" gap="condensed">
          <div
            aria-hidden="true"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 32,
              height: 32,
              borderRadius: 'var(--borderRadius-medium)',
              backgroundColor: 'var(--bgColor-accent-emphasis)',
              color: 'var(--fgColor-onEmphasis)',
            }}
          >
            <StackIcon size={18} />
          </div>
          <Text size="large" weight="semibold">
            Relay CRM
          </Text>
        </Stack>

        <div style={{ flex: 1, maxWidth: 420 }}>
          <TextInput
            block
            leadingVisual={SearchIcon}
            placeholder="Search contacts, companies…"
            aria-label="Search"
          />
        </div>

        <Stack direction="horizontal" align="center" gap="condensed">
          <IconButton
            icon={BellIcon}
            aria-label="Notifications"
            variant="invisible"
          />
          <ActionMenu>
            <ActionMenu.Anchor>
              <button
                type="button"
                aria-label="Account menu"
                style={{
                  border: 'none',
                  background: 'transparent',
                  padding: 0,
                  cursor: 'pointer',
                  borderRadius: 'var(--borderRadius-full)',
                }}
              >
                <Avatar
                  src="/avatar-professional-headshot.png"
                  size={32}
                  alt="Your account"
                />
              </button>
            </ActionMenu.Anchor>
            <ActionMenu.Overlay align="end">
              <ActionList>
                <ActionList.Item onSelect={() => {}}>
                  <ActionList.LeadingVisual>
                    <PersonIcon />
                  </ActionList.LeadingVisual>
                  Profile
                </ActionList.Item>
                <ActionList.Item onSelect={() => {}}>
                  <ActionList.LeadingVisual>
                    <GearIcon />
                  </ActionList.LeadingVisual>
                  Settings
                </ActionList.Item>
                <ActionList.Divider />
                <ActionList.Item
                  variant="danger"
                  onSelect={handleSignOut}
                >
                  <ActionList.LeadingVisual>
                    <SignOutIcon />
                  </ActionList.LeadingVisual>
                  Sign out
                </ActionList.Item>
              </ActionList>
            </ActionMenu.Overlay>
          </ActionMenu>
        </Stack>
      </Stack>
    </header>
  );
}