import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session || !session.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { data: user, error } = await supabaseAdmin
            .from('users')
            .select('*')
            .eq('email', session.user.email)
            .single()

        if (error || !user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        return NextResponse.json({
            ...user,
            _id: user.id,
            reportsCount: user.reports_count,
            verifiedReportsCount: user.verified_reports_count,
            peopleProtected: user.people_protected,
            lastActiveDate: user.last_active_date,
            apiKeys: user.api_key ? [{ key: user.api_key, name: 'Default', createdAt: user.updated_at, isActive: true }] : [],
        })

    } catch (error) {
        console.error('Profile Fetch Error:', error)
        return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 })
    }
}
