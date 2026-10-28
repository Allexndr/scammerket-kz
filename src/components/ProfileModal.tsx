'use client'

import { X, Award, Shield, User as UserIcon, LogOut, ChevronRight, Star, TrendingUp } from 'lucide-react'
import { useUser } from '@/context/UserContext'

export default function ProfileModal({ onClose }: { onClose: () => void }) {
    const { user, logout } = useUser()

    if (!user) return null

    // Gamification Logic
    const RANKS = [
        { name: 'Новичок', min: 0 },
        { name: 'Охотник', min: 50 },
        { name: 'Эксперт', min: 200 },
        { name: 'Легенда', min: 1000 }
    ]

    const currentRankIdx = RANKS.findIndex(r => r.name === user.rank)
    const nextRank = RANKS[currentRankIdx + 1]
    const progress = nextRank
        ? ((user.points - RANKS[currentRankIdx].min) / (nextRank.min - RANKS[currentRankIdx].min)) * 100
        : 100

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className="bg-[#F9F9F7] w-full max-w-2xl rounded-3xl shadow-2xl border border-[#E0E0D8] max-h-[90vh] overflow-y-auto">

                {/* Header */}
                <div className="bg-[#111111] p-6 sm:p-8 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#A6845B] blur-[60px] opacity-20 rounded-full"></div>

                    <div className="flex justify-between items-start relative z-10">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-2xl bg-[#222] border border-[#333] flex items-center justify-center">
                                <UserIcon className="w-8 h-8 text-[#A6845B]" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold">{user.name}</h2>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="px-2 py-0.5 rounded-md bg-[#A6845B] text-black text-xs font-bold uppercase tracking-wider">
                                        {user.rank}
                                    </span>
                                    <span className="text-gray-400 text-sm">{user.phone}</span>
                                </div>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                            <X className="w-6 h-6 text-white" />
                        </button>
                    </div>

                    <div className="mt-8">
                        <div className="flex justify-between text-sm mb-2 text-gray-400">
                            <span>Прогресс уровня</span>
                            <span>{user.points} / {nextRank ? nextRank.min : 'MAX'} pts</span>
                        </div>
                        <div className="h-2 bg-[#333] rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-[#8B7355] to-[#D2B48C]"
                                style={{ width: `${Math.min(progress, 100)}%` }}
                            ></div>
                        </div>
                        {nextRank && (
                            <p className="text-xs text-[#666666] mt-2">
                                Еще {nextRank.min - user.points} очков до звания "{nextRank.name}"
                            </p>
                        )}
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 sm:p-8 space-y-8">

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white p-4 rounded-2xl border border-[#E0E0D8] shadow-sm">
                            <div className="flex items-center gap-2 text-[#666666] text-sm font-medium mb-1">
                                <Shield className="w-4 h-4" />
                                Мои отчеты
                            </div>
                            <div className="text-2xl font-bold text-[#111111]">{user.reportsCount}</div>
                        </div>
                        <div className="bg-white p-4 rounded-2xl border border-[#E0E0D8] shadow-sm">
                            <div className="flex items-center gap-2 text-[#666666] text-sm font-medium mb-1">
                                <Star className="w-4 h-4" />
                                Очки вклада
                            </div>
                            <div className="text-2xl font-bold text-[#A6845B]">{user.points}</div>
                        </div>
                    </div>

                    {/* Reward System Info */}
                    <div className="bg-[#F0F0EB] p-4 rounded-xl border border-[#E0E0D8]">
                        <h3 className="font-bold text-[#111111] mb-3 flex items-center gap-2">
                            <Award className="w-5 h-5 text-[#A6845B]" />
                            Система наград
                        </h3>
                        <div className="space-y-2 text-sm text-[#444444]">
                            <div className="flex justify-between">
                                <span>Базовый отчет</span>
                                <span className="font-bold">+10 pts</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Указание компании</span>
                                <span className="font-bold">+20 pts</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Подробное описание</span>
                                <span className="font-bold">+15 pts</span>
                            </div>
                        </div>
                    </div>

                    {/* History */}
                    <div>
                        <h3 className="font-bold text-[#111111] mb-4">История активности</h3>
                        {user.reports.length === 0 ? (
                            <div className="text-center py-8 bg-white rounded-xl border border-[#E0E0D8] border-dashed">
                                <TrendingUp className="w-8 h-8 text-[#CCCCCC] mx-auto mb-2" />
                                <p className="text-gray-400 text-sm">Пока нет активности. Сообщите о нарушении!</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {user.reports && user.reports.length > 0 ? (
                                    user.reports.map((reportId, index) => (
                                        <div key={index} className="bg-white p-4 rounded-xl border border-[#E0E0D8] flex items-center justify-between">
                                            <div>
                                                <div className="font-bold text-[#111111]">Отчет #{typeof reportId === 'string' ? reportId.slice(-4) : 'ID'}</div>
                                                <div className="text-xs text-gray-500">Статус: На проверке</div>
                                            </div>
                                            <div className="bg-[#F0F0EB] px-3 py-1 rounded text-xs font-bold text-[#A6845B]">
                                                +15 XP
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center text-gray-400 py-4">Нет активных отчетов</div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Logout */}
                    <button
                        onClick={() => { logout(); onClose(); }}
                        className="w-full flex items-center justify-center gap-2 text-[#FF4444] font-medium hover:bg-red-50 p-3 rounded-xl transition-colors"
                    >
                        <LogOut className="w-5 h-5" />
                        Выйти из аккаунта
                    </button>

                </div>
            </div>
        </div>
    )
}
