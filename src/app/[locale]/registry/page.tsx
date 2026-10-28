'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Search, Shield, AlertTriangle, MessageCircle, ThumbsUp, ThumbsDown,
  Instagram, Send, Youtube, Facebook, ShoppingBag, Store, User, TrendingUp,
  ChevronRight, Copy, ExternalLink, Filter, X
} from 'lucide-react'
import DisclaimerBanner from '@/components/DisclaimerBanner'
import { useToast } from '@/components/ToastProvider'

interface SocialScam {
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
  comments?: any[]
}

const PLATFORMS = [
  { value: '', label: 'Все платформы', icon: Filter },
  { value: 'instagram', label: 'Instagram', icon: Instagram, type: 'social' },
  { value: 'telegram', label: 'Telegram', icon: Send, type: 'social' },
  { value: 'tiktok', label: 'TikTok', icon: TrendingUp, type: 'social' },
  { value: 'whatsapp', label: 'WhatsApp', icon: MessageCircle, type: 'social' },
  { value: 'threads', label: 'Threads', icon: MessageCircle, type: 'social' },
  { value: 'youtube', label: 'YouTube', icon: Youtube, type: 'social' },
  { value: 'facebook', label: 'Facebook', icon: Facebook, type: 'social' },
  { value: 'kaspi', label: 'Kaspi.kz', icon: ShoppingBag, type: 'marketplace' },
  { value: 'satu', label: 'Satu.kz', icon: Store, type: 'marketplace' },
  { value: 'olx', label: 'OLX.kz', icon: ShoppingBag, type: 'marketplace' },
  { value: 'market', label: 'Market.kz', icon: Store, type: 'marketplace' },
  { value: 'flip', label: 'Flip.kz', icon: ShoppingBag, type: 'marketplace' },
]

const CATEGORIES = [
  { value: '', label: 'Все категории' },
  { value: 'shop', label: 'Магазин', icon: ShoppingBag },
  { value: 'freelancer', label: 'Исполнитель', icon: User },
  { value: 'seller', label: 'Продавец', icon: Store },
  { value: 'blogger', label: 'Блогер', icon: TrendingUp },
]

const SORTS = [
  { value: 'victims', label: 'Больше пострадавших' },
  { value: 'newest', label: 'Новые' },
  { value: 'likes', label: 'Больше подтверждений' },
  { value: 'verified', label: 'Подтверждённые' },
]

const PLATFORM_COLORS: Record<string, string> = {
  instagram: '#E1306C',
  telegram: '#0088cc',
  tiktok: '#000000',
  whatsapp: '#25D366',
  threads: '#000000',
  youtube: '#FF0000',
  facebook: '#1877F2',
  kaspi: '#F14635',
  satu: '#FF6B35',
  olx: '#002B5C',
  market: '#7B2CBF',
  flip: '#FF5722',
  other: '#888888',
}

const CATEGORY_LABELS: Record<string, string> = {
  shop: 'Магазин',
  freelancer: 'Исполнитель',
  seller: 'Продавец',
  blogger: 'Блогер',
  other: 'Другое',
}

function formatAmount(amount?: number) {
  if (!amount || amount === 0) return null
  if (amount >= 1000000) return `${(amount / 1000000).toFixed(1)} млн ₸`
  if (amount >= 1000) return `${(amount / 1000).toFixed(0)}K ₸`
  return `${amount} ₸`
}

