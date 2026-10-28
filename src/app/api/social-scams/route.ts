import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { checkRateLimit, sanitizeCompanyName, sanitizeDescription } from '@/lib/security'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export const dynamic = 'force-dynamic'

const VALID_PLATFORMS = [
  'instagram', 'telegram', 'tiktok', 'whatsapp', 'threads',
  'youtube', 'facebook', 'kaspi', 'satu', 'olx', 'market', 'flip', 'other',
]

const VALID_CATEGORIES = ['shop', 'freelancer', 'seller', 'blogger', 'other']

const PLATFORM_TYPE_MAP: Record<string, 'social' | 'marketplace'> = {
  instagram: 'social', telegram: 'social', tiktok: 'social',
  whatsapp: 'social', threads: 'social', youtube: 'social',
  facebook: 'social',
  kaspi: 'marketplace', satu: 'marketplace', olx: 'marketplace',
  market: 'marketplace', flip: 'marketplace',
  other: 'social',
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const platform = searchParams.get('platform')
    const category = searchParams.get('category')
    const platformType = searchParams.get('platformType')
    const search = searchParams.get('q')
    const sort = searchParams.get('sort') || 'victims'
    const page = Math.min(Math.max(parseInt(searchParams.get('page') || '1'), 1), 1000)
    const limit = Math.min(Math.max(parseInt(searchParams.get('limit') || '20'), 1), 50)
    const skip = (page - 1) * limit

    let query = supabaseAdmin
      .from('social_scams')
      .select(`
        id, platform, platform_type, category, username, profile_url, display_name,
        description, region, amount_scammed, tags, victims_count, likes, dislikes,
        is_verified, status, created_at,
        reported_by_user:users!reported_by(name, rank)
      `, { count: 'exact' })
      .neq('status', 'Resolved')

    if (platform && VALID_PLATFORMS.includes(platform)) query = query.eq('platform', platform)
    if (category && VALID_CATEGORIES.includes(category)) query = query.eq('category', category)
    if (platformType) query = query.eq('platform_type', platformType)
    if (search) {
      query = query.or(`username.ilike.%${search}%,display_name.ilike.%${search}%,description.ilike.%${search}%`)
    }

    // Sort
    const sortMap: Record<string, string> = {
      victims: 'victims_count',
      newest: 'created_at',
      likes: 'likes',
      verified: 'is_verified',
    }
    const sortBy = sortMap[sort] || 'victims_count'
    query = query.order(sortBy, { ascending: false }).order('likes', { ascending: false })

    const { data: scams, error, count } = await query.range(skip, skip + limit - 1)

    if (error) {
      console.error('Social scams GET error:', error)
      return NextResponse.json({ error: 'Ошибка загрузки' }, { status: 500 })
    }

    // Get comment counts
    const scamIds = (scams || []).map((s: any) => s.id)
    let commentCountMap: Record<string, number> = {}
    if (scamIds.length > 0) {
      const { data: commentCounts } = await supabaseAdmin
        .from('social_comments')
        .select('social_scam_id')
        .in('social_scam_id', scamIds)
      ;(commentCounts || []).forEach((c: any) => {
        commentCountMap[c.social_scam_id] = (commentCountMap[c.social_scam_id] || 0) + 1
      })
    }

    return NextResponse.json({
      results: (scams || []).map((s: any) => ({
        ...s,
        _id: s.id,
        profileUrl: s.profile_url,
        displayName: s.display_name,
        amountScammed: s.amount_scammed,
        victimsCount: s.victims_count,
        isVerified: s.is_verified,
        platformType: s.platform_type,
        reportedBy: s.reported_by_user,
        commentCount: commentCountMap[s.id] || 0,
      })),
      total: count || 0,
      page,
      totalPages: Math.ceil((count || 0) / limit),
    })
  } catch (error) {
    console.error('Social scams GET error:', error)
    return NextResponse.json({ error: 'Ошибка загрузки' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0] ||
      request.headers.get('x-real-ip') || 'unknown'
    const rateCheck = checkRateLimit(`social-report-${clientIp}`, 5, 3600000)
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: 'Слишком много жалоб. Попробуйте позже.' },
        { status: 429, headers: { 'Retry-After': '3600' } }
      )
    }

    const body = await request.json()

    if (!body.platform || !VALID_PLATFORMS.includes(body.platform)) {
      return NextResponse.json({ error: 'Выберите платформу' }, { status: 400 })
    }
    if (!body.category || !VALID_CATEGORIES.includes(body.category)) {
      return NextResponse.json({ error: 'Выберите категорию' }, { status: 400 })
    }
    if (!body.username || typeof body.username !== 'string' || body.username.trim().length < 2) {
      return NextResponse.json({ error: 'Укажите никнейм или название' }, { status: 400 })
    }
    if (!body.profileUrl || typeof body.profileUrl !== 'string') {
      return NextResponse.json({ error: 'Укажите ссылку на профиль' }, { status: 400 })
    }
    if (!body.description || typeof body.description !== 'string' || body.description.trim().length < 20) {
      return NextResponse.json({ error: 'Описание слишком короткое (минимум 20 символов)' }, { status: 400 })
    }

    const displayName = sanitizeCompanyName(body.displayName || body.username)
    const description = sanitizeDescription(body.description)

    let userId: string | null = null
    const session = await getServerSession(authOptions)
    if (session?.user?.email) {
      const { data: user } = await supabaseAdmin
        .from('users')
        .select('id')
        .eq('email', session.user.email)
        .single()
      if (user) userId = user.id
    }

    const { data: newScam, error } = await supabaseAdmin
      .from('social_scams')
      .insert({
        platform: body.platform,
        platform_type: PLATFORM_TYPE_MAP[body.platform] || 'social',
        category: body.category,
        username: String(body.username).trim().substring(0, 100),
        profile_url: String(body.profileUrl).trim().substring(0, 500),
        display_name: displayName.substring(0, 200),
        description: description.substring(0, 3000),
        region: body.region || 'other',
        amount_scammed: Math.max(0, parseInt(body.amountScammed) || 0),
        evidence_urls: Array.isArray(body.evidenceUrls) ? body.evidenceUrls.slice(0, 5) : [],
        tags: Array.isArray(body.tags) ? body.tags.slice(0, 10) : [],
        victims_count: 1,
        reported_by: userId,
      })
      .select('id')
      .single()

    if (error || !newScam) {
      console.error('Social scam insert error:', error)
      return NextResponse.json({ error: 'Ошибка при создании жалобы' }, { status: 500 })
    }

    // Award points to user
    if (userId) {
      const { data: userData } = await supabaseAdmin
        .from('users')
        .select('points, reports_count')
        .eq('id', userId)
        .single()
      if (userData) {
        await supabaseAdmin
          .from('users')
          .update({ points: userData.points + 15, reports_count: (userData.reports_count || 0) + 1 })
          .eq('id', userId)
      }
    }

    return NextResponse.json({
      success: true,
      id: newScam.id,
      message: 'Жалоба добавлена в реестр',
    }, { status: 201 })

  } catch (error) {
    console.error('Social scam POST error:', error)
    return NextResponse.json({ error: 'Ошибка при создании жалобы' }, { status: 500 })
  }
}
