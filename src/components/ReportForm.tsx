'use client'

import { useState } from 'react'
import { useRouter } from '@/i18n/routing'
import { AlertCircle, Upload, X } from 'lucide-react'
import { useToast } from '@/components/ToastProvider'

export default function ReportForm() {
  const router = useRouter()
  const { showToast } = useToast()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    phone: '',
    gender: '',
    representedAs: '',
    company: '',
    type: '',
    region: '',
    description: '',
  })

  const scamTypes = [
    { label: 'Банковский фишинг', value: 'phishing' },
    { label: 'Вишинг (телефонный обман)', value: 'vishing' },
    { label: 'SMS-фишинг', value: 'smishing' },
    { label: 'Подозрительные крипто-операции', value: 'crypto' },
    { label: 'Фейковая продажа', value: 'fake_sale' },
    { label: 'Фейковый магазин', value: 'fake_shop' },
    { label: 'Лже-сотрудник банка', value: 'impersonation' },
    { label: 'Инвестиционная пирамида', value: 'investment' },
    { label: 'Ложный заём', value: 'loan' },
    { label: 'Аренда (мошенничество)', value: 'rental' },
    { label: 'Выигрыш приза', value: 'prize' },
    { label: 'Другое', value: 'other' },
  ]

  const regions = [
    'Алматы',
    'Астана',
    'Шымкент',
    'Актобе',
    'Караганда',
    'Тараз',
    'Павлодар',
    'Усть-Каменогорск',
    'Семей',
    'Атырау',
    'Костанай',
    'Кызылорда',
    'Уральск',
    'Петропавловск',
    'Другой регион',
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/scams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber: formData.phone,
          gender: formData.gender === 'Мужчина' ? 'male' : formData.gender === 'Женщина' ? 'female' : 'unknown',
          representedAs: formData.representedAs,
          company: formData.company,
          scamType: formData.type,
          region: formData.region,
          description: formData.description,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        showToast('Отчёт добавлен! Спасибо за вклад.', 'success')
        router.push(`/scams/${data.scamId || data.id}`)
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Ошибка при добавлении')
      }
    } catch (err) {
      setError('Ошибка сети. Попробуйте позже.')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  return (
    <form onSubmit={handleSubmit} className="card-glass">
      <div className="space-y-6">
        {/* Error Message */}
        {error && (
          <div className="p-4 bg-gradient-to-r from-[#FEE] to-[#FDD] border-2 border-[#BC8F8F] rounded-2xl flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-[#BC8F8F] flex-shrink-0" />
            <p className="text-sm text-gray-700">{error}</p>
          </div>
        )}

        {/* Phone Number */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Номер телефона звонившего <span className="text-[#BC8F8F]">*</span>
          </label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            required
            placeholder="+7 или 8..."
            className="input-modern"
          />
          <p className="mt-1.5 text-xs text-gray-500">
            Введите в любом формате: +7, 8, или без кода страны
          </p>
        </div>

        {/* Gender */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Пол звонившего
          </label>
          <div className="grid grid-cols-3 gap-3">
            {['Мужчина', 'Женщина', 'Не помню'].map((gender) => (
              <button
                key={gender}
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, gender }))}
                className={`px-4 py-3 rounded-xl font-medium transition-all duration-300 ${formData.gender === gender
                  ? 'bg-gradient-to-r from-[#D2B48C] to-[#CD7F32] text-white shadow-lg'
                  : 'bg-white border border-[#F7E7CE] text-gray-700 hover:border-[#D2B48C]'
                  }`}
              >
                {gender}
              </button>
            ))}
          </div>
        </div>

        {/* Represented As */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Кем представился(лась) <span className="text-[#BC8F8F]">*</span>
          </label>
          <input
            type="text"
            name="representedAs"
            value={formData.representedAs}
            onChange={handleChange}
            required
            placeholder="Например: сотрудник банка Kaspi"
            className="input-modern"
          />
        </div>

        {/* Company */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            От какой компании <span className="text-[#BC8F8F]">*</span>
          </label>
          <input
            type="text"
            name="company"
            value={formData.company}
            onChange={handleChange}
            required
            placeholder="Например: Kaspi Bank"
            className="input-modern"
          />
        </div>

        {/* Type */}
        <div>
          <label htmlFor="type" className="block text-sm font-semibold text-gray-700 mb-2">
            Категория нарушения <span className="text-[#BC8F8F]">*</span>
          </label>
          <select
            id="type"
            name="type"
            value={formData.type}
            onChange={handleChange}
            required
            className="input-modern"
          >
            <option value="">Выберите тип...</option>
            {scamTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        {/* Region */}
        <div>
          <label htmlFor="region" className="block text-sm font-semibold text-gray-700 mb-2">
            Регион <span className="text-[#BC8F8F]">*</span>
          </label>
          <select
            id="region"
            name="region"
            value={formData.region}
            onChange={handleChange}
            required
            className="input-modern"
          >
            <option value="">Выберите регион...</option>
            {regions.map((region) => (
              <option key={region} value={region}>
                {region}
              </option>
            ))}
          </select>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Описание ситуации <span className="text-[#BC8F8F]">*</span>
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            rows={4}
            placeholder="Опишите что произошло, что говорил звонящий, какие данные запрашивал..."
            className="input-modern resize-none"
          />
          <p className="mt-1.5 text-xs text-gray-500">
            Минимум 20 символов. Чем подробнее, тем лучше!
          </p>
        </div>

        {/* File Upload Placeholder */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Скриншоты или аудио (опционально)
          </label>
          <div className="border-2 border-dashed border-[#F7E7CE] rounded-2xl p-8 text-center bg-[#FAF0E6]/30">
            <Upload className="w-10 h-10 mx-auto mb-3 text-gray-400" />
            <p className="text-sm text-gray-600">
              Функция загрузки файлов скоро будет доступна
            </p>
            <p className="text-xs text-gray-500 mt-1">
              JPG, PNG, MP3 до 10MB
            </p>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Отправка...</span>
              </>
            ) : (
              <>
                <span>✅ Отправить сообщение</span>
              </>
            )}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="btn-secondary"
          >
            Отмена
          </button>
        </div>

        {/* Info */}
        <div className="p-4 bg-[#FFF8E7] rounded-xl border border-[#DEB887]">
          <p className="text-xs text-gray-700 leading-relaxed">
            <strong>Важно:</strong> Ваше сообщение будет проверено сообществом через голосование (лайки/дизлайки).
            Мы не несем ответственности за достоверность данных. Не добавляйте ложную информацию!
          </p>
        </div>
      </div>
    </form>
  )
}
