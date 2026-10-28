import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = await params

        // UUID format validation
        if (!id.match(/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/)) {
            return NextResponse.json({ error: 'Invalid ID format' }, { status: 400 })
        }

        const { data: scam, error } = await supabaseAdmin
            .from('scams')
            .select(`
                id, phone_number, gender, company, represented_as, scam_type, region,
                description, likes, dislikes, is_verified, status, reported_by, created_at,
                reported_by_user:users!reported_by(name, rank)
            `)
            .eq('id', id)
            .single()

        if (error || !scam) {
            return NextResponse.json({ error: 'Scam report not found' }, { status: 404 })
        }

        // Get comments separately
        const { data: comments } = await supabaseAdmin
            .from('comments')
            .select('id, user_name, text, created_at')
            .eq('scam_id', id)
            .order('created_at', { ascending: false })

        const transformedScam = {
            _id: scam.id,
            phoneNumber: scam.phone_number,
            gender: scam.gender,
            company: scam.company,
            representedAs: scam.represented_as || '',
            scamType: scam.scam_type,
            region: scam.region,
            description: scam.description,
            likes: scam.likes,
            dislikes: scam.dislikes,
            isVerified: scam.is_verified,
            reportedBy: scam.reported_by_user,
            createdAt: scam.created_at,
            comments: (comments || []).map((c: any) => ({
                _id: c.id,
                userName: c.user_name,
                text: c.text,
                createdAt: c.created_at,
            })),
        }

        return NextResponse.json(transformedScam)
    } catch (error) {
        console.error('Error fetching scam details:', error)
        return NextResponse.json({ error: 'Failed to fetch scam details' }, { status: 500 })
    }
}
