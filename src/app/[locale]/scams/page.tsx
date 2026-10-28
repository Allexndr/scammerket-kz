'use client'

import { useState, useEffect } from 'react'
import { Search, Shield, AlertTriangle, ChevronRight, User, Copy } from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import AdSpace from '@/components/AdSpace'
import DisclaimerBanner from '@/components/DisclaimerBanner'

interface ScamRecord {
    _id: string
    phoneNumber: string
    company: string
    scamType: string
    region: string
    description: string
    likes: number
    dislikes: number
    isVerified: boolean
    createdAt: string
}

export default function ScamsPage() {
    const [scams, setScams] = useState<ScamRecord[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')

    useEffect(() => {
        fetchScams()
    }, [])

    const fetchScams = async () => {
        try {
            const res = await fetch('/api/scams')
            if (res.ok) {
                const data = await res.json()
                // API returns { scams: [], pagination: {} }
                setScams(Array.isArray(data.scams) ? data.scams : [])
            }
        } catch (e) {
            console.error('Failed to fetch scams', e)
        } finally {
            setLoading(false)
        }
    }

    const filteredScams = scams.filter(s =>
        s.phoneNumber?.includes(search) ||
        s.company?.toLowerCase().includes(search.toLowerCase())
    )

    return (
        <div className="min-h-screen pt-24 pb-16 px-4 bg-[#F9F9F7]">
            <div className="container mx-auto max-w-5xl">
                <div className="text-center mb-10">
                    <h1 className="text-4xl sm:text-5xl font-black mb-4 text-[#111111]">База отзывов</h1>
                    <p className="text-[#666666] text-lg">Единый реестр подтвержденных сообщений о нарушениях</p>
                </div>

                {/* Legal Disclaimer */}
                <DisclaimerBanner />

                {/* Search Bar */}
                <div className="relative mb-12 max-w-2xl mx-auto shadow-sm group">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 w-6 h-6 transition-colors group-focus-within:text-[#A6845B]" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Поиск по номеру или компании..."
                        className="w-full pl-16 pr-6 py-5 rounded-2xl border border-[#E0E0D8] bg-white text-xl outline-none focus:border-[#A6845B] transition-all"
                    />
                </div>

                {/* List */}
                <div className="space-y-4">
                    {loading ? (
                        <div className="flex flex-col gap-4">
                            {[1, 2, 3, 4, 5].map(i => (
                                <div key={i} className="h-32 bg-gray-100 animate-pulse rounded-2xl border border-gray-200"></div>
                            ))}
                        </div>
                    ) : filteredScams.length === 0 ? (
                        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-[#E0E0D8]">
                            <Shield className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                            <p className="text-gray-400 text-lg mb-2">Ничего не найдено или база пуста.</p>
                            <p className="text-gray-400 text-sm mb-6">Станьте первым, кто сообщит о мошеннике!</p>
                            <a href="/report" className="btn-primary px-8 py-3 inline-block">
                                Сообщить о номере
                            </a>
                        </div>
                    ) : (
                        filteredScams.map((scam, idx) => (
                            <div key={scam._id}>
                            {(idx === 3) && <AdSpace type="native" />}
                            <Link
                                key={scam._id}
                                href={`/scams/${scam._id}`}
                                className="block group bg-white border border-[#E0E0D8] p-6 rounded-2xl hover:border-[#A6845B] hover:shadow-xl transition-all"
                            >
                                <div className="flex flex-col md:flex-row justify-between gap-4">
                                    <div className="flex gap-4">
                                        <div className={`w-14 h-14 rounded-xl flex items-center justify-center shrink-0 ${scam.isVerified ? 'bg-red-50 text-red-600' : 'bg-gray-50 text-gray-400'
                                            }`}>
                                            <Shield className="w-7 h-7" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="text-xl font-bold text-[#111111] font-mono">{scam.phoneNumber}</h3>
                                                <button
                                                    onClick={(e) => {
                                                        e.preventDefault()
                                                        navigator.clipboard.writeText(scam.phoneNumber)
                                                    }}
                                                    className="text-gray-300 hover:text-[#A6845B] transition-colors"
                                                    title="Скопировать номер"
                                                >
                                                    <Copy className="w-4 h-4" />
                                                </button>
                                                {scam.isVerified && (
                                                    <span className="bg-red-100 text-red-700 text-[10px] font-black uppercase px-2 py-0.5 rounded tracking-tighter">
                                                        Подтверждено
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-[#A6845B] font-medium mb-2">{scam.company}</p>
                                            <p className="text-sm text-gray-500 line-clamp-1">{scam.description}</p>
                                        </div>
                                    </div>

                                    <div className="flex md:flex-col justify-between items-end gap-2 border-t md:border-t-0 pt-4 md:pt-0 border-gray-100">
                                        <div className="flex items-center gap-4">
                                            <div className="text-right">
                                                <div className="text-sm font-bold text-[#111111]">{scam.likes}</div>
                                                <div className="text-[10px] uppercase text-gray-400 font-bold">Очков</div>
                                            </div>
                                            <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-[#A6845B] transition-colors" />
                                        </div>
                                        <div className="text-[10px] text-gray-400 uppercase font-mono" suppressHydrationWarning>
                                            {format(new Date(scam.createdAt), 'dd.MM.yyyy')}
                                        </div>
                                    </div>
                                </div>
                            </Link>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    )
}
