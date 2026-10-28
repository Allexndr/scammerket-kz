import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import blacklist from '@/lib/blacklist.json'
import spamDump from '@/lib/spam_dump_ru_kz.json'
import crypto from 'crypto'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
    try {
        const results: string[] = []

        const typeMap: Record<string, string> = {
            'financial_pyramid': 'pyramid',
            'phishing': 'phishing',
            'vishing': 'vishing',
            'spam': 'spam',
            'pyramid': 'pyramid',
            'other': 'other'
        }

        const allData = [...blacklist, ...spamDump]

        for (const item of allData as any[]) {
            const phoneHash = crypto.createHash('sha256').update(item.phone).digest('hex')

            const { data: exists } = await supabaseAdmin
                .from('scams')
                .select('id')
                .eq('phone_hash', phoneHash)
                .single()

            if (!exists) {
                await supabaseAdmin
                    .from('scams')
                    .insert({
                        phone_number: item.phone,
                        phone_hash: phoneHash,
                        company: item.name,
                        scam_type: typeMap[item.type] || 'other',
                        description: `Официально внесен в черный список. Источник: ${item.source}. Статус: ${item.status || 'confirmed'}`,
                        likes: 100,
                        dislikes: 0,
                        region: 'KZ',
                        gender: 'unknown',
                        is_verified: true,
                    })
                results.push(`Added ${item.name} (${item.phone})`)
            } else {
                results.push(`Skipped ${item.name} (exists)`)
            }
        }

        return NextResponse.json({
            success: true,
            message: `Parsing complete. Processed ${allData.length} items.`,
            logs: results,
        })

    } catch (error) {
        console.error('Parse Error:', error)
        return NextResponse.json({ error: 'Parse failed' }, { status: 500 })
    }
}
