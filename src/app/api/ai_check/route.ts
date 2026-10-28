import { NextRequest, NextResponse } from 'next/server'

const HF_API_KEY = process.env.HF_API_KEY
const MODEL_ID = 'mistralai/Mistral-7B-Instruct-v0.2'

export async function POST(req: NextRequest) {
    let text = ''
    try {
        const body = await req.json()
        text = body.text

        if (!text || text.length < 5) {
            return NextResponse.json({ error: 'Text too short' }, { status: 400 })
        }

        // --- 1. MOCK FALLBACK (If no API Key or for Demo) ---
        if (!HF_API_KEY) {
            console.log('⚠️ No HF_API_KEY found. Using Mock AI Agent. Text:', text)
            const mockResult = getMockAnalysis(text)
            // Simulate AI delay for realism
            await new Promise(resolve => setTimeout(resolve, 1500))
            return NextResponse.json(mockResult)
        }

        // --- 2. REAL AI REQUEST ---
        const prompt = `<s>[INST] Ты эксперт по кибербезопасности из Казахстана. Проанализируй сообщение ниже на предмет мошенничества.
        
        Текст: "${text}"
        
        Верни ТОЛЬКО JSON объект (без markdown):
        {
            "score": число_от_0_до_100,
            "verdict": "короткий вердикт на русском",
            "advice": "совет на русском что делать"
        } [/INST]`

        const response = await fetch(`https://api-inference.huggingface.co/models/${MODEL_ID}`, {
            headers: {
                Authorization: `Bearer ${HF_API_KEY}`,
                "Content-Type": "application/json",
            },
            method: "POST",
            body: JSON.stringify({
                inputs: prompt,
                parameters: {
                    max_new_tokens: 500,
                    return_full_text: false,
                    temperature: 0.1
                }
            }),
        });

        if (!response.ok) {
            throw new Error(`HF API responded with ${response.status}`)
        }

        const result = await response.json()
        let jsonStr = result[0]?.generated_text || ''

        // Clean up text
        jsonStr = jsonStr.replace(/```json/g, '').replace(/```/g, '').trim()
        const jsonMatch = jsonStr.match(/\{[\s\S]*\}/)
        if (jsonMatch) jsonStr = jsonMatch[0]

        const analysis = JSON.parse(jsonStr)
        return NextResponse.json(analysis)

    } catch (error) {
        console.error('AI Check Error:', error)
        // Fallback even if API fails (pass the text we captured!)
        return NextResponse.json(getMockAnalysis(text))
    }
}

// Simple keyword-based mock analysis
function getMockAnalysis(text: string) {
    const t = text.toLowerCase()

    // High Risk Keywords
    if (t.includes('код') || t.includes('смс') || t.includes('пароль') || t.includes('карт') || t.includes('безопасный счет') || t.includes('счет') || t.includes('перевод')) {
        return {
            score: 95,
            verdict: "🚨 ВЫСОКАЯ ОПАСНОСТЬ (Фишинг/Вишинг)",
            advice: "Никому не сообщайте коды и не переводите деньги! 'Безопасных счетов' не существует. Это мошенники."
        }
    }

    if (t.includes('инвести') || t.includes('доход') || t.includes('гаранти')) {
        return {
            score: 85,
            verdict: "⚠️ ПОДОЗРИТЕЛЬНО (Пирамида/Скам)",
            advice: "Обещания гарантированного высокого дохода — признак финансовой пирамиды. Проверьте лицензию на сайте АРРФР."
        }
    }

    if (t.includes('выигр') || t.includes('приз') || t.includes('лотере')) {
        return {
            score: 90,
            verdict: "🚫 ОПАСНО (Розыгрыш)",
            advice: "Не переводите деньги за 'доставку' или 'комиссию'. Реальные розыгрыши не требуют предоплаты."
        }
    }

    if (t.includes('кредит') || t.includes('заявк') || t.includes('безопасный счет')) {
        return {
            score: 98,
            verdict: "🔥 КРИТИЧЕСКАЯ УГРОЗА (Вишинг)",
            advice: "Срочно сбросьте звонок! Не переводите деньги на 'безопасные счета'. Позвоните в банк сами по номеру на карте."
        }
    }

    // Default Safe-ish
    return {
        score: 15,
        verdict: "✅ Вроде чисто, но будьте бдительны",
        advice: "Явных признаков мошенничества нет, но никогда не теряйте бдительность в интернете.",
        debug: `Input: ${t}, Matched: False`
    }
}
