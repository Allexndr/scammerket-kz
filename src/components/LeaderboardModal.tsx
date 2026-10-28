'use client'

import { useEffect, useState } from 'react'
import { X, Trophy, Award, Star, Target, Crown, Loader2 } from 'lucide-react'

interface LeaderboardUser {
    id: string
    username: string
    points: number
    status: string
    scamsReported: number
    scamsVerified: number
    rank: number
}

const statusConfig: Record<string, { icon: any; label: string; color: string }> = {
    'Новичок': { icon: Star, label: 'Новичок 🌱', color: 'text-[#DEB887]' },
    'Охотник': { icon: Target, label: 'Охотник 🎯', color: 'text-[#CD7F32]' },
    'Эксперт': { icon: Award, label: 'Эксперт ⭐', color: 'text-[#7CAC7C]' },
    'Легенда': { icon: Crown, label: 'Легенда 👑', color: 'text-[#B8722C]' },
}

export default function LeaderboardModal({ onClose }: { onClose: () => void }) {
    const [users, setUsers] = useState<LeaderboardUser[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        async function fetchLeaderboard() {
            try {
                const res = await fetch('/api/leaderboard')
                if (!res.ok) throw new Error('Failed to fetch')
                const data = await res.json()
                setUsers(data.users || [])
            } catch (e) {
                setError('Не удалось загрузить рейтинг')
            } finally {
                setLoading(false)
            }
        }
        fetchLeaderboard()
    }, [])

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className="bg-[#F9F9F7] w-full max-w-2xl rounded-2xl shadow-2xl border border-[#E0E0D8] max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-[#F9F9F7]/95 backdrop-blur-md border-b border-[#E0E0D8] p-4 flex items-center justify-between z-10">
                    <h2 className="text-xl font-bold text-[#111111] flex items-center gap-2">
                        <Trophy className="w-5 h-5 text-[#A6845B]" />
                        Рейтинг охотников
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-[#F0F0EB] rounded-lg">
                        <X className="w-6 h-6 text-[#444444]" />
                    </button>
                </div>

                <div className="p-0">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="w-8 h-8 animate-spin text-[#A6845B]" />
                        </div>
                    ) : error ? (
                        <div className="p-8 text-center text-red-600">{error}</div>
                    ) : users.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                            Пока нет участников. Станьте первым!
                        </div>
                    ) : (
                        users.map((user, index) => {
                            const statusKey = user.status?.split(' ')[0] || 'Новичок'
                            const config = statusConfig[statusKey] || statusConfig['Новичок']
                            const StatusIcon = config.icon
                            return (
                                <div key={user.id} className="flex items-center justify-between p-4 border-b border-[#E0E0D8] last:border-0 hover:bg-[#F0F0EB] transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-8 h-8 flex items-center justify-center font-bold ${index < 3 ? 'text-[#A6845B]' : 'text-gray-400'}`}>
                                            {index + 1}
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-lg bg-white border border-[#E0E0D8] ${config.color}`}>
                                                <StatusIcon className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <div className="font-bold text-[#111111]">{user.username || 'Аноним'}</div>
                                                <div className="text-xs text-[#888888]">{config.label} • {user.scamsReported} отчётов</div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="font-mono font-bold text-[#111111]">
                                        {user.points} pts
                                    </div>
                                </div>
                            )
                        })
                    )}
                </div>
            </div>
        </div>
    )
}
