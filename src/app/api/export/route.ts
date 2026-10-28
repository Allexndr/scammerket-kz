import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { checkRateLimit } from '@/lib/security'

export const dynamic = 'force-dynamic'

function maskPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  if (digits.length <= 4) return '***'
  return digits.substring(0, 2) + '*'.repeat(digits.length - 4) + digits.substring(digits.length - 2)
}

export async function GET(request: NextRequest) {
  try {
    const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown'
    const rateCheck = checkRateLimit(`export-${clientIp}`, 5, 60000)
    if (!rateCheck.allowed) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })
    }

    const apiKey = request.headers.get('x-api-key') || new URL(request.url).searchParams.get('api_key')
    let hasFullAccess = false

    if (apiKey) {
      const { data: user } = await supabaseAdmin
        .from('users')
        .select('id')
        .eq('api_key', apiKey)
        .single()
      if (user) hasFullAccess = true
    }

    const { searchParams } = new URL(request.url)
    const format = searchParams.get('format') || 'json'
    const type = searchParams.get('type') || 'all'
    const company = searchParams.get('company')

    let query = supabaseAdmin
      .from('scams')
      .select(`
        id, phone_number, gender, company, scam_type, region, description,
        likes, dislikes, is_verified, created_at,
        reported_by_user:users!reported_by(name)
      `)
      .order('created_at', { ascending: false })
      .limit(hasFullAccess ? 1000 : 100)

    if (type === 'verified') query = query.eq('is_verified', true)
    else if (type === 'company' && company) query = query.ilike('company', `%${company}%`)

    const { data: scams, error } = await query

    if (error || !scams) {
      return NextResponse.json([])
    }

    const exportData = scams.map((scam: any) => ({
      id: scam.id,
      phoneNumber: hasFullAccess ? scam.phone_number : maskPhone(scam.phone_number),
      gender: scam.gender,
      company: scam.company,
      scamType: scam.scam_type,
      region: scam.region,
      description: scam.description,
      likes: scam.likes,
      dislikes: scam.dislikes,
      isVerified: scam.is_verified,
      reportedBy: scam.reported_by_user?.name || 'Аноним',
      createdAt: scam.created_at,
      totalVotes: scam.likes + scam.dislikes,
    }))

    if (format === 'csv') {
      const csvHeaders = ['ID', 'Номер телефона', 'Пол', 'Компания', 'Категория', 'Регион', 'Описание', 'Лайки', 'Дизлайки', 'Верифицировано', 'Сообщил', 'Дата создания', 'Всего голосов']

      const csvRows = exportData.map(row => [
        row.id,
        row.phoneNumber,
        row.gender === 'male' ? 'Мужской' : row.gender === 'female' ? 'Женский' : 'Неизвестно',
        row.company,
        row.scamType,
        row.region,
        `"${(row.description || '').replace(/"/g, '""')}"`,
        row.likes,
        row.dislikes,
        row.isVerified ? 'Да' : 'Нет',
        row.reportedBy,
        new Date(row.createdAt).toISOString(),
        row.totalVotes,
      ])

      const csvContent = [csvHeaders, ...csvRows]
        .map(row => row.map(field => String(field)).join(','))
        .join('\n')

      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': 'attachment; filename="scams_export.csv"',
        },
      })
    }

    if (format === 'json') {
      return NextResponse.json({
        disclaimer: 'Данные предоставлены пользователями платформы ScammerKetKz. Мы не несём ответственности за их достоверность. Номера телефонов маскированы для защиты приватности. Полный доступ — по API ключу.',
        exportedAt: new Date().toISOString(),
        totalRecords: exportData.length,
        data: exportData,
      })
    }

    return NextResponse.json({ error: 'Unsupported format' }, { status: 400 })
  } catch (error) {
    console.error('Error exporting data:', error)
    return NextResponse.json({ error: 'Failed to export data' }, { status: 500 })
  }
}


