'use client'

import { BADGES, getUserBadges, getNextBadges, type Badge } from '@/lib/badges'

interface BadgesDisplayProps {
    user: {
        points: number
        reportsCount: number
        verifiedReportsCount: number
        peopleProtected: number
        streak: number
        votes: string[]
        badges?: string[]
    }
}

export default function BadgesDisplay({ user }: BadgesDisplayProps) {
    const earnedBadges = getUserBadges(user)
    const nextBadges = getNextBadges(user)

    return (
        <div className="bg-white rounded-2xl border border-[#E0E0D8] p-6">
            <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-bold text-[#111111]">Достижения</h3>
                <span className="text-sm font-bold text-[#A6845B]">
                    {earnedBadges.length} / {BADGES.length}
                </span>
            </div>

            {/* Earned badges */}
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mb-6">
                {earnedBadges.map((badge: Badge) => (
                    <div
                        key={badge.id}
                        className="group relative flex flex-col items-center p-3 bg-[#F9F9F7] rounded-xl border-2 transition-all hover:scale-105 cursor-default"
                        style={{ borderColor: badge.color + '40' }}
                    >
                        <div
                            className="w-10 h-10 rounded-full flex items-center justify-center text-xl mb-1"
                            style={{ backgroundColor: badge.color + '20' }}
                        >
                            {badge.icon}
                        </div>
                        <span className="text-[10px] font-bold text-center text-[#111111] leading-tight">
                            {badge.name}
                        </span>
                        {/* Tooltip */}
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-[#111111] text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                            {badge.description}
                        </div>
                    </div>
                ))}
            </div>

            {/* Next badges */}
            {nextBadges.length > 0 && (
                <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                        Следующие достижения
                    </p>
                    <div className="space-y-2">
                        {nextBadges.map((badge: Badge) => (
                            <div
                                key={badge.id}
                                className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-dashed border-gray-200"
                            >
                                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-base opacity-50">
                                    {badge.icon}
                                </div>
                                <div className="flex-1">
                                    <span className="text-sm font-bold text-gray-500">{badge.name}</span>
                                    <p className="text-xs text-gray-400">{badge.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {earnedBadges.length === 0 && (
                <div className="text-center py-8">
                    <div className="text-4xl mb-3 opacity-30">🏆</div>
                    <p className="text-sm text-gray-400">
                        Добавьте первый отчёт, чтобы получить бейдж
                    </p>
                </div>
            )}
        </div>
    )
}
