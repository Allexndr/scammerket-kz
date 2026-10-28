'use client'

import { useEffect, useState, useCallback } from 'react'
import { Award, Trophy, Star, Crown, Target, TrendingUp } from 'lucide-react'

const statusConfig: Record<string, { icon: any; color: string; label: string; minPoints: number }> = {
    'Новичок': { icon: Star, color: 'from-[#DEB887] to-[#D4A574]', label: 'Новичок 🌱', minPoints: 0 },
    'Охотник': { icon: Target, color: 'from-[#D2B48C] to-[#CD7F32]', label: 'Охотник 🎯', minPoints: 100 },
    'Эксперт': { icon: Award, color: 'from-[#8FBC8F] to-[#7CAC7C]', label: 'Эксперт ⭐', minPoints: 500 },
    'Легенда': { icon: Crown, color: 'from-[#CD7F32] to-[#B8722C]', label: 'Легенда 👑', minPoints: 1000 },
}

interface LeaderboardUser {
    id: string
    username: string
    points: number
    status: string
    scamsReported: number
    scamsVerified: number
}

export default function LeaderboardPage() {
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState<'all' | 'week' | 'month'>('all')
    const [users, setUsers] = useState<LeaderboardUser[]>([])

    useEffect(() => {
        fetchLeaderboard()
    }, [filter])

    const fetchLeaderboard = async () => {
        setLoading(true)
        try {
            const res = await fetch(`/api/leaderboard?filter=${filter}`)
            if (res.ok) {
                const data = await res.json()
                const users = data.users || []
                setUsers(Array.isArray(users) ? users : [])
            } else {
                setUsers([])
            }
        } catch (e) {
            setUsers([])
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen pt-24 pb-16 px-4">
            <div className="container mx-auto max-w-5xl">
                <div className="text-center mb-12 animate-fade-in">
                    <div className="relative inline-block mb-6">
                        <div className="absolute inset-0 bg-[#CD7F32] blur-3xl opacity-20 animate-pulse"></div>
                        <div className="relative bg-gradient-to-br from-[#D2B48C] to-[#CD7F32] p-4 rounded-3xl shadow-2xl">
                            <Trophy className="w-12 h-12 sm:w-16 sm:h-16 text-white animate-float" />
                        </div>
                    </div>

                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black mb-4 text-gradient">
                        🏆 Рейтинг охотников
                    </h1>

                    <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto mb-8">
                        Топ активных участников
                    </p>

                    <div className="flex justify-center gap-3">
                        {[
                            { key: 'all', label: 'Все время' },
                            { key: 'month', label: 'За месяц' },
                            { key: 'week', label: 'За неделю' },
                        ].map((f) => (
                            <button
                                key={f.key}
                                onClick={() => setFilter(f.key as any)}
                                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${filter === f.key
                                        ? 'bg-gradient-to-r from-[#D2B48C] to-[#CD7F32] text-white shadow-lg'
                                        : 'bg-white border border-[#F7E7CE] text-gray-700 hover:border-[#D2B48C]'
                                    }`}
                            >
                                {f.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="space-y-4 animate-slide-up">
                    {loading ? (
                        <div className="flex flex-col gap-4">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="h-24 bg-gray-100 animate-pulse rounded-3xl border border-gray-200"></div>
                            ))}
                        </div>
                    ) : users.map((user, index) => {
                        const statusKey = (user.status || 'Новичок').split(' ')[0] as keyof typeof statusConfig
                        const config = statusConfig[statusKey] || statusConfig['Новичок']
                        const StatusIcon = config.icon
                        const isTop3 = index < 3

                        return (
                            <div
                                key={user.id}
                                className={`relative overflow-hidden rounded-3xl transition-all duration-500 hover:-translate-y-2 ${isTop3
                                        ? 'bg-gradient-to-r from-white to-[#FAF0E6] border-2 border-[#CD7F32] shadow-xl'
                                        : 'bg-white border border-[#F7E7CE] shadow-md hover:shadow-xl'
                                    }`}
                            >
                                <div className="absolute top-0 left-0 w-16 h-16 flex items-center justify-center">
                                    {index === 0 && <div className="text-3xl">🥇</div>}
                                    {index === 1 && <div className="text-3xl">🥈</div>}
                                    {index === 2 && <div className="text-3xl">🥉</div>}
                                    {index > 2 && <div className="text-2xl font-black text-gray-400">#{index + 1}</div>}
                                </div>

                                <div className="flex items-center gap-6 p-6 pl-20">
                                    <div className={`flex-shrink-0 p-4 rounded-2xl shadow-lg bg-gradient-to-br ${config.color}`}>
                                        <StatusIcon className="w-8 h-8 text-white" />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-xl font-bold text-gray-800 truncate">{user.username || 'Аноним'}</h3>
                                            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r ${config.color} text-white shadow-md`}>
                                                {config.label}
                                            </span>
                                        </div>

                                        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                                            <div className="flex items-center gap-1">
                                                <TrendingUp className="w-4 h-4 text-[#CD7F32]" />
                                                <span className="font-semibold">{user.scamsReported}</span> сообщений
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Award className="w-4 h-4 text-[#8FBC8F]" />
                                                <span className="font-semibold">{user.scamsVerified}</span> верифицировано
                                            </div>
                                        </div>
                                    </div>

                                    <div className="text-right">
                                        <div className={`text-3xl sm:text-4xl font-black bg-gradient-to-r ${config.color} bg-clip-text text-transparent`}>
                                            {user.points.toLocaleString('ru-RU')}
                                        </div>
                                        <div className="text-sm text-gray-500 font-medium">очков</div>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
