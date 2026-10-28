import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { checkRateLimit, sanitizeDescription } from '@/lib/security'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params
    const { data: comments, error } = await supabaseAdmin
      .from('social_comments')
      .select('id, user_name, text, created_at')
      .eq('social_scam_id', id)
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: 'Ошибка' }, { status: 500 })
    }

    return NextResponse.json((comments || []).map((c: any) => ({
      _id: c.id,
      userName: c.user_name,
      text: c.text,
      createdAt: c.created_at,
    })))
  } catch (error) {
    return NextResponse.json({ error: 'Ошибка' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0] ||
      request.headers.get('x-real-ip') || 'unknown'
    const rateCheck = checkRateLimit(`social-comment-${clientIp}`, 10, 3600000)
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: 'Слишком много комментариев. Попробуйте позже.' },
        { status: 429 }
      )
    }

    const { id } = await params
    const body = await request.json()
    if (!body.text || typeof body.text !== 'string' || body.text.trim().length < 3) {
      return NextResponse.json({ error: 'Слишком короткий комментарий' }, { status: 400 })
    }

    const text = sanitizeDescription(body.text).substring(0, 1000)

    let userName = 'Аноним'
    let userId = `anon-${clientIp}`
    const session = await getServerSession(authOptions)
    if (session?.user?.email) {
      const { data: user } = await supabaseAdmin
        .from('users')
        .select('id, name')
        .eq('email', session.user.email)
        .single()
      if (user) {
        userName = user.name || session.user.name || 'Пользователь'
        userId = user.id
      }
    }

    const { data: comment, error } = await supabaseAdmin
      .from('social_comments')
      .insert({
        social_scam_id: id,
        user_id: userId,
        user_name: userName,
        text,
      })
      .select('id, user_name, text, created_at')
      .single()

    if (error || !comment) {
      console.error('Social comment insert error:', error)
      return NextResponse.json({ error: 'Ошибка' }, { status: 500 })
    }

    return NextResponse.json({
      _id: comment.id,
      userName: comment.user_name,
      text: comment.text,
      createdAt: comment.created_at,
    }, { status: 201 })
  } catch (error) {
    console.error('Social scam comment error:', error)
    return NextResponse.json({ error: 'Ошибка' }, { status: 500 })
  }
}
