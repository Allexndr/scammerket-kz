'use client'

import { Shield, Heart, Github } from 'lucide-react'
import Link from 'next/link'

export default function Footer() {
    return (
        <footer className="bg-[#111111] text-gray-400 mt-20">
            <div className="container mx-auto max-w-6xl px-4 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                    {/* Brand */}
                    <div className="md:col-span-2">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="bg-[#A6845B] p-2 rounded-lg">
                                <Shield className="w-5 h-5 text-white" />
                            </div>
                            <span className="font-bold text-xl text-white">
                                ScammerKet<span className="text-[#A6845B]">Kz</span>
                            </span>
                        </div>
                        <p className="text-sm leading-relaxed max-w-md">
                            Общественная платформа для защиты от мошенников в Казахстане.
                            Проверяйте номера, сообщайте о мошенничестве, защищайте себя и близких.
                        </p>
                    </div>

                    {/* Links */}
                    <div>
                        <h4 className="text-white font-bold mb-4 text-sm uppercase tracking-wider">Навигация</h4>
                        <ul className="space-y-2 text-sm">
                            <li><Link href="/" className="hover:text-white transition-colors">Главная</Link></li>
                            <li><Link href="/scams" className="hover:text-white transition-colors">База мошенников</Link></li>
                            <li><Link href="/registry" className="hover:text-white transition-colors">Реестр (соцсети)</Link></li>
                            <li><Link href="/types" className="hover:text-white transition-colors">Типы мошенничества</Link></li>
                            <li><Link href="/report" className="hover:text-white transition-colors">Сообщить</Link></li>
                            <li><Link href="/leaderboard" className="hover:text-white transition-colors">Рейтинг</Link></li>
                            <li><Link href="/business" className="hover:text-white transition-colors">API для бизнеса</Link></li>
                        </ul>
                    </div>

                    {/* Support */}
                    <div>
                        <h4 className="text-white font-bold mb-4 text-sm uppercase tracking-wider">Поддержать</h4>
                        <p className="text-xs mb-4">
                            Проект существует на пожертвования и доходы от API. Помогите нам защищать больше людей.
                        </p>
                        <a
                            href="https://t.me/scammerketkz"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-[#A6845B] text-white rounded-xl text-sm font-bold hover:bg-[#8a6f49] transition-colors"
                        >
                            <Heart className="w-4 h-4" />
                            Поддержать
                        </a>
                    </div>
                </div>

                {/* Bottom bar */}
                <div className="border-t border-gray-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-xs text-gray-500">
                        © {new Date().getFullYear()} ScammerKetKz. Данные предоставлены сообществом.
                    </p>
                    <div className="flex items-center gap-4 text-xs">
                        <Link href="/privacy" className="hover:text-white transition-colors">Конфиденциальность</Link>
                        <span className="text-gray-600">•</span>
                        <span className="text-gray-500">AS IS · UGC</span>
                    </div>
                </div>
            </div>
        </footer>
    )
}
