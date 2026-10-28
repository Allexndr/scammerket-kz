import { createClient, SupabaseClient } from '@supabase/supabase-js'

let _client: SupabaseClient | null = null

function getClient(): SupabaseClient {
  if (_client) return _client

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase environment variables. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local')
  }

  _client = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
  return _client
}

// Server-side client with service role (bypasses RLS) — lazy proxy
export const supabaseAdmin = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    const client = getClient()
    const value = (client as any)[prop]
    return typeof value === 'function' ? value.bind(client) : value
  },
})

// Server-side client with anon key (for queries that respect RLS)
export function getSupabase() {
  return supabaseAdmin
}

// Type helpers for database tables
export interface DbUser {
  id: string
  email: string | null
  name: string | null
  image: string | null
  rank: string
  points: number
  reports_count: number
  verified_reports_count: number
  people_protected: number
  badges: string[]
  streak: number
  last_active_date: string | null
  api_key: string | null
  is_admin: boolean
  created_at: string
  updated_at: string
}

export interface DbScam {
  id: string
  phone_number: string
  phone_hash: string | null
  gender: string
  company: string | null
  represented_as: string
  scam_type: string
  region: string
  description: string | null
  likes: number
  dislikes: number
  is_verified: boolean
  status: string
  reported_by: string | null
  voters: string[]
  created_at: string
  updated_at: string
}

export interface DbComment {
  id: string
  scam_id: string
  user_id: string | null
  user_name: string
  text: string
  created_at: string
}

export interface DbSocialScam {
  id: string
  platform: string
  platform_type: string
  category: string
  username: string
  profile_url: string
  display_name: string
  description: string
  region: string
  amount_scammed: number
  evidence_urls: string[]
  tags: string[]
  victims_count: number
  likes: number
  dislikes: number
  is_verified: boolean
  status: string
  reported_by: string | null
  voters: string[]
  created_at: string
  updated_at: string
}

export interface DbSocialComment {
  id: string
  social_scam_id: string
  user_id: string | null
  user_name: string
  text: string
  created_at: string
}
