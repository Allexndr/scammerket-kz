'use client'

import { Shield, Users, TrendingUp, Award } from 'lucide-react'

interface ImpactStatsProps {
    user: {
        points: number
        reportsCount: number
        verifiedReportsCount: number
        peopleProtected: number
        streak: number
    }
}

export default function ImpactStats({ user }: ImpactStatsProps) {
    const stats = [
        {
            label: 'Людей защищено',
            value: user.peopleProtected,
            icon: Shield,
            color: '#8A9A5B',
            bg: '#F4F6EE',
            hint: 'Каждый проверивший ваш отчёт — защищённый человек',
        },
        {
            label: 'Отчётов добавлено',
            value: user.reportsCount,
            icon: TrendingUp,
            color: '#A6845B',
            bg: '#FAF6F0',
            hint: 'Ваш вклад в базу данных',
        },
        {
            label: 'Подтверждено сообществом',
            value: user.verifiedReportsCount,
            icon: Users,
            color: '#C06C5F',
            bg: '#FDF2F0',
            hint: 'Отчёты с высоким рейтингом доверия',
        },
        {
            label: 'Очков опыта',
            value: user.points,
            icon: Award,
            color: '#CD7F32',
            bg: '#FEF6EE',
            hint: 'Общий рейтинг активности',
        },
    ]

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat) => {
                const Icon = stat.icon
                return (
                    <div
                        key={stat.label}
                        className="bg-white rounded-2xl border border-[#E0E0D8] p-5 hover:shadow-lg transition-shadow"
                    >
                        <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                            style={{ backgroundColor: stat.bg }}
                        >
                            <Icon className="w-5 h-5" style={{ color: stat.color }} />
                        </div>
                        <div className="text-2xl font-black text-[#111111] mb-1">
                            {stat.value.toLocaleString('ru-RU')}
                        </div>
                        <div className="text-xs font-bold text-gray-500 mb-1">
                            {stat.label}
                        </div>
                        <div className="text-[10px] text-gray-400 leading-tight">
                            {stat.hint}
                        </div>
                    </div>
                )
            })}
        </div>
    )
}
