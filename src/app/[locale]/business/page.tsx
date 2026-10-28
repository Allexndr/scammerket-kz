'use client'

import { Shield, Lock, Zap, CheckCircle, Code } from 'lucide-react'

export default function BusinessPage() {
    return (
        <div className="min-h-screen pt-28 pb-20 px-4 animate-fade-in">
            <div className="container mx-auto max-w-5xl">

                {/* Header */}
                <div className="text-center mb-16">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider mb-6">
                        ScammerKet API v1.0
                    </div>
                    <h1 className="text-4xl sm:text-6xl font-black mb-6 text-[#111111] leading-tight">
                        Защитите своих клиентов <br />
                        <span className="text-blue-600">на уровне транзакции</span>
                    </h1>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
                        Интегрируйте проверку номеров в свой бизнес-процесс. Банки, маркетплейсы и службы доставки используют наш API для снижения рисков.
                    </p>
                    <div className="flex justify-center gap-4">
                        <button className="bg-[#111111] text-white px-8 py-4 rounded-xl font-bold hover:bg-gray-900 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1">
                            Получить API Key
                        </button>
                        <button className="bg-white text-[#111111] border border-gray-200 px-8 py-4 rounded-xl font-bold hover:bg-gray-50 transition-all">
                            Читать документацию
                        </button>
                    </div>
                </div>

                {/* Features Grid */}
                <div className="grid md:grid-cols-3 gap-8 mb-20">
                    {[
                        { icon: Zap, title: "Мгновенный ответ", desc: "Среднее время ответа API < 50ms. Не замедляет ваши процессы." },
                        { icon: Shield, title: "База 1M+ номеров", desc: "Агрегируем данные из 50+ источников, включая международные реестры." },
                        { icon: Lock, title: "Банковский уровень", desc: "Шифрование SSL/TLS. Соответствие 152-ФЗ и GDPR." }
                    ].map((feature, i) => (
                        <div key={i} className="bg-white p-8 rounded-2xl border border-gray-200 hover:border-blue-200 hover:shadow-lg transition-all">
                            <div className="bg-blue-50 w-12 h-12 rounded-xl flex items-center justify-center mb-4 text-blue-600">
                                <feature.icon />
                            </div>
                            <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                            <p className="text-gray-500">{feature.desc}</p>
                        </div>
                    ))}
                </div>

                {/* Code Example */}
                <div className="bg-[#1E1E1E] rounded-2xl overflow-hidden shadow-2xl mb-20">
                    <div className="flex items-center gap-2 px-6 py-4 border-b border-gray-700 bg-[#252526]">
                        <div className="w-3 h-3 rounded-full bg-red-500" />
                        <div className="w-3 h-3 rounded-full bg-yellow-500" />
                        <div className="w-3 h-3 rounded-full bg-green-500" />
                        <span className="ml-4 text-sm text-gray-400 font-mono">example.js</span>
                    </div>
                    <div className="p-6 md:p-8 overflow-x-auto">
                        <pre className="font-mono text-sm leading-relaxed">
                            <code className="text-gray-300">
                                {`const response = await fetch('https://api.scammerket.kz/v1/check', {
    method: 'POST',
    headers: {
        'Authorization': 'Bearer YOUR_API_KEY',
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        phone: '+77771234567'
    })
});

const data = await response.json();

if (data.risk_score > 0.8) {
    console.warn('⚠️ Высокий риск мошенничества:', data.details);
    blockTransaction();
}`}
                            </code>
                        </pre>
                    </div>
                </div>

                {/* Trust Badges */}
                <div className="text-center">
                    <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-8">Компании, которые нам доверяют</p>
                    <div className="flex flex-wrap justify-center gap-12 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
                        {/* Mock Logos - Text for now */}
                        <span className="text-2xl font-black text-gray-800">Kaspi.kz</span>
                        <span className="text-2xl font-black text-gray-800">Halyk</span>
                        <span className="text-2xl font-black text-gray-800">OLX</span>
                        <span className="text-2xl font-black text-gray-800">Kolesa</span>
                    </div>
                </div>

            </div>
        </div>
    )
}
