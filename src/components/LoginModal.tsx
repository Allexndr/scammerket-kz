'use client'

import { useState } from 'react'
import { X, User, ArrowRight, Lock, Loader2 } from 'lucide-react'
import { useUser } from '@/context/UserContext'
import { useToast } from '@/components/ToastProvider'
import { signIn } from 'next-auth/react'

export default function LoginModal({ onClose }: { onClose: () => void }) {
    const { setUser } = useUser()
    const { showToast } = useToast()
    const [name, setName] = useState('')
    const [loading, setLoading] = useState(false)
    const [showGuestForm, setShowGuestForm] = useState(false)

    const handleGuestSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!name.trim() || name.trim().length < 2) return

        setLoading(true)
        try {
            const res = await fetch('/api/auth/guest', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: name.trim() })
            })

            if (!res.ok) {
                const err = await res.json()
                showToast(err.error || 'Ошибка входа', 'error')
                return
            }

            const data = await res.json()
            setUser({
                id: data.id,
                name: data.name,
                email: data.email,
                points: data.points || 0,
                rank: data.rank || 'Новичок',
                role: 'user',
                reportsCount: data.reportsCount || 0,
                reports: [],
                apiKeys: []
            })
            showToast('Вы вошли как гость', 'success')
            onClose()
        } catch (e) {
            showToast('Ошибка сети', 'error')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className="bg-[#F9F9F7] w-full max-w-md rounded-2xl shadow-2xl border border-[#E0E0D8] p-8 relative overflow-hidden">
                <button onClick={onClose} className="absolute top-4 right-4 p-2 hover:bg-[#F0F0EB] rounded-lg">
                    <X className="w-5 h-5 text-[#444444]" />
                </button>

                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-[#111111] rounded-2xl mb-4 shadow-lg transform rotate-3">
                        <Lock className="w-8 h-8 text-[#A6845B]" />
                    </div>
                    <h2 className="text-2xl font-bold text-[#111111]">Вход в кабинет</h2>
                    <p className="text-[#666666] text-sm mt-2">
                        Отслеживайте свой рейтинг и вклад в безопасность страны
                    </p>
                </div>

                {!showGuestForm ? (
                    <div className="space-y-4">
                        <button
                            type="button"
                            onClick={() => signIn('google', { callbackUrl: '/' })}
                            className="w-full bg-white border border-[#E0E0D8] text-[#111111] py-4 rounded-xl hover:bg-gray-50 hover:border-[#A6845B] transition-all flex items-center justify-center gap-3 font-bold"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.26z" />
                                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            Войти через Google
                        </button>

                        <div className="relative my-6 text-center">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-300"></div>
                            </div>
                            <span className="relative bg-[#F9F9F7] px-4 text-xs text-gray-500 uppercase font-bold tracking-wider">Или</span>
                        </div>

                        <button
                            type="button"
                            onClick={() => setShowGuestForm(true)}
                            className="w-full bg-white border border-[#E0E0D8] text-[#111111] py-4 rounded-xl hover:bg-gray-50 hover:border-[#A6845B] transition-all flex items-center justify-center gap-3 font-bold"
                        >
                            <User className="w-5 h-5 text-[#A6845B]" />
                            Войти как гость
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleGuestSubmit} className="space-y-4 animate-fade-in">
                        <div className="text-center mb-6">
                            <p className="text-sm font-bold text-[#444444] uppercase tracking-wider">Гостевой вход</p>
                            <p className="text-xs text-[#666666] mt-1">Представьтесь, чтобы участвовать в рейтинге</p>
                        </div>
                        <div className="relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#888888]" />
                            <input
                                type="text"
                                placeholder="Ваше имя или псевдоним"
                                className="input-paper pl-12"
                                autoFocus
                                value={name}
                                onChange={e => setName(e.target.value)}
                                disabled={loading}
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading || !name.trim() || name.trim().length < 2}
                            className="btn-primary w-full py-4 shadow-lg shadow-[#A6845B]/20 disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                            {loading ? 'Вход...' : 'Продолжить'}
                        </button>
                        <button
                            type="button"
                            onClick={() => setShowGuestForm(false)}
                            className="w-full text-sm text-gray-500 hover:text-[#A6845B]"
                        >
                            Назад
                        </button>
                    </form>
                )}
            </div>
        </div>
    )
}
