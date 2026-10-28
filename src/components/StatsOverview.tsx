'use client'

import { useEffect, useState } from 'react'
import { Users, FileText, Building2, TrendingUp } from 'lucide-react'

interface Stats {
    totalScams: number
    totalUsers: number
    totalCompanies: number
    verifiedScams: number
}

export default function StatsOverview() {
    const [stats, setStats] = useState<Stats>({
        totalScams: 0,
        totalUsers: 0,
        totalCompanies: 0,
        verifiedScams: 0,
    })

    // Mock data for initial render to avoid layout shift if API fails
    const [loading, setLoading] = useState(false)

    // Enable API call
    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await fetch('/api/stats')
                if (response.ok) {
                    const data = await response.json()
                    setStats(data)
                }
            } catch (error) {
                console.error('Failed to fetch stats:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchStats()
    }, [])

    const statCards = [
        {
            icon: FileText,
            label: 'Всего сообщений',
            value: stats.totalScams,
            color: 'from-[#D2B48C] to-[#CD7F32]',
            bgColor: 'bg-[#FAF0E6]',
        },
        {
            icon: Users,
            label: 'Активных пользователей',
            value: stats.totalUsers,
            color: 'from-[#8FBC8F] to-[#7CAC7C]',
            bgColor: 'bg-[#F0F8F0]',
        },
        {
            icon: Building2,
            label: 'Компаний с жалобами',
            value: stats.totalCompanies,
            color: 'from-[#BC8F8F] to-[#A57C7C]',
            bgColor: 'bg-[#F8F0F0]',
        },
        {
            icon: TrendingUp,
            label: 'Верифицировано',
            value: stats.verifiedScams,
            color: 'from-[#DEB887] to-[#D4A574]',
            bgColor: 'bg-[#FFF8E7]',
        },
    ]

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {statCards.map((stat, index) => {
                const Icon = stat.icon
                return (
                    <div
                        key={index}
                        className="stat-card group"
                    >
                        <div className={`absolute top-0 right-0 w-24 h-24 ${stat.bgColor} rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>

                        <div className="relative">
                            <div className={`inline-flex bg-gradient-to-br ${stat.color} p-3 rounded-xl shadow-md mb-4 group-hover:scale-110 transition-transform duration-300`}>
                                <Icon className="w-6 h-6 text-white" />
                            </div>

                            <div
                                className={`text-3xl sm:text-4xl font-black mb-2 bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}
                                suppressHydrationWarning
                            >
                                {stat.value.toLocaleString('ru-RU')}
                            </div>

                            <div className="text-sm sm:text-base text-gray-600 font-medium">
                                {stat.label}
                            </div>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}
