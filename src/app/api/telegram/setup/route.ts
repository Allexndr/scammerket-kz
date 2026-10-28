import { NextRequest, NextResponse } from 'next/server'

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN
const VERCEL_URL = 'https://scammerket.vercel.app'

export async function GET(req: NextRequest) {
    if (!BOT_TOKEN) {
        return NextResponse.json({ error: 'No BOT_TOKEN found' })
    }

    const webhookUrl = `${VERCEL_URL}/api/telegram/webhook`

    try {
        // 1. Set Webhook
        const webhookRes = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/setWebhook?url=${webhookUrl}`)
        const webhookData = await webhookRes.json()

        // 2. Set Menu Button (The blue button bottom-left)
        const menuButtonRes = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/setChatMenuButton`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                menu_button: {
                    type: 'web_app',
                    text: 'Открыть ScammerKet',
                    web_app: { url: VERCEL_URL }
                }
            })
        })
        const menuButtonData = await menuButtonRes.json()

        return NextResponse.json({
            status: 'Setup complete',
            webhook: webhookData,
            menu_button: menuButtonData,
            url_used: VERCEL_URL
        })
    } catch (e) {
        return NextResponse.json({ error: 'Failed to set webhook/menu', details: e })
    }
}
