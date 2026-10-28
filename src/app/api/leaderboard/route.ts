import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const filter = searchParams.get('filter') || 'all'

    let query = supabaseAdmin
      .from('users')
      .select('id, name, points, rank, reports_count, verified_reports_count, people_protected, badges')
      .order('points', { ascending: false })
      .limit(100)

    if (filter === 'week' || filter === 'month') {
      const date = new Date()
      if (filter === 'week') date.setDate(date.getDate() - 7)
      else date.setMonth(date.getMonth() - 1)
      query = query.gte('created_at', date.toISOString())
    }

    const { data: users, error } = await query

    if (error) {
      console.error('Leaderboard error:', error)
      return NextResponse.json({ error: 'Failed to fetch leaderboard' }, { status: 500 })
    }

    const rankedUsers = (users || []).map((user: any, index: number) => ({
      id: user.id,
      username: user.name,
      points: user.points,
      status: user.rank,
      scamsReported: user.reports_count || 0,
      scamsVerified: user.verified_reports_count || 0,
      peopleProtected: user.people_protected || 0,
      badges: user.badges || [],
      rank: index + 1,
    }))

    return NextResponse.json({ users: rankedUsers })
  } catch (error) {
    console.error('Leaderboard error:', error)
    return NextResponse.json({ error: 'Failed to fetch leaderboard' }, { status: 500 })
  }
}