export default function RegistryPage() {
  const { showToast } = useToast()
  const [scams, setScams] = useState<SocialScam[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const [filters, setFilters] = useState({
    platform: '',
    category: '',
    platformType: '',
    sort: 'victims',
    q: '',
  })

  const [showMobileFilters, setShowMobileFilters] = useState(false)

  useEffect(() => {
    fetchScams()
  }, [filters, page])

  const fetchScams = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filters.platform) params.set('platform', filters.platform)
      if (filters.category) params.set('category', filters.category)
      if (filters.platformType) params.set('platformType', filters.platformType)
      if (filters.sort) params.set('sort', filters.sort)
      if (filters.q) params.set('q', filters.q)
      params.set('page', String(page))
      params.set('limit', '20')

      const res = await fetch(`/api/social-scams?${params.toString()}`)
      const data = await res.json()
      setScams(data.results || [])
      setTotal(data.total || 0)
      setTotalPages(data.totalPages || 1)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const handleVote = async (id: string, type: 'like' | 'dislike') => {
    try {
      const res = await fetch(`/api/social-scams/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type }),
      })
      if (res.ok) {
        const data = await res.json()
        setScams(prev => prev.map(s => s._id === id ? {
          ...s, likes: data.likes, dislikes: data.dislikes,
          victimsCount: data.victimsCount, isVerified: data.isVerified
        } : s))
        showToast(type === 'like' ? 'Подтверждено' : 'Возражение учтено', 'success')
      } else {
        const err = await res.json()
        showToast(err.error || 'Ошибка', 'error')
      }
    } catch (e) {
      showToast('Ошибка сети', 'error')
    }
  }

  const activeFiltersCount = [filters.platform, filters.category, filters.platformType].filter(Boolean).length

  return (
    <div className="min-h-screen pt-24 pb-20 px-4 bg-[#F9F9F7]">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl sm:text-5xl font-black text-[#111111] mb-3">
            Реестр мошенников
          </h1>
          <p className="text-gray-500 text-lg">
            Соцсети и маркетплейсы — проверяйте продавцов, исполнителей и магазины
          </p>
        </div>

        <DisclaimerBanner />

        {/* CTA */}
        <div className="mb-6 bg-[#111111] rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-white">
            <h2 className="text-xl font-bold mb-1">Вас обманули?</h2>
            <p className="text-gray-400 text-sm">Добавьте жалобу — предупредите других</p>
          </div>
          <Link
            href="/registry/report"
            className="bg-[#A6845B] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#8a6d49] transition-colors whitespace-nowrap"
          >
            + Добавить жалобу
          </Link>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Поиск по нику, названию, описанию..."
              value={filters.q}
              onChange={(e) => { setFilters(prev => ({ ...prev, q: e.target.value })); setPage(1) }}
              className="w-full pl-12 pr-4 py-4 bg-white border border-[#E0E0D8] rounded-xl outline-none focus:border-[#A6845B] transition-colors"
            />
          </div>
        </div>

        {/* Filters Bar */}
        <div className="mb-6 flex items-center gap-3 flex-wrap">
          <button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="lg:hidden flex items-center gap-2 px-4 py-2 bg-white border border-[#E0E0D8] rounded-lg text-sm font-bold"
          >
            <Filter className="w-4 h-4" />
            Фильтры {activeFiltersCount > 0 && `(${activeFiltersCount})`}
          </button>

          {/* Platform type tabs */}
          <div className="flex gap-2">
            <button
              onClick={() => { setFilters(prev => ({ ...prev, platformType: '', platform: '' })); setPage(1) }}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${!filters.platformType ? 'bg-[#111111] text-white' : 'bg-white border border-[#E0E0D8] text-gray-600 hover:border-[#A6845B]'}`}
            >
              Все
            </button>
            <button
              onClick={() => { setFilters(prev => ({ ...prev, platformType: 'social', platform: '' })); setPage(1) }}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${filters.platformType === 'social' ? 'bg-[#111111] text-white' : 'bg-white border border-[#E0E0D8] text-gray-600 hover:border-[#A6845B]'}`}
            >
              Соцсети
            </button>
            <button
              onClick={() => { setFilters(prev => ({ ...prev, platformType: 'marketplace', platform: '' })); setPage(1) }}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${filters.platformType === 'marketplace' ? 'bg-[#111111] text-white' : 'bg-white border border-[#E0E0D8] text-gray-600 hover:border-[#A6845B]'}`}
            >
              Маркетплейсы
            </button>
          </div>

          {/* Sort */}
          <select
            aria-label="Сортировка"
            value={filters.sort}
            onChange={(e) => { setFilters(prev => ({ ...prev, sort: e.target.value })); setPage(1) }}
            className="px-4 py-2 bg-white border border-[#E0E0D8] rounded-lg text-sm font-bold text-gray-600 outline-none focus:border-[#A6845B]"
          >
            {SORTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>

          {activeFiltersCount > 0 && (
            <button
              onClick={() => { setFilters({ platform: '', category: '', platformType: '', sort: 'victims', q: '' }); setPage(1) }}
              className="text-sm text-gray-400 hover:text-[#C06C5F] flex items-center gap-1"
            >
              <X className="w-4 h-4" /> Сбросить
            </button>
          )}
        </div>

        {/* Platform + Category filters */}
        <div className={`${showMobileFilters ? 'block' : 'hidden'} lg:block mb-6 space-y-4`}>
          {/* Platform chips */}
          <div className="flex gap-2 flex-wrap">
            {PLATFORMS.filter(p => {
              if (!filters.platformType) return true
              if (p.value === '') return true
              return p.type === filters.platformType
            }).map(p => (
              <button
                key={p.value || 'all'}
                onClick={() => { setFilters(prev => ({ ...prev, platform: p.value })); setPage(1) }}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${filters.platform === p.value
                  ? 'bg-[#111111] text-white'
                  : 'bg-white border border-[#E0E0D8] text-gray-600 hover:border-[#A6845B]'
                  }`}
              >
                {p.value && <span className="w-2 h-2 rounded-full" style={{ backgroundColor: PLATFORM_COLORS[p.value] }} />}
                {p.label}
              </button>
            ))}
          </div>

          {/* Category chips */}
          <div className="flex gap-2 flex-wrap">
            {CATEGORIES.map(c => (
              <button
                key={c.value || 'all-cat'}
                onClick={() => { setFilters(prev => ({ ...prev, category: c.value })); setPage(1) }}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${filters.category === c.value
                  ? 'bg-[#A6845B] text-white'
                  : 'bg-white border border-[#E0E0D8] text-gray-600 hover:border-[#A6845B]'
                  }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* Results count */}
        <div className="mb-4 text-sm text-gray-500">
          {loading ? 'Загрузка...' : `Найдено: ${total}`}
        </div>

        {/* Cards Grid */}
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="bg-white border border-[#E0E0D8] rounded-2xl p-6 animate-pulse h-64" />
            ))}
          </div>
        ) : scams.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-[#E0E0D8]">
            <Shield className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-400 text-lg mb-2">Пока нет записей</p>
            <p className="text-gray-400 text-sm mb-6">Станьте первым, кто сообщит о мошеннике!</p>
            <Link href="/registry/report" className="btn-primary px-8 py-3 inline-block">
              + Добавить жалобу
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {scams.map(scam => (
              <Link
                key={scam._id}
                href={`/registry/${scam._id}`}
                className="group block bg-white border border-[#E0E0D8] rounded-2xl p-5 hover:border-[#A6845B] hover:shadow-xl transition-all"
              >
                {/* Top: platform badge + verified */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span
                      className="px-2 py-1 rounded text-[10px] font-black uppercase tracking-wide text-white"
                      style={{ backgroundColor: PLATFORM_COLORS[scam.platform] || '#888' }}
                    >
                      {scam.platform}
                    </span>
                    <span className="text-[10px] text-gray-400 uppercase font-bold">
                      {CATEGORY_LABELS[scam.category] || scam.category}
                    </span>
                  </div>
                  {scam.isVerified && (
                    <span className="bg-red-100 text-red-700 text-[10px] font-black uppercase px-2 py-0.5 rounded">
                      Подтверждён
                    </span>
                  )}
                </div>

                {/* Name + username */}
                <h3 className="text-lg font-bold text-[#111111] mb-1 group-hover:text-[#A6845B] transition-colors">
                  {scam.displayName}
                </h3>
                <p className="text-sm text-gray-400 mb-3">@{scam.username}</p>

                {/* Description */}
                <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                  {scam.description}
                </p>

                {/* Tags */}
                {scam.tags?.length > 0 && (
                  <div className="flex gap-1 flex-wrap mb-4">
                    {scam.tags.slice(0, 3).map((tag, i) => (
                      <span key={i} className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Bottom: stats */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-3 text-sm">
                    <span className="flex items-center gap-1 text-red-600 font-bold">
                      <AlertTriangle className="w-4 h-4" />
                      {scam.victimsCount} пострадавших
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <ThumbsUp className="w-3 h-3" /> {scam.likes}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageCircle className="w-3 h-3" /> {scam.comments?.length || 0}
                    </span>
                  </div>
                </div>

                {/* Amount */}
                {formatAmount(scam.amountScammed) && (
                  <div className="mt-2 text-xs text-[#C06C5F] font-bold">
                    Ущерб: от {formatAmount(scam.amountScammed)}
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-8">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 bg-white border border-[#E0E0D8] rounded-lg disabled:opacity-30"
            >
              Назад
            </button>
            <span className="px-4 py-2 text-sm text-gray-500">
              {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 bg-white border border-[#E0E0D8] rounded-lg disabled:opacity-30"
            >
              Вперёд
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
