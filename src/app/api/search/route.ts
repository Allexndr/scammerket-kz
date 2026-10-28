import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import crypto from 'crypto'
import { sanitizeSearchQuery, sanitizeCompanyName, checkRateLimit, normalizePhone } from '@/lib/security'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0] ||
      request.headers.get('x-real-ip') || 'unknown'

    const rateCheck = checkRateLimit(`search-${clientIp}`, 30, 60000)
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429, headers: { 'Retry-After': '60', 'X-RateLimit-Remaining': '0' } }
      )
    }

    const { searchParams } = new URL(request.url)
    const rawQuery = searchParams.get('q')
    const rawType = searchParams.get('type')

    if (!rawQuery || typeof rawQuery !== 'string') {
      return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 })
    }

    const query = sanitizeSearchQuery(rawQuery)
    const type = rawType === 'company' ? 'company' : 'phone'

    if (!query || query.length < 2) {
      return NextResponse.json({ error: 'Query too short or invalid' }, { status: 400 })
    }

    let results: any[] = []

    try {
      if (type === 'phone') {
        const normalizedInput = normalizePhone(query)
        const rawDigits = query.replace(/\D/g, '')

        // Try hash match first
        if (normalizedInput.length >= 10) {
          const phoneHash = crypto.createHash('sha256').update(normalizedInput).digest('hex')
          const { data: hashMatches } = await supabaseAdmin
            .from('scams')
            .select('id, phone_number, company, description, is_verified, likes, dislikes, status, created_at')
            .eq('phone_hash', phoneHash)
            .limit(20)
          if (hashMatches) results = hashMatches
        }

        // If no hash match, try partial phone match
        if (results.length === 0 && rawDigits.length > 2) {
          const { data: partialMatches, error } = await supabaseAdmin
            .from('scams')
            .select('id, phone_number, company, description, is_verified, likes, dislikes, status, created_at')
            .ilike('phone_number', `%${rawDigits}%`)
            .limit(20)
          if (partialMatches) results = partialMatches
        }
      } else if (type === 'company') {
        const sanitizedCompany = sanitizeCompanyName(query)
        const { data: companyMatches, error } = await supabaseAdmin
          .from('scams')
          .select('id, phone_number, company, description, is_verified, likes, dislikes, status, created_at')
          .ilike('company', `%${sanitizedCompany}%`)
          .limit(20)
        if (companyMatches) results = companyMatches
      }
    } catch (dbError) {
      console.error('Database query error:', dbError)
    }

    const finalResults = results.map((s: any) => ({
      _id: s.id,
      phoneNumber: String(s.phone_number || ''),
      company: sanitizeCompanyName(s.company || ''),
      description: String(s.description || '').substring(0, 500),
      isVerified: Boolean(s.is_verified),
      likes: Math.max(0, s.likes || 0),
      dislikes: Math.max(0, s.dislikes || 0),
      status: String(s.status || 'Pending'),
      createdAt: s.created_at,
    }))

    return NextResponse.json({
      results: finalResults.slice(0, 20),
      total: finalResults.length,
      rateLimitRemaining: rateCheck.remaining,
    }, {
      headers: {
        'X-RateLimit-Remaining': String(rateCheck.remaining),
        'Cache-Control': 'private, no-cache, no-store, must-revalidate',
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block',
      },
    })
  } catch (error) {
    console.error('Error searching:', error)
    return NextResponse.json({ error: 'An error occurred while searching' }, { status: 500 })
  }
}


