'use client'

import { useState } from 'react'
import { Bot, Mic, Send, AlertTriangle, CheckCircle, ShieldAlert } from 'lucide-react'

export default function AiCheckPage() {
    const [text, setText] = useState('')
    const [isAnalyzing, setIsAnalyzing] = useState(false)
    const [result, setResult] = useState<null | { score: number, verdict: string, advice: string }>(null)

    const handleAnalyze = async () => {
        if (!text.trim()) return
        setIsAnalyzing(true)
        setResult(null)

        // Scroll to where results will be
        window.scrollTo({ top: 300, behavior: 'smooth' })

        try {
            const response = await fetch('/api/ai_check', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text })
            })

            const data = await response.json()

            if (data.error) {
                alert('Ошибка анализа: ' + (data.details || data.error))
                // Fallback for demo if no key provided
                if (data.fallback) setResult(data.fallback)
            } else {
                setResult(data)
            }
        } catch (error) {
            console.error(error)
            alert('Не удалось связаться с сервером')
        } finally {
            setIsAnalyzing(false)
        }
    }

    return (
        <div className="min-h-screen pt-28 pb-20 px-4 bg-[#F9F9F7]">
            <div className="container mx-auto max-w-3xl">

                <div className="text-center mb-10">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-100 text-purple-700 text-sm font-bold mb-6">
                        <Bot className="w-5 h-5" />
                        AI Scammer Detector (Beta)
                    </div>
                    <h1 className="text-3xl sm:text-5xl font-black mb-4">
                        Проверьте переписку <br />
                        <span className="text-purple-600">искусственным интеллектом</span>
                    </h1>
                    <p className="text-gray-600 max-w-xl mx-auto">
                        Вставьте текст сообщения от "менеджера банка" или "покупателя", и наш AI проанализирует его на наличие манипуляций.
                    </p>
                </div>

                <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-[#E0E0D8]">
                    {/* Input Area */}
                    <div className="p-6">
                        <textarea
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            placeholder="Вставьте текст переписки здесь..."
                            className="w-full h-40 p-4 rounded-xl bg-gray-50 border border-transparent focus:bg-white focus:border-purple-500 transition-all resize-none outline-none text-lg"
                        />
                        <div className="flex justify-between items-center mt-4">
                            <button className="text-gray-400 hover:text-purple-600 transition-colors p-2" title="Голосовой ввод (скоро)">
                                <Mic />
                            </button>
                            <button
                                onClick={handleAnalyze}
                                disabled={isAnalyzing || !text.trim()}
                                className={`flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-white transition-all ${isAnalyzing ? 'bg-gray-400 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700 hover:scale-105 active:scale-95'
                                    }`}
                            >
                                {isAnalyzing ? 'Анализирую...' : 'Проверить'}
                                {!isAnalyzing && <Send size={18} />}
                            </button>
                        </div>
                    </div>

                    {/* Result Area */}
                    {result && (
                        <div className={`p-6 sm:p-8 animate-fade-in ${result.score > 50 ? 'bg-red-50' : 'bg-green-50'}`}>
                            <div className="flex items-start gap-4">
                                <div className={`p-3 rounded-full ${result.score > 50 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                                    {result.score > 50 ? <ShieldAlert size={32} /> : <CheckCircle size={32} />}
                                </div>
                                <div>
                                    <h3 className={`text-2xl font-black mb-2 ${result.score > 50 ? 'text-red-700' : 'text-green-700'}`}>
                                        {result.verdict}
                                    </h3>
                                    <p className="text-gray-700 leading-relaxed mb-4">
                                        {result.advice}
                                    </p>
                                    <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                                        <div
                                            className={`h-2.5 rounded-full ${result.score > 50 ? 'bg-red-600' : 'bg-green-600'}`}
                                            style={{ width: `${result.score}%` }}
                                        ></div>
                                    </div>
                                    <p className="text-right text-xs font-bold mt-1 text-gray-500">
                                        Вероятность мошенничества: {result.score}%
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="text-center mt-8 text-gray-400 text-sm">
                    Наш AI обучен на тысячах реальных диалогов с мошенниками.
                </div>

            </div>
        </div>
    )
}
