import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        const { data: scams, error } = await supabaseAdmin
            .from('scams')
            .select('company')

        if (error || !scams) {
            return NextResponse.json([])
        }

        // Aggregate in JS (Supabase doesn't have native group-by in the client)
        const companyMap: Record<string, number> = {}
        scams.forEach((s: any) => {
            if (s.company) {
                const key = s.company
                companyMap[key] = (companyMap[key] || 0) + 1
            }
        })

        const sorted = Object.entries(companyMap)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([company, count]) => {
                let risk = 'Низкий'
                if (count >= 10) risk = 'Критический'
                else if (count >= 5) risk = 'Высокий'
                else if (count >= 2) risk = 'Средний'
                return { company, count, risk }
            })

        return NextResponse.json(sorted)
    } catch (error) {
        console.error('Error fetching top companies:', error)
        return NextResponse.json({ error: 'Failed to fetch top companies' }, { status: 500 })
    }
}
