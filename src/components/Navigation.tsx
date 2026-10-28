'use client'

import { useState, useEffect } from 'react'
import { Link, usePathname } from '@/i18n/routing'
import { Shield, Menu, X, User } from 'lucide-react'
import LanguageSwitcher from './LanguageSwitcher'
import { useSearchParams } from 'next/navigation'
import { useUser } from '@/context/UserContext'

export default function Navigation() {
    const [isOpen, setIsOpen] = useState(false)
    const [scrolled, setScrolled] = useState(false)
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const view = searchParams.get('view')
    const { isLoggedIn, user } = useUser()

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 10)
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    // Use query params for navigation where possible to keep SPA feel
    const navLinks = [
        { href: '/', label: 'Главная', active: !view },
        // { href: '/?view=scams', label: 'База данных', active: view === 'scams' },
        { href: '/?view=report', label: 'Сообщить', active: view === 'report' },
        { href: '/?view=leaderboard', label: 'Рейтинг', active: view === 'leaderboard' },
    ]

    return (
        <nav
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b ${scrolled
                ? 'bg-[#F9F9F7]/95 backdrop-blur-md border-[#E0E0D8] shadow-sm'
                : 'bg-transparent border-transparent py-2'
                }`}
        >
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16 sm:h-20">
                    {/* Logo */}
                    <Link
                        href="/"
                        className="flex items-center gap-3 group"
                    >
                        <div className="bg-[#111111] p-2 rounded-lg group-hover:bg-[#A6845B] transition-colors duration-300">
                            <Shield className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-xl sm:text-2xl font-bold tracking-tight text-[#111111]">
                            ScammerKet<span className="text-[#A6845B]">.kz</span>
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden lg:flex items-center gap-1">
                        {navLinks.map((link) => (
                            <Link
                                key={link.label}
                                href={link.href}
                                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors duration-200 ${link.active
                                    ? 'bg-[#F0F0EB] text-[#111111]'
                                    : 'text-[#444444] hover:text-[#111111] hover:bg-[#F0F0EB]/50'
                                    }`}
                            >
                                {link.label}
                            </Link>
                        ))}

                        <div className="mx-2 h-6 w-px bg-[#E0E0D8]"></div>

                        {/* Auth Button */}
                        {isLoggedIn && user ? (
                            <Link
                                href="/?view=profile"
                                className="flex items-center gap-2 pl-2 pr-4 py-1.5 bg-[#111111] text-white rounded-lg hover:bg-[#333] transition-colors"
                            >
                                <div className="w-6 h-6 rounded bg-[#A6845B] flex items-center justify-center text-[10px] font-bold text-black">
                                    {user.name.charAt(0)}
                                </div>
                                <span className="text-sm font-medium">{user.points} pts</span>
                            </Link>
                        ) : (
                            <Link
                                href="/?view=login"
                                className="px-5 py-2 rounded-lg text-sm font-bold bg-[#111111] text-white hover:bg-[#333] transition-colors"
                            >
                                Войти
                            </Link>
                        )}

                        <div className="ml-2 pl-2 border-l border-[#E0E0D8]">
                            <LanguageSwitcher />
                        </div>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="lg:hidden p-2 rounded-lg text-[#111111] hover:bg-[#F0F0EB]"
                        aria-label="Toggle menu"
                    >
                        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="lg:hidden absolute top-full left-0 right-0 bg-[#F9F9F7] border-b border-[#E0E0D8] shadow-lg">
                    <div className="container mx-auto px-4 py-4 space-y-2">
                        {navLinks.map((link) => (
                            <Link
                                key={link.label}
                                href={link.href}
                                onClick={() => setIsOpen(false)}
                                className={`block px-4 py-3 rounded-lg text-base font-semibold ${link.active
                                    ? 'bg-[#F0F0EB] text-[#111111]'
                                    : 'text-[#444444] hover:bg-[#F0F0EB]'
                                    }`}
                            >
                                {link.label}
                            </Link>
                        ))}
                        <div className="pt-2 mt-2 border-t border-[#E0E0D8]">
                            <LanguageSwitcher />
                        </div>
                    </div>
                </div>
            )}
        </nav>
    )
}
