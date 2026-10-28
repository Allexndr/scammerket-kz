import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { checkRateLimit } from '@/lib/security'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0] ||
      request.headers.get('x-real-ip') || 'unknown'
    const rateCheck = checkRateLimit(`vote-${clientIp}`, 20, 60000)
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: 'Слишком много голосов. Попробуйте позже.' },
        { status: 429, headers: { 'Retry-After': '60' } }
      )
    }

    const { id } = await params
    const body = await request.json()
    const { type } = body

    if (!['like', 'dislike'].includes(type)) {
      return NextResponse.json({ error: 'Invalid vote type' }, { status: 400 })
    }

    // Fetch scam
    const { data: scam, error: fetchError } = await supabaseAdmin
      .from('scams')
      .select('id, likes, dislikes, is_verified, voters, reported_by')
      .eq('id', id)
      .single()

    if (fetchError || !scam) {
      return NextResponse.json({ error: 'Scam not found' }, { status: 404 })
    }

    // Get voter identity
    const session = await getServerSession(authOptions)
    let voterId = `anon-${clientIp}`

    if (session?.user?.email) {
      const { data: user } = await supabaseAdmin
        .from('users')
        .select('id')
        .eq('email', session.user.email)
        .single()
      if (user) voterId = user.id
    }

    // Check if already voted
    const voters = scam.voters || []
    if (voters.includes(voterId)) {
      return NextResponse.json({ error: 'Вы уже проголосовали за эту запись' }, { status: 409 })
    }

    // Update vote counts
    const newLikes = scam.likes + (type === 'like' ? 1 : 0)
    const newDislikes = scam.dislikes + (type === 'dislike' ? 1 : 0)
    const totalVotes = newLikes + newDislikes
    const wasVerified = scam.is_verified
    const nowVerified = totalVotes >= 3 && (newLikes / totalVotes) >= 0.7

    const { error: updateError } = await supabaseAdmin
      .from('scams')
      .update({
        likes: newLikes,
        dislikes: newDislikes,
        is_verified: nowVerified,
        voters: [...voters, voterId],
      })
      .eq('id', id)

    if (updateError) {
      console.error('Vote update error:', updateError)
      return NextResponse.json({ error: 'Failed to vote' }, { status: 500 })
    }

    // Update reporter stats if verified or liked
    if (scam.reported_by) {
      if (!wasVerified && nowVerified) {
        await supabaseAdmin.rpc('increment_user_stat', {
          p_user_id: scam.reported_by,
          p_column: 'verified_reports_count',
          p_amount: 1,
        })
        await supabaseAdmin.rpc('increment_user_stat', {
          p_user_id: scam.reported_by,
          p_column: 'people_protected',
          p_amount: 1,
        })
      } else if (nowVerified && type === 'like') {
        await supabaseAdmin.rpc('increment_user_stat', {
          p_user_id: scam.reported_by,
          p_column: 'people_protected',
          p_amount: 1,
        })
      }
    }

    return NextResponse.json({
      message: 'Vote recorded',
      likes: newLikes,
      dislikes: newDislikes,
      isVerified: nowVerified,
    })
  } catch (error) {
    console.error('Vote error:', error)
    return NextResponse.json({ error: 'Failed to vote' }, { status: 500 })
  }
}
