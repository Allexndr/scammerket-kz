'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Shield, Menu, X, Briefcase, Bot, User, Users } from 'lucide-react'
import LanguageSwitcher from './LanguageSwitcher'
import { useUser } from '@/context/UserContext'

export default function Navbar() {
    const t = useTranslations('Navigation')
    const [isScrolled, setIsScrolled] = useState(false)
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const pathname = usePathname()
    const { user, isLoggedIn, logout } = useUser()
    const router = useRouter()

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10)
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    const navLinks = [
        { href: '/', label: t('home') },
        { href: '/scams', label: t('scams') },
        { href: '/registry', label: 'Мошенники', icon: Users },
        { href: '/ai', label: 'AI Анализ', icon: Bot },
        { href: '/business', label: 'API', icon: Briefcase },
    ]

    const isLinkActive = (href: string) => {
        if (href === '/') return pathname === '/' || pathname === '/ru' || pathname === '/en' || pathname === '/kk'
        return pathname?.includes(href)
    }

    return (
        <header
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white/80 backdrop-blur-md border-b border-[#E0E0D8] py-3' : 'bg-transparent py-5'
                }`}
        >
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between">
                    {/* LOGO */}
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="bg-[#111111] text-white p-2 rounded-lg group-hover:bg-[#A6845B] transition-colors">
                            <Shield className="w-5 h-5" />
                        </div>
                        <span className="font-bold text-xl tracking-tight text-[#111111]">
                            ScammerKet<span className="text-[#A6845B]">Kz</span>
                        </span>
                    </Link>

                    {/* DESKTOP NAV */}
                    <nav className="hidden md:flex items-center gap-1 bg-white/50 backdrop-blur-sm px-2 py-1.5 rounded-full border border-[#E0E0D8]/50">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${isLinkActive(link.href)
                                        ? 'bg-[#111111] text-white shadow-lg'
                                        : 'text-[#666666] hover:text-[#111111] hover:bg-white'
                                    }`}
                            >
                                {link.icon && <link.icon className="w-4 h-4" />}
                                {link.label}
                            </Link>
                        ))}
                    </nav>

                    {/* RIGHT ACTIONS */}
                    <div className="hidden md:flex items-center gap-3">
                        <LanguageSwitcher />

                        {isLoggedIn ? (
                            <div className="relative group">
                                <Link
                                    href="/profile"
                                    className="flex items-center gap-2 pl-2 pr-4 py-1.5 bg-white border border-[#E0E0D8] rounded-full hover:border-[#A6845B] transition-all"
                                >
                                    <div className="w-8 h-8 rounded-full bg-[#F0F0EB] flex items-center justify-center text-[#111111] font-bold text-sm">
                                        {user?.image ? (
                                            <img src={user.image} alt={user.name} className="w-full h-full rounded-full object-cover" />
                                        ) : (
                                            user?.name?.[0]?.toUpperCase() || <User size={16} />
                                        )}
                                    </div>
                                    <span className="text-sm font-medium text-[#111111] max-w-[100px] truncate">
                                        {user?.name}
                                    </span>
                                </Link>
                            </div>
                        ) : (
                            <Link
                                href="/?view=login"
                                className="bg-[#111111] text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-[#2a2a2a] transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                            >
                                {t('login')}
                            </Link>
                        )}
                    </div>

                    {/* MOBILE MENU BUTTON */}
                    <button
                        className="md:hidden p-2 text-[#111111]"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        {isMobileMenuOpen ? <X /> : <Menu />}
                    </button>
                </div>
            </div>

            {/* MOBILE MENU */}
            {isMobileMenuOpen && (
                <div className="md:hidden absolute top-full left-0 right-0 bg-white border-b border-[#E0E0D8] p-4 shadow-xl animate-fade-in-down">
                    <div className="flex flex-col gap-2">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={`p-3 rounded-xl flex items-center gap-3 font-medium ${isLinkActive(link.href)
                                        ? 'bg-[#F0F0EB] text-[#111111]'
                                        : 'text-[#666666]'
                                    }`}
                            >
                                {link.icon && <link.icon className="w-5 h-5" />}
                                {link.label}
                            </Link>
                        ))}
                        <hr className="border-[#E0E0D8] my-2" />
                        {isLoggedIn ? (
                            <>
                                <Link href="/profile" className="p-3 rounded-xl font-medium text-[#111111] flex items-center gap-3">
                                    <User className="w-5 h-5" />
                                    {t('profile')}
                                </Link>
                                <button onClick={() => { logout(); setIsMobileMenuOpen(false); }} className="p-3 rounded-xl font-medium text-red-600 text-left">
                                    {t('logout')}
                                </button>
                            </>
                        ) : (
                            <Link
                                href="/?view=login"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="p-3 rounded-xl font-bold bg-[#111111] text-white text-center"
                            >
                                {t('login')}
                            </Link>
                        )}
                        <div className="mt-2 flex justify-center">
                            <LanguageSwitcher />
                        </div>
                    </div>
                </div>
            )}
        </header>
    )
}
