import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import crypto from 'crypto'

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session || !session.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { data: user, error: userError } = await supabaseAdmin
            .from('users')
            .select('id, api_key, updated_at')
            .eq('email', session.user.email)
            .single()

        if (userError || !user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        // Rate limit: 1 minute between key generations
        if (user.updated_at) {
            const timeSinceUpdate = Date.now() - new Date(user.updated_at).getTime()
            if (timeSinceUpdate < 60000) {
                return NextResponse.json({ error: 'Please wait 1 minute before generating a new key.' }, { status: 429 })
            }
        }

        const randomPart = crypto.randomBytes(24).toString('hex')
        const apiKey = `sk_live_${randomPart}`

        const { error: updateError } = await supabaseAdmin
            .from('users')
            .update({ api_key: apiKey })
            .eq('id', user.id)

        if (updateError) {
            console.error('Key update error:', updateError)
            return NextResponse.json({ error: 'Failed to generate key' }, { status: 500 })
        }

        return NextResponse.json({ key: apiKey })

    } catch (error) {
        console.error('Key Generation Error:', error)
        return NextResponse.json({ error: 'Failed to generate key' }, { status: 500 })
    }
}
