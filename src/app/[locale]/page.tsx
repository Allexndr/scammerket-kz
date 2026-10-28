'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import nextDynamic from 'next/dynamic'
import SearchForm from '@/components/SearchForm'
import TopCompanies from '@/components/TopCompanies'
import StatsOverview from '@/components/StatsOverview'
import LiveFeed from '@/components/LiveFeed'
import LegalConsentModal from '@/components/LegalConsentModal'
import { Shield, TrendingUp, Users, Zap, CheckCircle2, BarChart3, Award, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import AdSpace from '@/components/AdSpace'

// Lazy load modals — only loaded when opened
const ReportModal = nextDynamic(() => import('@/components/ReportModal'), { ssr: false })
const LeaderboardModal = nextDynamic(() => import('@/components/LeaderboardModal'), { ssr: false })
const LoginModal = nextDynamic(() => import('@/components/LoginModal'), { ssr: false })
const ProfileModal = nextDynamic(() => import('@/components/ProfileModal'), { ssr: false })
const SearchResultsModal = nextDynamic(() => import('@/components/SearchResultsModal'), { ssr: false })

export const dynamic = 'force-dynamic'

function HomeContent() {
    const searchParams = useSearchParams()
    const view = searchParams.get('view')
    const router = useRouter()
    const t = useTranslations('HomePage')
    const tNav = useTranslations('Navigation')

    const closeModal = () => {
        router.push('/', { scroll: false })
    }

    const openModal = (viewName: string) => {
        router.push(`/?view=${viewName}`, { scroll: false })
    }

    return (
        <div className="min-h-screen pt-28 pb-20 px-4">
            {/* MODALS */}
            {view === 'report' && <ReportModal onClose={closeModal} initialPhone={searchParams.get('phone') || ''} />}
            {view === 'leaderboard' && <LeaderboardModal onClose={closeModal} />}
            {view === 'login' && <LoginModal onClose={closeModal} />}
            {view === 'profile' && <ProfileModal onClose={closeModal} />}
            {view === 'search' && <SearchResultsModal onClose={closeModal} />}
            <LegalConsentModal />

            <div className="container mx-auto max-w-6xl">

                {/* HERO SECTION */}
                <div className="text-center mb-16 sm:mb-24 animate-fade-in">
                    <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold mb-6 text-[#111111] leading-tight">
                        {t('title_part1')} <br className="hidden sm:block" />
                        <span className="text-[#A6845B]">{t('title_part2')}</span>
                    </h1>

                    <p className="text-lg sm:text-xl text-[#666666] max-w-2xl mx-auto mb-10 leading-relaxed">
                        {t('subtitle')}
                    </p>

                    <div className="max-w-xl mx-auto relative z-10">
                        <SearchForm />
                    </div>

                    {/* Trust badges */}
                    <div className="flex flex-wrap justify-center items-center gap-6 mt-8 text-sm text-gray-500">
                        <div className="flex items-center gap-2">
                            <Shield className="w-4 h-4 text-[#8A9A5B]" />
                            <span>Защищено сообществом</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-[#A6845B]" />
                            <span>Активных пользователей: <strong className="text-[#111111]">1,200+</strong></span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Zap className="w-4 h-4 text-[#C06C5F]" />
                            <span>Проверка за секунды</span>
                        </div>
                    </div>
                </div>

                {/* STATS */}
                <div className="mb-20 border-t border-[#E0E0D8] pt-12">
                    <Suspense fallback={<div className="h-32 bg-[#F0F0EB] animate-pulse rounded-xl"></div>}>
                        <StatsOverview />
                    </Suspense>
                </div>

                {/* ADVERTISEMENT BLOCK */}
                <AdSpace type="banner" />

                {/* GRID */}
                <div className="grid lg:grid-cols-2 gap-8 mb-20">
                    <div className="space-y-6">
                        <div className="bg-white border border-[#E0E0D8] rounded-2xl p-6 sm:p-8">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="bg-[#111111] p-2 rounded-lg"><BarChart3 className="w-5 h-5 text-white" /></div>
                                <h2 className="text-xl font-bold text-[#111111]">{t('recent_activity')}</h2>
                            </div>
                            <TopCompanies />
                        </div>
                    </div>

                    <div className="space-y-6">
                        <LiveFeed />

                        <button
                            onClick={() => openModal('report')}
                            className="group relative overflow-hidden bg-[#111111] rounded-2xl p-6 text-white transition-all hover:-translate-y-1 text-left w-full"
                        >
                            <div className="relative z-10 flex justify-between items-start">
                                <div>
                                    <div className="bg-[#333] w-12 h-12 rounded-xl flex items-center justify-center mb-3">
                                        <CheckCircle2 className="w-6 h-6 text-[#A6845B]" />
                                    </div>
                                    <h3 className="text-lg font-bold mb-1">{tNav('report')}</h3>
                                    <p className="text-gray-400 text-sm max-w-xs">
                                        Добавьте номер в базу, чтобы предупредить других.
                                    </p>
                                </div>
                                <ArrowRight className="w-5 h-5 text-[#A6845B] transform group-hover:translate-x-1 transition-transform" />
                            </div>
                        </button>

                        <div className="grid grid-cols-2 gap-4">
                            <Link
                                href="/scams"
                                className="bg-white border border-[#E0E0D8] rounded-2xl p-5 hover:border-[#A6845B] transition-colors group text-left block"
                            >
                                <div className="bg-[#F0F0EB] w-10 h-10 rounded-lg flex items-center justify-center mb-3 group-hover:bg-[#A6845B] transition-colors">
                                    <TrendingUp className="w-5 h-5 text-[#111111] group-hover:text-white" />
                                </div>
                                <h3 className="font-bold text-[#111111] text-sm">{tNav('scams')}</h3>
                                <p className="text-xs text-[#666666] mt-1">Все записи</p>
                            </Link>

                            <button
                                onClick={() => openModal('leaderboard')}
                                className="bg-white border border-[#E0E0D8] rounded-2xl p-5 hover:border-[#A6845B] transition-colors group text-left"
                            >
                                <div className="bg-[#F0F0EB] w-10 h-10 rounded-lg flex items-center justify-center mb-3 group-hover:bg-[#A6845B] transition-colors">
                                    <Award className="w-5 h-5 text-[#111111] group-hover:text-white" />
                                </div>
                                <h3 className="font-bold text-[#111111] text-sm">{tNav('leaderboard')}</h3>
                                <p className="text-xs text-[#666666] mt-1">Активисты</p>
                            </button>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    )
}

export default function HomePage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-[#F9F9F7]"></div>}>
            <HomeContent />
        </Suspense>
    )
}
