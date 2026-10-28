'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  AlertCircle, Upload, X, ExternalLink, Shield, Instagram, Send,
  Youtube, Facebook, ShoppingBag, Store, TrendingUp, MessageCircle
} from 'lucide-react'
import { useToast } from '@/components/ToastProvider'

const PLATFORMS = [
  { value: 'instagram', label: 'Instagram', icon: Instagram, type: 'social', placeholder: '@username или ссылка' },
  { value: 'telegram', label: 'Telegram', icon: Send, type: 'social', placeholder: '@channel или ссылка' },
  { value: 'tiktok', label: 'TikTok', icon: TrendingUp, type: 'social', placeholder: '@username или ссылка' },
  { value: 'whatsapp', label: 'WhatsApp', icon: MessageCircle, type: 'social', placeholder: 'Номер или ссылка' },
  { value: 'threads', label: 'Threads', icon: MessageCircle, type: 'social', placeholder: '@username или ссылка' },
  { value: 'youtube', label: 'YouTube', icon: Youtube, type: 'social', placeholder: 'Ссылка на канал' },
  { value: 'facebook', label: 'Facebook', icon: Facebook, type: 'social', placeholder: 'Ссылка на профиль' },
  { value: 'kaspi', label: 'Kaspi.kz', icon: ShoppingBag, type: 'marketplace', placeholder: 'Название магазина' },
  { value: 'satu', label: 'Satu.kz', icon: Store, type: 'marketplace', placeholder: 'Название магазина' },
  { value: 'olx', label: 'OLX.kz', icon: ShoppingBag, type: 'marketplace', placeholder: 'Название объявления' },
  { value: 'market', label: 'Market.kz', icon: Store, type: 'marketplace', placeholder: 'Название магазина' },
  { value: 'flip', label: 'Flip.kz', icon: ShoppingBag, type: 'marketplace', placeholder: 'Название магазина' },
]

const CATEGORIES = [
  { value: 'shop', label: 'Магазин', desc: 'Фейковый магазин, не отправил товар' },
  { value: 'freelancer', label: 'Исполнитель/Фрилансер', desc: 'Услуги не оказал, пропал с деньгами' },
  { value: 'seller', label: 'Продавец', desc: 'Продавец недвижимости/авто/товара обманул' },
  { value: 'blogger', label: 'Блогер/Сбор средств', desc: 'Фейковый сбор, обман на деньги' },
  { value: 'other', label: 'Другое', desc: 'Другой вид мошенничества' },
]

const REGIONS = [
  'Алматы', 'Астана', 'Шымкент', 'Актобе', 'Караганда', 'Тараз',
  'Павлодар', 'Усть-Каменогорск', 'Семей', 'Атырау', 'Костанай',
  'Кызылорда', 'Уральск', 'Петропавловск', 'Другой регион',
]

const SUGGESTED_TAGS = [
  'не отправил товар', 'кинул на деньги', 'фейковый магазин', 'пропал',
  'предоплата', 'брак', 'не вернул деньги', 'мошенничество',
  'подделка', 'обман', 'ввёл в заблуждение',
]

