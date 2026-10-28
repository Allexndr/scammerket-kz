'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import {
  ThumbsUp, ThumbsDown, ArrowLeft, AlertTriangle, ExternalLink,
  MessageSquare, Send, Shield, Copy, Share2
} from 'lucide-react'
import { useToast } from '@/components/ToastProvider'
import { useUser } from '@/context/UserContext'
import { useRouter } from 'next/navigation'

interface SocialScamDetail {
  _id: string
  platform: string
  platformType: string
  category: string
  username: string
  profileUrl: string
  displayName: string
  description: string
  region: string
  amountScammed?: number
  tags: string[]
  victimsCount: number
  likes: number
  dislikes: number
  isVerified: boolean
  reportedBy?: { name: string; rank: string }
  createdAt: string
  comments: {
    _id?: string
    userId: string
    userName: string
    text: string
    createdAt: string
  }[]
}

const PLATFORM_COLORS: Record<string, string> = {
  instagram: '#E1306C', telegram: '#0088cc', tiktok: '#000000',
  whatsapp: '#25D366', threads: '#000000', youtube: '#FF0000',
  facebook: '#1877F2', kaspi: '#F14635', satu: '#FF6B35',
  olx: '#002B5C', market: '#7B2CBF', flip: '#FF5722', other: '#888888',
}

const CATEGORY_LABELS: Record<string, string> = {
  shop: 'Магазин', freelancer: 'Исполнитель', seller: 'Продавец',
  blogger: 'Блогер', other: 'Другое',
}

function formatAmount(amount?: number) {
  if (!amount || amount === 0) return null
  if (amount >= 1000000) return `${(amount / 1000000).toFixed(1)} млн ₸`
  if (amount >= 1000) return `${(amount / 1000).toFixed(0)}K ₸`
  return `${amount} ₸`
}

