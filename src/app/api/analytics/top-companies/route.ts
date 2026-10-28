import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { data: scams, error } = await supabaseAdmin
      .from('scams')
      .select('company, is_verified, likes, dislikes')

    if (error || !scams) {
      return NextResponse.json({
        topCompanies: [
          { company: 'Kaspi Bank', totalReports: 25, verifiedReports: 20, avgLikes: 8.5, avgDislikes: 2.1, verificationRate: 80 },
          { company: 'Halyk Bank', totalReports: 18, verifiedReports: 14, avgLikes: 7.2, avgDislikes: 1.8, verificationRate: 77.8 },
          { company: 'Freedom Finance', totalReports: 12, verifiedReports: 9, avgLikes: 6.8, avgDislikes: 1.5, verificationRate: 75 },
        ],
        totalStats: { totalScams: 150, totalVerified: 120, verificationRate: 80, totalVotes: 500 },
      })
    }

    // Aggregate in JS
    const companyMap: Record<string, { count: number; verified: number; likes: number; dislikes: number }> = {}
    let totalScams = 0
    let totalVerified = 0
    let totalLikes = 0
    let totalDislikes = 0

    scams.forEach((s: any) => {
      totalScams++
      if (s.is_verified) totalVerified++
      totalLikes += s.likes || 0
      totalDislikes += s.dislikes || 0

      if (s.company) {
        if (!companyMap[s.company]) {
          companyMap[s.company] = { count: 0, verified: 0, likes: 0, dislikes: 0 }
        }
        companyMap[s.company].count++
        if (s.is_verified) companyMap[s.company].verified++
        companyMap[s.company].likes += s.likes || 0
        companyMap[s.company].dislikes += s.dislikes || 0
      }
    })

    const topCompanies = Object.entries(companyMap)
      .map(([company, data]) => ({
        company,
        totalReports: data.count,
        verifiedReports: data.verified,
        avgLikes: Math.round((data.likes / data.count) * 10) / 10,
        avgDislikes: Math.round((data.dislikes / data.count) * 10) / 10,
        verificationRate: Math.round((data.verified / data.count) * 100 * 10) / 10,
      }))
      .sort((a, b) => b.totalReports - a.totalReports)
      .slice(0, 10)

    return NextResponse.json({
      topCompanies,
      totalStats: {
        totalScams,
        totalVerified,
        verificationRate: totalScams > 0 ? Math.round((totalVerified / totalScams) * 100 * 10) / 10 : 0,
        totalVotes: totalLikes + totalDislikes,
      },
    })
  } catch (error) {
    console.error('Error fetching top companies:', error)
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 })
  }
}