export default function SocialScamReportForm() {
  const router = useRouter()
  const { showToast } = useToast()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    platform: '',
    category: '',
    username: '',
    profileUrl: '',
    displayName: '',
    description: '',
    region: '',
    amountScammed: '',
    tags: [] as string[],
  })

  const [customTag, setCustomTag] = useState('')
  const [evidenceUrls, setEvidenceUrls] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)

  const selectedPlatform = PLATFORMS.find(p => p.value === formData.platform)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const toggleTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag].slice(0, 10),
    }))
  }

  const addCustomTag = () => {
    const tag = customTag.trim().toLowerCase()
    if (tag && !formData.tags.includes(tag) && formData.tags.length < 10) {
      setFormData(prev => ({ ...prev, tags: [...prev.tags, tag] }))
      setCustomTag('')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!formData.platform) { setError('Выберите платформу'); return }
    if (!formData.category) { setError('Выберите категорию'); return }
    if (!formData.username.trim()) { setError('Укажите никнейм или название'); return }
    if (!formData.profileUrl.trim()) { setError('Укажите ссылку на профиль'); return }
    if (formData.description.trim().length < 20) { setError('Описание слишком короткое (минимум 20 символов)'); return }

    setLoading(true)
    try {
      const res = await fetch('/api/social-scams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform: formData.platform,
          category: formData.category,
          username: formData.username,
          profileUrl: formData.profileUrl,
          displayName: formData.displayName || formData.username,
          description: formData.description,
          region: formData.region || 'other',
          amountScammed: formData.amountScammed ? parseInt(formData.amountScammed) : 0,
          tags: formData.tags,
          evidenceUrls: evidenceUrls,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        showToast('Жалоба добавлена в реестр!', 'success')
        router.push(`/registry/${data.id}`)
      } else {
        const err = await res.json()
        setError(err.error || 'Ошибка при отправке')
      }
    } catch (err) {
      setError('Ошибка сети. Попробуйте позже.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen pt-24 pb-20 px-4 bg-[#F9F9F7]">
      <div className="container mx-auto max-w-2xl">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-[#111111] mb-2">
            Жалоба на мошенника
          </h1>
          <p className="text-gray-500">
            Соцсети и маркетплейсы — опишите ситуацию подробно
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-[#E0E0D8] p-6 sm:p-8 space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Platform selection */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-3">
              Платформа <span className="text-[#C06C5F]">*</span>
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {PLATFORMS.map(p => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, platform: p.value }))}
                  className={`flex flex-col items-center gap-1 p-3 rounded-xl border transition-all ${formData.platform === p.value
                    ? 'border-[#A6845B] bg-[#A6845B]/5 shadow-md'
                    : 'border-[#E0E0D8] hover:border-[#A6845B]/50'
                    }`}
                >
                  <p.icon className="w-5 h-5 text-[#111111]" />
                  <span className="text-[10px] font-bold text-gray-600">{p.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-3">
              Категория <span className="text-[#C06C5F]">*</span>
            </label>
            <div className="grid sm:grid-cols-2 gap-2">
              {CATEGORIES.map(c => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, category: c.value }))}
                  className={`text-left p-3 rounded-xl border transition-all ${formData.category === c.value
                    ? 'border-[#A6845B] bg-[#A6845B]/5'
                    : 'border-[#E0E0D8] hover:border-[#A6845B]/50'
                    }`}
                >
                  <div className="font-bold text-sm text-[#111111]">{c.label}</div>
                  <div className="text-xs text-gray-400">{c.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Username */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Никнейм / Название <span className="text-[#C06C5F]">*</span>
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              placeholder={selectedPlatform?.placeholder || '@username'}
              className="w-full px-4 py-3 bg-[#F9F9F7] border border-[#E0E0D8] rounded-xl outline-none focus:border-[#A6845B] transition-colors"
            />
          </div>

          {/* Profile URL */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Ссылка на профиль <span className="text-[#C06C5F]">*</span>
            </label>
            <input
              type="url"
              name="profileUrl"
              value={formData.profileUrl}
              onChange={handleChange}
              required
              placeholder="https://instagram.com/username"
              className="w-full px-4 py-3 bg-[#F9F9F7] border border-[#E0E0D8] rounded-xl outline-none focus:border-[#A6845B] transition-colors"
            />
            {formData.profileUrl && (
              <a href={formData.profileUrl} target="_blank" rel="noopener noreferrer"
                className="mt-1.5 inline-flex items-center gap-1 text-xs text-[#A6845B] hover:underline">
                <ExternalLink className="w-3 h-3" /> Открыть профиль
              </a>
            )}
          </div>

          {/* Display name */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Имя / Название магазина (отображается)
            </label>
            <input
              type="text"
              name="displayName"
              value={formData.displayName}
              onChange={handleChange}
              placeholder="Как называется в профиле"
              className="w-full px-4 py-3 bg-[#F9F9F7] border border-[#E0E0D8] rounded-xl outline-none focus:border-[#A6845B] transition-colors"
            />
          </div>

          {/* Region */}
          <div>
            <label htmlFor="region" className="block text-sm font-bold text-gray-700 mb-2">
              Регион
            </label>
            <select
              id="region"
              name="region"
              value={formData.region}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-[#F9F9F7] border border-[#E0E0D8] rounded-xl outline-none focus:border-[#A6845B] transition-colors"
            >
              <option value="">Не указан</option>
              {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>

          {/* Amount scammed */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Сумма ущерба (₸) — необязательно
            </label>
            <input
              type="number"
              name="amountScammed"
              value={formData.amountScammed}
              onChange={handleChange}
              placeholder="0"
              min="0"
              className="w-full px-4 py-3 bg-[#F9F9F7] border border-[#E0E0D8] rounded-xl outline-none focus:border-[#A6845B] transition-colors"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Описание ситуации <span className="text-[#C06C5F]">*</span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows={5}
              minLength={20}
              placeholder="Опишите подробно: что произошло, как обманули, какие данные запрашивали, сколько денег потеряли..."
              className="w-full px-4 py-3 bg-[#F9F9F7] border border-[#E0E0D8] rounded-xl outline-none focus:border-[#A6845B] transition-colors resize-none"
            />
            <p className="mt-1.5 text-xs text-gray-500">
              Минимум 20 символов. Чем подробнее, тем лучше!
            </p>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-3">
              Теги (выберите или добавьте свой)
            </label>
            <div className="flex gap-2 flex-wrap mb-3">
              {SUGGESTED_TAGS.map(tag => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${formData.tags.includes(tag)
                    ? 'bg-[#111111] text-white'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                    }`}
                >
                  #{tag}
                </button>
              ))}
            </div>
            {formData.tags.length > 0 && (
              <div className="flex gap-1 flex-wrap mb-3">
                {formData.tags.map(tag => (
                  <span key={tag} className="flex items-center gap-1 bg-[#A6845B]/10 text-[#A6845B] px-2 py-1 rounded text-xs">
                    #{tag}
                    <button type="button" onClick={() => toggleTag(tag)}>
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
            <div className="flex gap-2">
              <input
                type="text"
                value={customTag}
                onChange={(e) => setCustomTag(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCustomTag() } }}
                placeholder="Свой тег..."
                className="flex-1 px-3 py-2 bg-[#F9F9F7] border border-[#E0E0D8] rounded-lg text-sm outline-none focus:border-[#A6845B]"
              />
              <button
                type="button"
                onClick={addCustomTag}
                className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm font-bold hover:bg-gray-200"
              >
                Добавить
              </button>
            </div>
            <p className="mt-1 text-xs text-gray-400">Максимум 10 тегов</p>
          </div>

          {/* Media upload — Vercel Blob */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Скриншоты / доказательства
            </label>
            {evidenceUrls.length > 0 && (
              <div className="flex gap-2 flex-wrap mb-3">
                {evidenceUrls.map((url, i) => (
                  <div key={i} className="relative group">
                    <img src={url} alt={`Доказательство ${i + 1}`} className="w-20 h-20 object-cover rounded-lg border border-[#E0E0D8]" />
                    <button
                      type="button"
                      onClick={() => setEvidenceUrls(prev => prev.filter((_, idx) => idx !== i))}
                      className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            {evidenceUrls.length < 5 && (
              <label className="border-2 border-dashed border-[#E0E0D8] rounded-xl p-6 text-center bg-[#F9F9F7]/50 cursor-pointer hover:border-[#A6845B]/50 transition-colors block">
                {uploading ? (
                  <>
                    <div className="w-8 h-8 mx-auto mb-2 border-2 border-[#A6845B] border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm text-gray-500">Загрузка...</p>
                  </>
                ) : (
                  <>
                    <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm text-gray-500">
                      Нажмите чтобы загрузить скриншот
                    </p>
                    <p className="text-xs text-gray-400 mt-1">JPG, PNG, WebP до 5MB (макс. 5 файлов)</p>
                  </>
                )}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0]
                    if (!file) return
                    setUploading(true)
                    try {
                      const fd = new FormData()
                      fd.append('file', file)
                      const res = await fetch('/api/upload', { method: 'POST', body: fd })
                      if (res.ok) {
                        const data = await res.json()
                        setEvidenceUrls(prev => [...prev, data.url].slice(0, 5))
                        showToast('Скриншот загружен', 'success')
                      } else {
                        const err = await res.json()
                        showToast(err.error || 'Ошибка загрузки', 'error')
                      }
                    } catch {
                      showToast('Ошибка сети', 'error')
                    } finally {
                      setUploading(false)
                      e.target.value = ''
                    }
                  }}
                />
              </label>
            )}
          </div>

          {/* Submit */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-[#111111] text-white px-6 py-4 rounded-xl font-bold hover:bg-[#2a2a2a] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Отправка...
                </>
              ) : (
                <>
                  <Shield className="w-5 h-5" />
                  Опубликовать жалобу
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-4 border border-[#E0E0D8] text-gray-600 rounded-xl font-bold hover:bg-gray-50"
            >
              Отмена
            </button>
          </div>

          {/* Legal notice */}
          <div className="p-4 bg-[#FFF8E7] rounded-xl border border-[#DEB887]/30">
            <p className="text-xs text-gray-600 leading-relaxed">
              <strong>Важно:</strong> Информация публикуется пользователями (UGC).
              Мы не несём ответственности за достоверность. Не добавляйте ложную информацию!
              Если вас оклеветали — подайте жалобу.
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}
