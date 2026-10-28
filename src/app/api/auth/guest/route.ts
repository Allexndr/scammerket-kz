import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { checkRateLimit } from '@/lib/security'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
    try {
        const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0] ||
            req.headers.get('x-real-ip') || 'unknown'
        const rateCheck = checkRateLimit(`guest-auth-${clientIp}`, 5, 3600000)
        if (!rateCheck.allowed) {
            return NextResponse.json(
                { error: 'Слишком много попыток. Попробуйте позже.' },
                { status: 429 }
            )
        }

        const body = await req.json()
        const { name } = body

        if (!name || typeof name !== 'string' || name.trim().length < 2) {
            return NextResponse.json({ error: 'Имя обязательно' }, { status: 400 })
        }

        const cleanName = name.trim().substring(0, 100)
        const email = `guest_${Date.now()}_${Math.random().toString(36).slice(2, 8)}@scammerket.kz`

        const { data: user, error } = await supabaseAdmin
            .from('users')
            .insert({
                name: cleanName,
                email,
                points: 0,
                rank: 'Новичок',
                reports_count: 0,
            })
            .select('id, name, email, points, rank, reports_count, verified_reports_count, people_protected, badges')
            .single()

        if (error || !user) {
            console.error('Guest auth error:', error)
            return NextResponse.json({ error: 'Не удалось создать гостевой аккаунт' }, { status: 500 })
        }

        return NextResponse.json({
            id: user.id,
            name: user.name,
            email: user.email,
            points: user.points,
            rank: user.rank,
            reportsCount: user.reports_count,
            verifiedReportsCount: user.verified_reports_count,
            peopleProtected: user.people_protected,
            badges: user.badges || [],
        })
    } catch (error) {
        console.error('Guest auth error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
