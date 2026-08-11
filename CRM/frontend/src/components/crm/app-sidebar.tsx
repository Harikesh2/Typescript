'use client'

import { useRouter } from 'next/navigation'
import { NavList } from '@primer/react'
import {
  HomeIcon,
  PeopleIcon,
  PlusIcon,
  SignOutIcon,
} from '@primer/octicons-react'

export function AppSidebar() {
  const router = useRouter()

  return (
    <NavList aria-label="Main">
      <NavList.Item href="/dashboard">
        <NavList.LeadingVisual>
          <HomeIcon />
        </NavList.LeadingVisual>
        Dashboard
      </NavList.Item>
      <NavList.Item href="/records">
        <NavList.LeadingVisual>
          <PeopleIcon />
        </NavList.LeadingVisual>
        Records
      </NavList.Item>
      <NavList.Item href="/records/new">
        <NavList.LeadingVisual>
          <PlusIcon />
        </NavList.LeadingVisual>
        Add Record
      </NavList.Item>
      <NavList.Divider />
      <NavList.Item onSelect={() => router.push('/login')}>
        <NavList.LeadingVisual>
          <SignOutIcon />
        </NavList.LeadingVisual>
        Logout
      </NavList.Item>
    </NavList>
  )
}
