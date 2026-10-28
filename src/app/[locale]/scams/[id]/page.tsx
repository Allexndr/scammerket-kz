'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ThumbsUp, ThumbsDown, User, Shield, AlertTriangle, ArrowLeft, Copy, Share2 } from 'lucide-react'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import AdSpace from '@/components/AdSpace'
import CommentsSection from '@/components/CommentsSection'
import { useToast } from '@/components/ToastProvider'

export const dynamic = 'force-dynamic'

interface ScamDetails {
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
    reportedBy: { name: string; rank: string }
    comments: any[]
    gender?: string
}

export default function ScamDetailsPage() {
    const { id } = useParams()
    const { showToast } = useToast()
    const [scam, setScam] = useState<ScamDetails | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        if (id) fetchScamDetails()
    }, [id])

    const fetchScamDetails = async () => {
        try {
            const res = await fetch(`/api/scams/${id}`)
            if (!res.ok) throw new Error('Failed to load')
            const data = await res.json()
            setScam(data)
        } catch (err) {
            setError('Отчет не найден или удален')
        } finally {
            setLoading(false)
        }
    }

    const handleVote = async (type: 'like' | 'dislike') => {
        try {
            const res = await fetch(`/api/scams/${id}/vote`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type })
            })
            if (res.ok) {
                const data = await res.json()
                setScam(prev => prev ? {
                    ...prev,
                    likes: data.likes,
                    dislikes: data.dislikes,
                    isVerified: data.isVerified
                } : null)
                showToast(type === 'like' ? 'Голос учтён' : 'Возражение учтено', 'success')
            } else {
                const err = await res.json()
                showToast(err.error || 'Ошибка голосования', 'error')
            }
        } catch (err) {
            console.error('Vote failed', err)
            showToast('Ошибка сети', 'error')
        }
    }

    if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Загрузка...</div>

    if (error || !scam) return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
            <AlertTriangle className="w-16 h-16 text-red-500 mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{error || 'Ошибка'}</h1>
            <Link href="/scams" className="text-blue-600 hover:underline">Вернуться к списку</Link>
        </div>
    )

    const verificationRate = scam.likes + scam.dislikes > 0
        ? Math.round((scam.likes / (scam.likes + scam.dislikes)) * 100)
        : 0

    // Dynamic SEO: update document title with phone number for search engines
    useEffect(() => {
        if (scam) {
            document.title = `${scam.phoneNumber} — ${scam.company} | Мошенник? | ScammerKetKz`
            const metaDesc = document.querySelector('meta[name="description"]')
            if (metaDesc) {
                metaDesc.setAttribute('content', `Номер ${scam.phoneNumber} (${scam.company}) — ${scam.scamType}, ${scam.region}. ${scam.description?.substring(0, 120)}`)
            }
            // Canonical link
            let canonical = document.querySelector('link[rel="canonical"]')
            if (!canonical) {
                canonical = document.createElement('link')
                canonical.setAttribute('rel', 'canonical')
                document.head.appendChild(canonical)
            }
            canonical.setAttribute('href', window.location.href)
            // OG tags
            const setMeta = (prop: string, content: string) => {
                let tag = document.querySelector(`meta[property="${prop}"]`)
                if (!tag) {
                    tag = document.createElement('meta')
                    tag.setAttribute('property', prop)
                    document.head.appendChild(tag)
                }
                tag.setAttribute('content', content)
            }
            setMeta('og:title', `${scam.phoneNumber} — ${scam.company} | Мошенник?`)
            setMeta('og:description', `Тип: ${scam.scamType}, Регион: ${scam.region}. ${scam.description?.substring(0, 100)}`)
            setMeta('og:type', 'article')
        }
    }, [scam])

    // JSON-LD structured data for SEO
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: `Мошенник: ${scam.company} — ${scam.phoneNumber}`,
        description: scam.description,
        datePublished: scam.createdAt,
        author: { '@type': 'Organization', name: 'ScammerKetKz' },
        publisher: { '@type': 'Organization', name: 'ScammerKetKz' },
        mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': typeof window !== 'undefined' ? window.location.href : ''
        },
        about: {
            '@type': 'Thing',
            name: `Телефонный мошенник ${scam.phoneNumber}`,
            description: `${scam.company} — ${scam.scamType}, ${scam.region}`
        },
        keywords: `${scam.phoneNumber}, мошенник, ${scam.company}, ${scam.scamType}, ${scam.region}, Казахстан`
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <div className="container mx-auto px-4 max-w-4xl">
                <Link href="/scams" className="inline-flex items-center text-gray-500 hover:text-gray-900 mb-6">
                    <ArrowLeft size={20} className="mr-2" />
                    Назад к списку
                </Link>

                <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                    {/* Header */}
                    <div className="p-6 md:p-8 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 mb-2">{scam.company}</h1>
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-lg font-mono bg-gray-200 px-3 py-1 rounded text-gray-800">
                                        {scam.phoneNumber}
                                    </span>
                                    <button
                                        onClick={() => {
                                            navigator.clipboard.writeText(scam.phoneNumber)
                                            showToast('Номер скопирован', 'success')
                                        }}
                                        className="p-1.5 text-gray-400 hover:text-[#A6845B] transition-colors"
                                        title="Скопировать номер"
                                    >
                                        <Copy className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => {
                                            const text = `⚠️ Мошенник: ${scam.phoneNumber} (${scam.company}) — проверьте на scammerket.kz`
                                            if (navigator.share) {
                                                navigator.share({ title: 'Мошенник', text, url: window.location.href })
                                            } else {
                                                navigator.clipboard.writeText(text + ' ' + window.location.href)
                                                showToast('Ссылка скопирована', 'success')
                                            }
                                        }}
                                        className="p-1.5 text-gray-400 hover:text-[#A6845B] transition-colors"
                                        title="Поделиться"
                                    >
                                        <Share2 className="w-4 h-4" />
                                    </button>
                                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                                        {scam.scamType}
                                    </span>
                                </div>
                            </div>

                            <div className="flex flex-col items-end">
                                <div className={`px-4 py-2 rounded-lg text-lg font-bold mb-2 ${verificationRate >= 70 ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                                    }`}>
                                    {verificationRate}% Индекс риска
                                </div>
                                <div className="text-sm text-gray-500">
                                    {scam.likes} подтверждений / {scam.dislikes} опровержений
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Body */}
                    <div className="p-6 md:p-8">
                        <div className="prose max-w-none text-gray-700 text-lg leading-relaxed mb-8">
                            {scam.description}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-gray-600 border-t border-gray-100 pt-6">
                            <div>
                                <strong className="block text-gray-900 mb-1">Регион</strong>
                                {scam.region}
                            </div>
                            <div>
                                <strong className="block text-gray-900 mb-1">Пол звонившего</strong>
                                {scam.gender === 'male' ? 'Мужской' : scam.gender === 'female' ? 'Женский' : 'Неизвестно'}
                            </div>
                            <div>
                                <strong className="block text-gray-900 mb-1">Добавлено</strong>
                                {format(new Date(scam.createdAt), 'dd MMMM yyyy, HH:mm', { locale: ru })}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-wrap gap-4 mt-8 pt-8 border-t border-gray-100">
                            <button
                                onClick={() => handleVote('like')}
                                className="flex-1 bg-red-50 hover:bg-red-100 text-red-700 py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-colors font-medium border border-red-200"
                            >
                                <ThumbsUp size={20} />
                                Подозрительный ({scam.likes})
                            </button>
                            <button
                                onClick={() => handleVote('dislike')}
                                className="flex-1 bg-green-50 hover:bg-green-100 text-green-700 py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-colors font-medium border border-green-200"
                            >
                                <ThumbsDown size={20} />
                                Это ошибка ({scam.dislikes})
                            </button>
                        </div>
                    </div>

                    {/* Footer / User Info */}
                    <div className="bg-gray-50 p-4 border-t border-gray-200 flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2 text-gray-600">
                            <User size={16} />
                            Автор: <span className="font-medium text-gray-900">{scam.reportedBy?.name || 'Аноним'}</span>
                            <span className="text-gray-400">•</span>
                            <span className="text-blue-600">{scam.reportedBy?.rank || 'Новичок'}</span>
                        </div>
                        <div className="flex items-center gap-1 text-gray-500">
                            <Shield size={14} className="text-green-500" />
                            <span>ID: {scam._id.slice(-6)}</span>
                        </div>
                    </div>
                </div>

                <AdSpace type="native" className="my-8" />

                {/* Comments Section */}
                <div className="mt-8">
                    <CommentsSection scamId={scam._id} />
                </div>
            </div>
        </div>
    )
}
