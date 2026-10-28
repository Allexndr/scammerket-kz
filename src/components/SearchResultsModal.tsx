'use client'

import { useEffect, useState } from 'react'
import { X, Shield, AlertTriangle, CheckCircle2, Search, ArrowRight, ExternalLink, Share2, Copy, MessageCircle, ThumbsUp } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import { useUser } from '@/context/UserContext'
import { useToast } from '@/components/ToastProvider'

export default function SearchResultsModal({ onClose }: { onClose: () => void }) {
    const searchParams = useSearchParams()
    const query = searchParams.get('q') || ''
    const type = searchParams.get('type') || 'phone'

    const [results, setResults] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [expandedId, setExpandedId] = useState<string | null>(null)
    const { isLoggedIn } = useUser()
    const { showToast } = useToast()
    const [copiedId, setCopiedId] = useState<string | null>(null)

    const getRiskLevel = (scam: any) => {
        const totalVotes = (scam.likes || 0) + (scam.dislikes || 0)
        if (totalVotes === 0) return { level: 'unknown', color: '#888', bg: '#F0F0EB', label: 'НОВЫЙ', icon: Shield }
        const rate = (scam.likes / totalVotes) * 100
        if (rate >= 70) return { level: 'high', color: '#C06C5F', bg: '#FDF2F0', label: 'ВЫСОКАЯ УГРОЗА', icon: AlertTriangle }
        if (rate >= 40) return { level: 'medium', color: '#E6B89C', bg: '#FEF6F0', label: 'ПОДОЗРИТЕЛЬНО', icon: Shield }
        return { level: 'low', color: '#8A9A5B', bg: '#F4F6EE', label: 'НЕ ПРОВЕРЕНО', icon: CheckCircle2 }
    }

    const handleShare = async (scam: any, platform: 'telegram' | 'whatsapp' | 'copy') => {
        const id = scam._id || scam.id
        const url = `${window.location.origin}/scams/${id}`
        const text = `⚠️ Проверка номера на ScammerKetKz: ${scam.phoneNumber || scam.phone} — ${scam.company}`

        if (platform === 'telegram') {
            window.open(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, '_blank')
        } else if (platform === 'whatsapp') {
            window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`, '_blank')
        } else if (platform === 'copy') {
            try {
                await navigator.clipboard.writeText(url)
                setCopiedId(id)
                setTimeout(() => setCopiedId(null), 2000)
            } catch (e) {
                console.error('Copy failed', e)
            }
        }
    }

    const handleQuickConfirm = async (id: string) => {
        try {
            const res = await fetch(`/api/scams/${id}/vote`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: 'like' })
            })
            if (res.ok) {
                const data = await res.json()
                setResults(prev => prev.map(scam => {
                    if (scam._id === id || scam.id === id) {
                        return { ...scam, likes: data.likes, dislikes: data.dislikes, isVerified: data.isVerified }
                    }
                    return scam
                }))
                showToast('Ваш голос учтён', 'success')
            } else {
                const err = await res.json()
                showToast(err.error || 'Ошибка', 'error')
            }
        } catch (e) {
            console.error('Quick confirm error:', e)
            showToast('Ошибка сети', 'error')
        }
    }

    useEffect(() => {
        const fetchResults = async () => {
            setLoading(true)
            try {
                const res = await fetch(`/api/search?q=${encodeURIComponent(query)}&type=${type}`)
                const data = await res.json()
                // Ensure default values for likes/dislikes and normalize ID
                const normalizedResults = (data.results || []).map((r: any) => ({
                    ...r,
                    id: r._id || r.id,
                    likes: r.likes || 0,
                    dislikes: r.dislikes || 0
                }))
                setResults(normalizedResults)
            } catch (err) {
                console.error(err)
            } finally {
                setLoading(false)
            }
        }
        if (query) fetchResults()
    }, [query, type])

    const handleVote = async (id: string, isLike: boolean) => {
        if (!isLoggedIn) {
            showToast('Войдите, чтобы голосовать', 'info')
            return
        }

        try {
            const res = await fetch(`/api/scams/${id}/vote`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: isLike ? 'like' : 'dislike' })
            })

            if (res.ok) {
                const data = await res.json()
                setResults(prev => prev.map(scam => {
                    if (scam._id === id || scam.id === id) {
                        return {
                            ...scam,
                            likes: data.likes,
                            dislikes: data.dislikes,
                            isVerified: data.isVerified
                        }
                    }
                    return scam
                }))
                showToast(isLike ? 'Голос «Верю» учтён' : 'Голос «Ложь» учтён', 'success')
            } else {
                const err = await res.json()
                showToast(err.error || 'Ошибка при голосовании', 'error')
            }
        } catch (err) {
            console.error('Vote error:', err)
            showToast('Ошибка сети при голосовании', 'error')
        }
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in text-[#111111]">
            <div className="bg-[#F9F9F7] w-full max-w-4xl rounded-2xl sm:rounded-none border-2 border-black shadow-2xl max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="bg-[#111111] p-6 text-white flex items-center justify-between border-b-4 border-[#A6845B]">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-[#A6845B]/20 border border-[#A6845B]">
                            <Search className="w-6 h-6 text-[#A6845B]" />
                        </div>
                        <div>
                            <h2 className="text-xl font-serif font-bold uppercase tracking-tight">🔎 Результаты проверки</h2>
                            <p className="text-[10px] text-[#A6845B] uppercase font-bold tracking-[0.2em]">Протокол безопасности ScammerKetKz</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Sub-header with query info */}
                <div className="bg-white border-b border-[#E0E0E0] px-8 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-gray-400 uppercase">Объект проверки:</span>
                        <span className="text-sm font-mono font-black bg-[#F0F0EB] px-4 py-1 border border-black shadow-[2px_2px_0_0_#A6845B]">{query}</span>
                    </div>
                    <div className="text-xs font-black text-[#A6845B] uppercase tracking-wider">Найдено записей: {results.length}</div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 sm:p-10 space-y-8 bg-[url('/paper-texture.png')]">
                    {loading ? (
                        <div className="space-y-6">
                            {[1, 2].map(i => (
                                <div key={i} className="h-40 bg-gray-100 animate-pulse border-2 border-black/5"></div>
                            ))}
                        </div>
                    ) : results.length > 0 ? (
                        results.map((scam, idx) => {
                            const id = scam._id || scam.id
                            const isExpanded = expandedId === id

                            return (
                                <div key={id} className="bg-white border-2 border-black p-8 relative group hover:shadow-[8px_8px_0_0_#111111] transition-all overflow-hidden">
                                    <div className="absolute top-0 right-0 w-20 h-8 bg-[#111111] flex items-center justify-center">
                                        <span className="text-[10px] font-black text-[#A6845B] uppercase tracking-widest italic">№ {(idx + 1).toString().padStart(3, '0')}</span>
                                    </div>

                                    {/* Risk Level Banner */}
                                    {(() => {
                                        const risk = getRiskLevel(scam)
                                        const RiskIcon = risk.icon
                                        return (
                                            <div className="mb-5 p-3 border-l-4 flex items-center gap-3" style={{ backgroundColor: risk.bg, borderColor: risk.color }}>
                                                <RiskIcon className="w-5 h-5" style={{ color: risk.color }} />
                                                <span className="text-xs font-black uppercase tracking-widest" style={{ color: risk.color }}>{risk.label}</span>
                                                <span className="ml-auto text-xs font-bold text-gray-400">
                                                    {scam.likes + scam.dislikes > 0 ? `${scam.likes + scam.dislikes} голосов` : 'Нет голосов'}
                                                </span>
                                            </div>
                                        )
                                    })()}

                                    <div className="flex flex-col md:flex-row gap-8">
                                        <div className="flex-1 space-y-5">
                                            <div className="flex items-center gap-4">
                                                <div className="text-3xl font-black font-mono tracking-tighter text-[#111111]">
                                                    {scam.phoneNumber || scam.phone}
                                                </div>
                                                {scam.isVerified && (
                                                    <div className="flex items-center gap-2 bg-[#8A9A5B] text-white px-3 py-1 text-[10px] font-black uppercase tracking-widest shadow-[3px_3px_0_0_#111111]">
                                                        LEGAL
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex items-center gap-3 bg-[#A6845B]/5 p-3 border-l-4 border-[#A6845B]">
                                                <Building2 className="w-5 h-5 text-[#A6845B]" />
                                                <span className="text-sm font-black text-[#111111] uppercase tracking-tight">{scam.company || 'Гос. сектор / Неизвестно'}</span>
                                            </div>

                                            <div className="relative">
                                                <p className={`text-sm text-[#444] leading-relaxed font-serif ${!isExpanded ? 'line-clamp-2' : ''}`}>
                                                    <span className="text-[#A6845B] font-black mr-2">»</span>
                                                    {scam.description}
                                                </p>
                                                {isExpanded && (
                                                    <div className="mt-4 p-4 bg-[#F9F9F7] border border-dashed border-[#A6845B] text-xs space-y-2">
                                                        <p className="font-bold uppercase tracking-widest text-[#A6845B]">Дополнительная спецификация:</p>
                                                        <p>• Метод воздействия: Психологическое давление / Подмена номера.</p>
                                                        <p>• Цель атаки: Получение реквизитов или прямой перевод средств.</p>
                                                        <p>• Рекомендация: Немедленное прекращение связи.</p>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Quick Actions Row */}
                                            <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-black/10">
                                                <button
                                                    onClick={() => handleQuickConfirm(id)}
                                                    className="flex items-center gap-2 px-4 py-2 bg-[#8A9A5B]/10 border border-[#8A9A5B]/30 rounded-lg text-xs font-bold text-[#8A9A5B] hover:bg-[#8A9A5B]/20 transition-all"
                                                >
                                                    <ThumbsUp className="w-4 h-4" />
                                                    Тоже звонили
                                                </button>
                                                <button
                                                    onClick={() => handleShare(scam, 'telegram')}
                                                    className="flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg text-xs font-bold text-blue-600 hover:bg-blue-100 transition-all"
                                                >
                                                    <MessageCircle className="w-4 h-4" />
                                                    Telegram
                                                </button>
                                                <button
                                                    onClick={() => handleShare(scam, 'whatsapp')}
                                                    className="flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-lg text-xs font-bold text-green-600 hover:bg-green-100 transition-all"
                                                >
                                                    <Share2 className="w-4 h-4" />
                                                    WhatsApp
                                                </button>
                                                <button
                                                    onClick={() => handleShare(scam, 'copy')}
                                                    className="flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-bold text-gray-600 hover:bg-gray-100 transition-all"
                                                >
                                                    {copiedId === id ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                                                    {copiedId === id ? 'Скопировано!' : 'Ссылка'}
                                                </button>
                                            </div>
                                        </div>

                                        <div className="md:w-56 flex flex-col justify-between gap-4 py-2">
                                            <button
                                                onClick={() => setExpandedId(isExpanded ? null : id)}
                                                className={`w-full py-4 text-[10px] font-black uppercase tracking-widest transition-all border-2 border-black flex items-center justify-center gap-3 ${isExpanded ? 'bg-[#111111] text-white' : 'hover:bg-[#111111] hover:text-white'
                                                    }`}
                                            >
                                                {isExpanded ? 'Закрыть протокол' : 'Подробности'}
                                                <ArrowRight className={`w-4 h-4 transform transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                                            </button>

                                            <div className="grid grid-cols-2 gap-3">
                                                <button
                                                    onClick={() => handleVote(id, true)}
                                                    className="group flex flex-col items-center justify-center bg-white border-2 border-black py-4 hover:bg-[#8A9A5B]/10 transition-colors"
                                                >
                                                    <span className="text-2xl font-black text-[#8A9A5B] mb-1">{scam.likes}</span>
                                                    <span className="text-[8px] uppercase font-black text-gray-400 group-hover:text-[#8A9A5B]">Я верю</span>
                                                </button>
                                                <button
                                                    onClick={() => handleVote(id, false)}
                                                    className="group flex flex-col items-center justify-center bg-white border-2 border-black py-4 hover:bg-[#C06C5F]/10 transition-colors"
                                                >
                                                    <span className="text-2xl font-black text-[#C06C5F] mb-1">{scam.dislikes}</span>
                                                    <span className="text-[8px] uppercase font-black text-gray-400 group-hover:text-[#C06C5F]">Это ложь</span>
                                                </button>
                                            </div>
                                            <p className="text-[8px] text-center text-gray-400 uppercase italic leading-tight">
                                                * Ваш голос влияет на глобальный уровень доверия к записи
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )
                        })
                    ) : (
                        <div className="text-center py-20 bg-white border border-dashed border-[#E0E0D8]">
                            <div className="w-20 h-20 bg-[#F0F0EB] rounded-full flex items-center justify-center mx-auto mb-6">
                                <Shield className="w-10 h-10 text-gray-300" />
                            </div>
                            <h3 className="text-xl font-bold text-[#111111] mb-2 font-serif">Запись не обнаружена</h3>
                            <p className="text-gray-500 max-w-sm mx-auto text-sm leading-relaxed">
                                В нашей базе по данному запросу записей не найдено. Однако это не гарантирует безопасность.
                                Если вы столкнулись с подозрительным звонком, пожалуйста, сообщите нам.
                            </p>
                            <button
                                onClick={() => { onClose(); window.location.href = '/?view=report' }}
                                className="mt-8 btn-primary px-8 py-3"
                            >
                                Сообщить о номере
                            </button>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="bg-[#F0F0EB] p-4 text-center border-t border-[#E0E0D8]">
                    <p className="text-[9px] uppercase tracking-[0.2em] font-bold text-[#888]" suppressHydrationWarning>
                        Данные предоставлены сообществом ScammerKetKz • {new Date().toLocaleDateString()}
                    </p>
                </div>
            </div>
        </div>
    )
}

function Building2({ className }: { className?: string }) {
    return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
}
