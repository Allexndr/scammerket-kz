import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { checkRateLimit } from '@/lib/security'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params

    const { data: scam, error } = await supabaseAdmin
      .from('social_scams')
      .select(`
        id, platform, platform_type, category, username, profile_url, display_name,
        description, region, amount_scammed, evidence_urls, tags, victims_count,
        likes, dislikes, is_verified, status, created_at,
        reported_by_user:users!reported_by(name, rank)
      `)
      .eq('id', id)
      .single()

    if (error || !scam) {
      return NextResponse.json({ error: 'Не найдено' }, { status: 404 })
    }

    // Get comments
    const { data: comments } = await supabaseAdmin
      .from('social_comments')
      .select('id, user_name, text, created_at')
      .eq('social_scam_id', id)
      .order('created_at', { ascending: false })

    return NextResponse.json({
      _id: scam.id,
      platform: scam.platform,
      platformType: scam.platform_type,
      category: scam.category,
      username: scam.username,
      profileUrl: scam.profile_url,
      displayName: scam.display_name,
      description: scam.description,
      region: scam.region,
      amountScammed: scam.amount_scammed,
      evidenceUrls: scam.evidence_urls || [],
      tags: scam.tags || [],
      victimsCount: scam.victims_count,
      likes: scam.likes,
      dislikes: scam.dislikes,
      isVerified: scam.is_verified,
      reportedBy: scam.reported_by_user,
      createdAt: scam.created_at,
      comments: (comments || []).map((c: any) => ({
        _id: c.id,
        userName: c.user_name,
        text: c.text,
        createdAt: c.created_at,
      })),
    })
  } catch (error) {
    console.error('Social scam detail error:', error)
    return NextResponse.json({ error: 'Ошибка загрузки' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0] ||
      request.headers.get('x-real-ip') || 'unknown'
    const rateCheck = checkRateLimit(`social-vote-${clientIp}`, 20, 60000)
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: 'Слишком много голосов. Попробуйте позже.' },
        { status: 429, headers: { 'Retry-After': '60' } }
      )
    }

    const { id } = await params
    const body = await request.json()
    const type = body.type === 'like' ? 'like' : 'dislike'

    // Fetch scam
    const { data: scam, error: fetchError } = await supabaseAdmin
      .from('social_scams')
      .select('id, likes, dislikes, victims_count, is_verified, voters')
      .eq('id', id)
      .single()

    if (fetchError || !scam) {
      return NextResponse.json({ error: 'Не найдено' }, { status: 404 })
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
      return NextResponse.json({ error: 'Вы уже проголосовали' }, { status: 409 })
    }

    // Update
    const newLikes = scam.likes + (type === 'like' ? 1 : 0)
    const newDislikes = scam.dislikes + (type === 'dislike' ? 1 : 0)
    const newVictims = scam.victims_count + (type === 'like' ? 1 : 0)
    const totalVotes = newLikes + newDislikes
    const nowVerified = totalVotes >= 3 && (newLikes / totalVotes) >= 0.7

    const { error: updateError } = await supabaseAdmin
      .from('social_scams')
      .update({
        likes: newLikes,
        dislikes: newDislikes,
        victims_count: newVictims,
        is_verified: nowVerified,
        voters: [...voters, voterId],
      })
      .eq('id', id)

    if (updateError) {
      console.error('Vote update error:', updateError)
      return NextResponse.json({ error: 'Ошибка голосования' }, { status: 500 })
    }

    return NextResponse.json({
      likes: newLikes,
      dislikes: newDislikes,
      victimsCount: newVictims,
      isVerified: nowVerified,
    })
  } catch (error) {
    console.error('Social scam vote error:', error)
    return NextResponse.json({ error: 'Ошибка голосования' }, { status: 500 })
  }
}
