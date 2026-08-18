export type ScoringStatus = 'IDLE' | 'PROCESSING'

export type Record = {
  id: number
  created_at: string
  first_name: string
  last_name: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  zipcode: string
  description: string | null
  ai_score: number | null
  ai_reason: string | null
  ai_scored_at: string | null
  scoring_status: ScoringStatus
  updated_at: string
}

export type RecordsPage = {
  count: number
  next: string | null
  previous: string | null
  results: Record[]
}

export type RecordPayload = Omit<
  Record,
  | 'id'
  | 'created_at'
  | 'updated_at'
  | 'ai_score'
  | 'ai_reason'
  | 'ai_scored_at'
  | 'scoring_status'
> & { description: string }

export type StatsData = {
  total_records: number
  records_this_week: number
  records_this_month: number
  distinct_states: number
  by_state: { state: string; count: number }[]
  newest_record: Record | null
}
