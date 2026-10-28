import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        const [{ count: totalScams }, { count: totalUsers }, { count: verifiedScams }] = await Promise.all([
            supabaseAdmin.from('scams').select('*', { count: 'exact', head: true }),
            supabaseAdmin.from('users').select('*', { count: 'exact', head: true }),
            supabaseAdmin.from('scams').select('*', { count: 'exact', head: true }).eq('is_verified', true),
        ])

        // Get distinct companies count
        const { data: companies } = await supabaseAdmin
            .from('scams')
            .select('company')
            .not('company', 'is', null)

        const uniqueCompanies = new Set((companies || []).map((c: any) => c.company?.toLowerCase()).filter(Boolean))

        return NextResponse.json({
            totalScams: totalScams || 0,
            totalUsers: totalUsers || 0,
            totalCompanies: uniqueCompanies.size,
            verifiedScams: verifiedScams || 0,
        })
    } catch (error) {
        console.error('Error fetching stats:', error)
        return NextResponse.json({
            totalScams: 0,
            totalUsers: 0,
            totalCompanies: 0,
            verifiedScams: 0,
        }, { status: 500 })
    }
}
