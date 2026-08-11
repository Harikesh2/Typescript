export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'won' | 'lost'

export type Contact = {
  id: number
  name: string
  email: string
  company: string
  status: LeadStatus
  owner: string
  value: number
  lastActivity: string
}

export const statusMeta: Record<
  LeadStatus,
  {
    label: string
    variant:
      | 'default'
      | 'accent'
      | 'success'
      | 'attention'
      | 'severe'
      | 'danger'
      | 'done'
  }
> = {
  new: { label: 'New', variant: 'accent' },
  contacted: { label: 'Contacted', variant: 'attention' },
  qualified: { label: 'Qualified', variant: 'done' },
  won: { label: 'Won', variant: 'success' },
  lost: { label: 'Lost', variant: 'danger' },
}

export const contacts: Contact[] = [
  {
    id: 1,
    name: 'Amara Okafor',
    email: 'amara@northwind.io',
    company: 'Northwind Labs',
    status: 'qualified',
    owner: 'You',
    value: 42000,
    lastActivity: '2 hours ago',
  },
  {
    id: 2,
    name: 'Diego Marchetti',
    email: 'diego@aerolight.com',
    company: 'Aerolight',
    status: 'new',
    owner: 'Priya Nair',
    value: 12500,
    lastActivity: '5 hours ago',
  },
  {
    id: 3,
    name: 'Sofia Lindqvist',
    email: 'sofia@bergstrom.se',
    company: 'Bergström Group',
    status: 'contacted',
    owner: 'You',
    value: 68000,
    lastActivity: 'Yesterday',
  },
  {
    id: 4,
    name: 'Kenji Watanabe',
    email: 'kenji@tsuki.jp',
    company: 'Tsuki Systems',
    status: 'won',
    owner: 'Marcus Bell',
    value: 96000,
    lastActivity: '2 days ago',
  },
  {
    id: 5,
    name: 'Lena Fischer',
    email: 'lena@helioswind.de',
    company: 'Helios Wind',
    status: 'contacted',
    owner: 'Priya Nair',
    value: 31000,
    lastActivity: '3 days ago',
  },
  {
    id: 6,
    name: 'Tomas Bianchi',
    email: 'tomas@vela.it',
    company: 'Vela Digital',
    status: 'lost',
    owner: 'You',
    value: 8000,
    lastActivity: '4 days ago',
  },
  {
    id: 7,
    name: 'Priya Chandra',
    email: 'priya@lotuspay.in',
    company: 'LotusPay',
    status: 'qualified',
    owner: 'Marcus Bell',
    value: 54500,
    lastActivity: '5 days ago',
  },
  {
    id: 8,
    name: 'Noah Alvarez',
    email: 'noah@brightloop.co',
    company: 'BrightLoop',
    status: 'new',
    owner: 'You',
    value: 22000,
    lastActivity: '1 week ago',
  },
]
