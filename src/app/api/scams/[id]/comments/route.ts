import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { sanitizeDescription, checkRateLimit } from '@/lib/security'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = await params
        const { data: comments, error } = await supabaseAdmin
            .from('comments')
            .select('id, user_name, text, created_at')
            .eq('scam_id', id)
            .order('created_at', { ascending: false })
            .limit(50)

        if (error) {
            return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 })
        }

        return NextResponse.json((comments || []).map((c: any) => ({
            _id: c.id,
            userName: c.user_name,
            text: c.text,
            createdAt: c.created_at,
        })))
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 })
    }
}

export async function POST(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0] ||
            req.headers.get('x-real-ip') || 'unknown'
        const rateCheck = checkRateLimit(`comment-${clientIp}`, 10, 3600000)
        if (!rateCheck.allowed) {
            return NextResponse.json(
                { error: 'Слишком много комментариев. Попробуйте позже.' },
                { status: 429, headers: { 'Retry-After': '3600' } }
            )
        }

        const { id } = await params
        const body = await req.json()
        const { text } = body

        if (!text || typeof text !== 'string') {
            return NextResponse.json({ error: 'Текст комментария обязателен' }, { status: 400 })
        }

        const sanitizedText = sanitizeDescription(text)
        if (sanitizedText.length < 3) {
            return NextResponse.json({ error: 'Комментарий слишком короткий' }, { status: 400 })
        }

        // Get authenticated user
        const session = await getServerSession(authOptions)
        let userId: string | null = null
        let userName = 'Гость'

        if (session?.user?.email) {
            const { data: user } = await supabaseAdmin
                .from('users')
                .select('id, name')
                .eq('email', session.user.email)
                .single()
            if (user) {
                userId = user.id
                userName = user.name || session.user.name || 'Пользователь'
            }
        } else {
            userId = `anon-${clientIp}`
        }

        const { data: comment, error } = await supabaseAdmin
            .from('comments')
            .insert({
                scam_id: id,
                user_id: userId,
                user_name: userName,
                text: sanitizedText,
            })
            .select('id, user_name, text, created_at')
            .single()

        if (error || !comment) {
            console.error('Comment insert error:', error)
            return NextResponse.json({ error: 'Failed to post comment' }, { status: 500 })
        }

        return NextResponse.json({
            _id: comment.id,
            userName: comment.user_name,
            text: comment.text,
            createdAt: comment.created_at,
        })
    } catch (error) {
        console.error('Comment Error:', error)
        return NextResponse.json({ error: 'Failed to post comment' }, { status: 500 })
    }
}