export default function SocialScamDetailPage() {
  const { id } = useParams()
  const { showToast } = useToast()
  const { user } = useUser()
  const router = useRouter()
  const [scam, setScam] = useState<SocialScamDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [newComment, setNewComment] = useState('')
  const [submittingComment, setSubmittingComment] = useState(false)

  useEffect(() => {
    if (id) fetchDetail()
  }, [id])

  const fetchDetail = async () => {
    try {
      const res = await fetch(`/api/social-scams/${id}`)
      if (!res.ok) throw new Error('Failed')
      const data = await res.json()
      setScam(data)
    } catch (e) {
      setError('Запись не найдена')
    } finally {
      setLoading(false)
    }
  }

  const handleVote = async (type: 'like' | 'dislike') => {
    try {
      const res = await fetch(`/api/social-scams/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type }),
      })
      if (res.ok) {
        const data = await res.json()
        setScam(prev => prev ? {
          ...prev, likes: data.likes, dislikes: data.dislikes,
          victimsCount: data.victimsCount, isVerified: data.isVerified,
        } : null)
        showToast(type === 'like' ? 'Подтверждено' : 'Возражение учтено', 'success')
      } else {
        const err = await res.json()
        showToast(err.error || 'Ошибка', 'error')
      }
    } catch (e) {
      showToast('Ошибка сети', 'error')
    }
  }

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      showToast('Войдите, чтобы оставить комментарий', 'info')
      router.push('/?view=login')
      return
    }
    if (!newComment.trim()) return

    setSubmittingComment(true)
    try {
      const res = await fetch(`/api/social-scams/${id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: newComment }),
      })
      if (res.ok) {
        const saved = await res.json()
        setScam(prev => prev ? {
          ...prev,
          comments: [saved, ...(prev.comments || [])],
        } : null)
        setNewComment('')
        showToast('Комментарий добавлен', 'success')
      } else {
        const err = await res.json()
        showToast(err.error || 'Ошибка', 'error')
      }
    } catch (e) {
      showToast('Ошибка сети', 'error')
    } finally {
      setSubmittingComment(false)
    }
  }

  // Dynamic SEO
  useEffect(() => {
    if (scam) {
      document.title = `${scam.displayName} (@${scam.username}) — ${scam.platform} | Реестр мошенников | ScammerKetKz`
    }
  }, [scam])

  if (loading) return <div className="min-h-screen pt-32 text-center text-gray-400">Загрузка...</div>

  if (error || !scam) return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <AlertTriangle className="w-16 h-16 text-red-500 mb-4" />
      <h1 className="text-2xl font-bold text-gray-900 mb-2">{error || 'Ошибка'}</h1>
      <Link href="/registry" className="text-blue-600 hover:underline">Вернуться к реестру</Link>
    </div>
  )

  const verificationRate = scam.likes + scam.dislikes > 0
    ? Math.round((scam.likes / (scam.likes + scam.dislikes)) * 100)
    : 0

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <Link href="/registry" className="inline-flex items-center text-gray-500 hover:text-gray-900 mb-6">
          <ArrowLeft size={20} className="mr-2" />
          Назад к реестру
        </Link>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 md:p-8 border-b border-gray-100">
                <div className="flex items-center gap-2 mb-4">
                  <span
                    className="px-3 py-1 rounded text-xs font-black uppercase text-white"
                    style={{ backgroundColor: PLATFORM_COLORS[scam.platform] || '#888' }}
                  >
                    {scam.platform}
                  </span>
                  <span className="text-xs text-gray-400 uppercase font-bold">
                    {CATEGORY_LABELS[scam.category] || scam.category}
                  </span>
                  {scam.isVerified && (
                    <span className="bg-red-100 text-red-700 text-xs font-black uppercase px-2 py-1 rounded">
                      Подтверждён
                    </span>
                  )}
                </div>

                <h1 className="text-3xl font-bold text-gray-900 mb-2">{scam.displayName}</h1>
                <div className="flex items-center gap-3 flex-wrap mb-4">
                  <span className="text-lg font-mono bg-gray-100 px-3 py-1 rounded text-gray-700">
                    @{scam.username}
                  </span>
                  <button
                    onClick={() => { navigator.clipboard.writeText(scam.username); showToast('Ник скопирован', 'success') }}
                    className="text-gray-400 hover:text-[#A6845B]"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <a href={scam.profileUrl} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-[#A6845B] hover:underline">
                    <ExternalLink className="w-4 h-4" /> Открыть профиль
                  </a>
                  <button
                    onClick={() => {
                      const text = `⚠️ Мошенник @${scam.username} (${scam.platform}) — проверьте на scammerket.kz`
                      if (navigator.share) {
                        navigator.share({ title: 'Мошенник', text, url: window.location.href })
                      } else {
                        navigator.clipboard.writeText(text + ' ' + window.location.href)
                        showToast('Ссылка скопирована', 'success')
                      }
                    }}
                    className="text-gray-400 hover:text-[#A6845B]"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Tags */}
                {scam.tags?.length > 0 && (
                  <div className="flex gap-1 flex-wrap mb-4">
                    {scam.tags.map((tag, i) => (
                      <span key={i} className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="p-6 md:p-8">
                <h2 className="text-sm font-bold text-gray-400 uppercase mb-3">Описание</h2>
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{scam.description}</p>

                {scam.region && scam.region !== 'other' && (
                  <p className="mt-4 text-sm text-gray-500">Регион: {scam.region}</p>
                )}
                {formatAmount(scam.amountScammed) && (
                  <p className="mt-1 text-sm text-[#C06C5F] font-bold">
                    Ущерб: от {formatAmount(scam.amountScammed)}
                  </p>
                )}
                <p className="mt-2 text-xs text-gray-400">
                  Добавлено: {scam.createdAt ? format(new Date(scam.createdAt), 'd MMM yyyy, HH:mm', { locale: ru }) : ''}
                </p>
              </div>
            </div>

            {/* Comments */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-[#A6845B]" />
                Комментарии ({scam.comments?.length || 0})
              </h3>

              <form onSubmit={handleComment} className="mb-8">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder={user ? 'Напишите комментарий...' : 'Войдите, чтобы оставить комментарий'}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 min-h-[100px] outline-none focus:border-[#A6845B] transition-colors resize-none"
                  disabled={submittingComment}
                />
                <div className="flex justify-between items-center mt-3">
                  <span className="text-xs text-gray-400">Виден всем</span>
                  <button
                    type="submit"
                    disabled={submittingComment || !newComment.trim()}
                    className="bg-[#111111] text-white px-5 py-2 rounded-lg font-bold hover:bg-[#2a2a2a] disabled:opacity-50 flex items-center gap-2"
                  >
                    {submittingComment ? 'Отправка...' : 'Отправить'} <Send className="w-4 h-4" />
                  </button>
                </div>
              </form>

              <div className="space-y-4">
                {(scam.comments || []).map((comment, i) => (
                  <div key={comment._id || i} className="group">
                    <div className="flex justify-between items-start mb-1">
                      <div className="font-bold text-[#111111] text-sm">{comment.userName}</div>
                      <div className="text-xs text-gray-400">
                        {comment.createdAt ? format(new Date(comment.createdAt), 'd MMM yyyy, HH:mm', { locale: ru }) : ''}
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm leading-relaxed bg-gray-50 p-3 rounded-xl rounded-tl-none">
                      {comment.text}
                    </p>
                  </div>
                ))}
                {(!scam.comments || scam.comments.length === 0) && (
                  <div className="text-center py-6 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                    <p className="text-gray-400 text-sm">Пока нет комментариев. Будьте первым!</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar — stats + vote */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-24">
              <h3 className="text-sm font-bold text-gray-400 uppercase mb-4">Статистика</h3>

              {/* Risk score */}
              <div className={`p-4 rounded-xl mb-4 text-center ${verificationRate >= 70 ? 'bg-red-50' : 'bg-yellow-50'}`}>
                <div className={`text-3xl font-black ${verificationRate >= 70 ? 'text-red-600' : 'text-yellow-600'}`}>
                  {verificationRate}%
                </div>
                <div className="text-xs text-gray-500 mt-1">Индекс риска</div>
              </div>

              {/* Victims */}
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <span className="flex items-center gap-2 text-sm text-gray-600">
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                  Пострадавших
                </span>
                <span className="font-bold text-red-600">{scam.victimsCount}</span>
              </div>

              {/* Likes */}
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <span className="flex items-center gap-2 text-sm text-gray-600">
                  <ThumbsUp className="w-4 h-4 text-green-500" />
                  Подтверждений
                </span>
                <span className="font-bold text-gray-700">{scam.likes}</span>
              </div>

              {/* Dislikes */}
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <span className="flex items-center gap-2 text-sm text-gray-600">
                  <ThumbsDown className="w-4 h-4 text-gray-400" />
                  Возражений
                </span>
                <span className="font-bold text-gray-700">{scam.dislikes}</span>
              </div>

              {/* Vote buttons */}
              <div className="mt-4 space-y-2">
                <button
                  onClick={() => handleVote('like')}
                  className="w-full py-3 bg-green-50 text-green-700 rounded-xl font-bold hover:bg-green-100 transition-colors flex items-center justify-center gap-2"
                >
                  <ThumbsUp className="w-4 h-4" />
                  Тоже пострадал
                </button>
                <button
                  onClick={() => handleVote('dislike')}
                  className="w-full py-3 bg-gray-100 text-gray-500 rounded-xl font-bold hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                >
                  <ThumbsDown className="w-4 h-4" />
                  Не согласен
                </button>
              </div>

              {/* Reporter */}
              {scam.reportedBy && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-xs text-gray-400">
                    Добавил: <span className="font-bold text-gray-600">{(scam.reportedBy as any).name || 'Аноним'}</span>
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
