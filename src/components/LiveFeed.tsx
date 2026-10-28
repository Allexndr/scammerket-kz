'use client'

import { useState, useEffect } from 'react'
import { Activity, ArrowRight } from 'lucide-react'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'

interface FeedItem {
    _id: string
    phoneNumber: string
    company: string
    scamType: string
    description: string
    createdAt: string
    isVerified: boolean
}

export default function LiveFeed() {
    const [items, setItems] = useState<FeedItem[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchFeed()
    }, [])

    const fetchFeed = async () => {
        try {
            const res = await fetch('/api/scams?sort=createdAt&order=desc&limit=5')
            if (res.ok) {
                const data = await res.json()
                const feedItems = (data.scams || []).map((s: any) => ({
                    _id: s._id,
                    phoneNumber: s.phoneNumber,
                    company: s.company,
                    scamType: s.scamType,
                    description: s.description,
                    createdAt: s.createdAt,
                    isVerified: s.isVerified
                }))
                setItems(feedItems)
            }
        } catch (e) {
            console.error('LiveFeed error:', e)
        } finally {
            setLoading(false)
        }
    }

    const typeLabels: Record<string, string> = {
        phishing: 'Фишинг',
        vishing: 'Вишинг',
        smishing: 'СМС-мошенничество',
        impersonation: 'Подмена личности',
        investment: 'Инвестиции',
        loan: 'Кредиты',
        crypto: 'Крипто',
        fake_sale: 'Фейковая продажа',
        fake_shop: 'Поддельный магазин',
        rental: 'Аренда',
        prize: 'Ложный выигрыш',
        other: 'Другое'
    }

    if (loading) {
        return (
            <div className="bg-white rounded-2xl border border-[#E0E0D8] p-6">
                <div className="flex items-center gap-2 mb-4">
                    <Activity className="w-5 h-5 text-[#A6845B] animate-pulse" />
                    <h3 className="text-lg font-bold text-[#111111]">Свежие отчёты</h3>
                </div>
                <div className="space-y-3">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-16 bg-gray-100 animate-pulse rounded-xl"></div>
                    ))}
                </div>
            </div>
        )
    }

    if (items.length === 0) return null

    return (
        <div className="bg-white rounded-2xl border border-[#E0E0D8] p-6">
            <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <Activity className="w-5 h-5 text-[#A6845B]" />
                        <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                    </div>
                    <h3 className="text-lg font-bold text-[#111111]">Свежие отчёты</h3>
                </div>
                <a href="/scams" className="text-xs font-bold text-[#A6845B] hover:underline flex items-center gap-1">
                    Все записи <ArrowRight className="w-3 h-3" />
                </a>
            </div>

            <div className="space-y-3">
                {items.map((item) => (
                    <a
                        key={item._id}
                        href={`/scams/${item._id}`}
                        className="block group p-4 bg-[#F9F9F7] rounded-xl border border-[#E0E0D8] hover:border-[#A6845B] transition-all"
                    >
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <span className="font-mono text-sm font-bold text-[#111111]">
                                    {item.phoneNumber}
                                </span>
                                {item.isVerified && (
                                    <span className="w-2 h-2 bg-red-500 rounded-full" title="Подтверждено"></span>
                                )}
                            </div>
                            <span className="text-[10px] text-gray-400 font-mono" suppressHydrationWarning>
                                {format(new Date(item.createdAt), 'd MMM, HH:mm', { locale: ru })}
                            </span>
                        </div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-bold text-[#A6845B]">{item.company}</span>
                            <span className="text-[10px] px-2 py-0.5 bg-gray-100 rounded-full text-gray-500 font-medium">
                                {typeLabels[item.scamType] || item.scamType}
                            </span>
                        </div>
                        <p className="text-xs text-gray-500 line-clamp-1 group-hover:text-gray-700 transition-colors">
                            {item.description}
                        </p>
                    </a>
                ))}
            </div>
        </div>
    )
}
