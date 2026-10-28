import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { normalizePhone, sanitizeCompanyName, sanitizeDescription, sanitizeFraudType, checkRateLimit } from '@/lib/security'
import crypto from 'crypto'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0] ||
      request.headers.get('x-real-ip') || 'unknown'
    const rateCheck = checkRateLimit(`report-${clientIp}`, 5, 3600000)
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: 'Слишком много отчётов. Попробуйте позже.' },
        { status: 429, headers: { 'Retry-After': '3600' } }
      )
    }

    const body = await request.json()
    const { phoneNumber, gender = 'unknown', company, representedAs = '', scamType = 'other', region = 'other', description } = body

    if (!phoneNumber || !company || !description) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const sanitizedCompany = sanitizeCompanyName(company)
    const sanitizedDescription = sanitizeDescription(description)
    const sanitizedScamType = sanitizeFraudType(scamType)
    const sanitizedRepresentedAs = sanitizeCompanyName(representedAs).substring(0, 200)

    if (sanitizedDescription.length < 10) {
      return NextResponse.json({ error: 'Описание должно содержать минимум 10 символов' }, { status: 400 })
    }

    // Get authenticated user
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

    // Fallback: anonymous user
    if (!userId) {
      const { data: anonUser } = await supabaseAdmin
        .from('users')
        .select('id')
        .eq('email', 'anonymous@scammerketkz.kz')
        .single()

      if (anonUser) {
        userId = anonUser.id
      } else {
        const { data: newAnon, error } = await supabaseAdmin
          .from('users')
          .insert({ email: 'anonymous@scammerketkz.kz', name: 'Аноним', points: 0, rank: 'Новичок' })
          .select('id')
          .single()
        if (error || !newAnon) {
          return NextResponse.json({ error: 'Database error' }, { status: 500 })
        }
        userId = newAnon.id
      }
    }

    const normalizedPhone = normalizePhone(phoneNumber)
    if (normalizedPhone.length < 10) {
      return NextResponse.json({ error: 'Неверный формат номера телефона' }, { status: 400 })
    }

    const phoneHash = crypto.createHash('sha256').update(normalizedPhone).digest('hex')

    // Check for existing
    const { data: existing } = await supabaseAdmin
      .from('scams')
      .select('id')
      .eq('phone_hash', phoneHash)
      .single()

    if (existing) {
      return NextResponse.json({ error: 'Этот номер уже есть в базе' }, { status: 409 })
    }

    // Insert new scam
    const { data: scam, error } = await supabaseAdmin
      .from('scams')
      .insert({
        phone_number: normalizedPhone,
        phone_hash: phoneHash,
        gender,
        company: sanitizedCompany,
        represented_as: sanitizedRepresentedAs,
        scam_type: sanitizedScamType,
        region,
        description: sanitizedDescription,
        reported_by: userId,
      })
      .select('id')
      .single()

    if (error || !scam) {
      console.error('Insert error:', error)
      return NextResponse.json({ error: 'Failed to submit report' }, { status: 500 })
    }

    // Update user stats
    const { data: userData } = await supabaseAdmin
      .from('users')
      .select('points, reports_count')
      .eq('id', userId)
      .single()

    if (userData) {
      await supabaseAdmin
        .from('users')
        .update({ points: userData.points + 10, reports_count: (userData.reports_count || 0) + 1 })
        .eq('id', userId)
    }

    return NextResponse.json({ message: 'Scam report submitted successfully', scamId: scam.id })
  } catch (error) {
    console.error('Error creating scam report:', error)
    return NextResponse.json({ error: 'Failed to submit report' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Math.min(Math.max(parseInt(searchParams.get('page') || '1'), 1), 1000)
    const limit = Math.min(Math.max(parseInt(searchParams.get('limit') || '20'), 1), 50)
    const sortBy = searchParams.get('sort') || 'createdAt'
    const allowedSortFields: Record<string, string> = {
      createdAt: 'created_at',
      likes: 'likes',
      isVerified: 'is_verified',
      company: 'company',
    }
    const safeSortBy = allowedSortFields[sortBy] || 'created_at'
    const ascending = searchParams.get('order') === 'asc'
    const skip = (page - 1) * limit

    const { data: scams, error, count } = await supabaseAdmin
      .from('scams')
      .select(`
        id, phone_number, gender, company, represented_as, scam_type, region,
        description, likes, dislikes, is_verified, status, reported_by, created_at,
        reported_by_user:users!reported_by(name, rank)
      `, { count: 'exact' })
      .order(safeSortBy, { ascending })
      .range(skip, skip + limit - 1)

    if (error) {
      console.error('Fetch error:', error)
      return NextResponse.json({ error: 'Failed to fetch scams' }, { status: 500 })
    }

    // Get comment counts
    const scamIds = (scams || []).map((s: any) => s.id)
    let commentCountMap: Record<string, number> = {}
    if (scamIds.length > 0) {
      const { data: commentCounts } = await supabaseAdmin
        .from('comments')
        .select('scam_id')
        .in('scam_id', scamIds)
      ;(commentCounts || []).forEach((c: any) => {
        commentCountMap[c.scam_id] = (commentCountMap[c.scam_id] || 0) + 1
      })
    }

    const transformedScams = (scams || []).map((scam: any) => ({
      _id: scam.id,
      phoneNumber: scam.phone_number,
      gender: scam.gender,
      company: scam.company,
      representedAs: scam.represented_as || '',
      scamType: scam.scam_type,
      region: scam.region,
      description: scam.description,
      likes: scam.likes,
      dislikes: scam.dislikes,
      isVerified: scam.is_verified,
      verificationRate: scam.likes + scam.dislikes > 0
        ? Math.round((scam.likes / (scam.likes + scam.dislikes)) * 100)
        : 0,
      reportedBy: scam.reported_by_user,
      createdAt: scam.created_at,
      commentCount: commentCountMap[scam.id] || 0,
    }))

    return NextResponse.json({
      scams: transformedScams,
      pagination: { page, limit, total: count || 0, pages: Math.ceil((count || 0) / limit) },
    })
  } catch (error) {
    console.error('Error fetching scams:', error)
    return NextResponse.json({ error: 'Failed to fetch scams' }, { status: 500 })
  }
}


