'use client'

import { useState } from 'react'
import { AlertTriangle, X, Loader2 } from 'lucide-react'
import { useUser } from '@/context/UserContext'
import { TOP_COMPANIES, FRAUD_TYPES, REGIONS } from '@/lib/constants'

export default function ReportModal({ onClose, initialPhone = '' }: { onClose: () => void, initialPhone?: string }) {
    const [formData, setFormData] = useState({
        phone: initialPhone,
        company: '',
        isOtherCompany: false,
        otherCompany: '',
        representedAs: '',
        description: '',
        fraudType: 'phishing',
        gender: 'unknown',
        region: '',
    })
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)

    const { addReportPoints, isLoggedIn } = useUser()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setSubmitting(true)

        const finalCompany = formData.isOtherCompany ? formData.otherCompany : formData.company

        try {
            const response = await fetch('/api/scams', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    phoneNumber: formData.phone,
                    gender: formData.gender,
                    representedAs: formData.representedAs,
                    company: finalCompany,
                    scamType: formData.fraudType,
                    region: formData.region || 'other',
                    description: formData.description,
                }),
            })

            if (response.ok) {
                if (isLoggedIn) {
                    addReportPoints({
                        hasCompany: !!finalCompany,
                        hasDescription: formData.description.length > 20
                    })
                }
                setSuccess(true)
                setTimeout(() => {
                    onClose()
                }, 2000)
            } else {
                const err = await response.json()
                setError(err.error || 'Ошибка при отправке')
            }
        } catch (err) {
            setError('Ошибка сети. Попробуйте позже.')
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className="bg-[#F9F9F7] w-full max-w-2xl rounded-2xl shadow-2xl border border-[#E0E0D8] max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-[#F9F9F7]/95 backdrop-blur-md border-b border-[#E0E0D8] p-4 flex items-center justify-between z-10">
                    <h2 className="text-xl font-bold text-[#111111] flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-[#A6845B]" />
                        Сообщить о нарушении
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-[#F0F0EB] rounded-lg">
                        <X className="w-6 h-6 text-[#444444]" />
                    </button>
                </div>

                <div className="p-6 sm:p-8">
                    {success ? (
                        <div className="text-center py-12 animate-fade-in">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                            </div>
                            <h3 className="text-xl font-bold text-[#111111] mb-2">Отчет отправлен!</h3>
                            <p className="text-gray-500">Спасибо за вклад в безопасность сообщества.</p>
                        </div>
                    ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
                                <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
                                <p className="text-sm text-red-700">{error}</p>
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-bold text-[#444444] mb-2">Номер телефона звонившего</label>
                            <input
                                type="tel"
                                required
                                className="input-paper"
                                placeholder="+7 (7xx) xxx-xx-xx"
                                value={formData.phone}
                                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-[#444444] mb-2">Кем представились?</label>
                            <input
                                type="text"
                                required
                                className="input-paper"
                                placeholder="Например: сотрудник банка Kaspi"
                                value={formData.representedAs}
                                onChange={e => setFormData({ ...formData, representedAs: e.target.value })}
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="company-select" className="block text-sm font-bold text-[#444444] mb-2">От какой компании</label>
                                {!formData.isOtherCompany ? (
                                    <select
                                        id="company-select"
                                        aria-label="Компания"
                                        className="input-paper"
                                        value={formData.company}
                                        onChange={e => {
                                            if (e.target.value === 'OTHER') {
                                                setFormData({ ...formData, isOtherCompany: true, company: '' })
                                            } else {
                                                setFormData({ ...formData, company: e.target.value })
                                            }
                                        }}
                                    >
                                        <option value="">Выберите из списка</option>
                                        {TOP_COMPANIES.map(comp => (
                                            <option key={comp} value={comp}>{comp}</option>
                                        ))}
                                        <option value="OTHER">--- Другое (вписать вручную) ---</option>
                                    </select>
                                ) : (
                                    <div className="relative">
                                        <input
                                            type="text"
                                            required
                                            className="input-paper pr-10"
                                            placeholder="Введите название организации"
                                            value={formData.otherCompany}
                                            onChange={e => setFormData({ ...formData, otherCompany: e.target.value })}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, isOtherCompany: false, otherCompany: '' })}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[#A6845B] hover:underline"
                                        >
                                            Список
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div>
                                <label htmlFor="fraud-type" className="block text-sm font-bold text-[#444444] mb-2">Категория нарушения</label>
                                <select
                                    id="fraud-type"
                                    aria-label="Категория нарушения"
                                    className="input-paper"
                                    value={formData.fraudType}
                                    onChange={e => setFormData({ ...formData, fraudType: e.target.value })}
                                >
                                    {FRAUD_TYPES.map(ft => (
                                        <option key={ft.value} value={ft.value}>{ft.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-[#444444] mb-2">Пол звонившего</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {[
                                        { v: 'male', l: 'Муж.' },
                                        { v: 'female', l: 'Жен.' },
                                        { v: 'unknown', l: 'Не помню' }
                                    ].map(g => (
                                        <button
                                            key={g.v}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, gender: g.v })}
                                            className={`px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${formData.gender === g.v
                                                ? 'bg-[#111111] text-white'
                                                : 'bg-white border border-[#E0E0D8] text-[#444] hover:border-[#A6845B]'
                                                }`}
                                        >
                                            {g.l}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label htmlFor="region-select" className="block text-sm font-bold text-[#444444] mb-2">Регион</label>
                                <select
                                    id="region-select"
                                    aria-label="Регион"
                                    className="input-paper"
                                    value={formData.region}
                                    onChange={e => setFormData({ ...formData, region: e.target.value })}
                                >
                                    <option value="">Выберите регион...</option>
                                    {REGIONS.map(r => (
                                        <option key={r} value={r}>{r}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-[#444444] mb-2">Подробное описание схемы</label>
                            <textarea
                                rows={4}
                                required
                                className="input-paper resize-none"
                                placeholder="Опишите, что именно говорил звонящий, какие данные запрашивал..."
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                            ></textarea>
                            <p className="mt-2 text-[10px] text-[#888] uppercase tracking-wider">
                                Рекомендуется минимум 20 символов для получения бонусных очков
                            </p>
                        </div>

                        <button
                            type="submit"
                            disabled={submitting}
                            className="btn-primary w-full py-4 text-lg disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {submitting ? (
                                <><Loader2 className="w-5 h-5 animate-spin" /> Отправка...</>
                            ) : (
                                'Отправить отчет'
                            )}
                        </button>

                        {!isLoggedIn && (
                            <p className="text-center text-xs text-[#888]">
                                Войдите в аккаунт, чтобы получать очки и повышать рейтинг за отчёты.
                            </p>
                        )}
                    </form>
                    )}
                </div>
            </div>
        </div>
    )
}
