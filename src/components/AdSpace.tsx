'use client'

import { useState } from 'react'
import { X, ExternalLink } from 'lucide-react'

interface AdSpaceProps {
    type?: 'banner' | 'box' | 'native' | 'sidebar'
    className?: string
}

export default function AdSpace({ type = 'banner', className = '' }: AdSpaceProps) {
    const [isVisible, setIsVisible] = useState(true)

    if (!isVisible) return null

    const handleDismiss = (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setIsVisible(false)
    }

    // Native ad — looks like content, not intrusive
    if (type === 'native') {
        return (
            <div className={`my-6 ${className}`}>
                <div className="relative bg-gradient-to-r from-[#F9F9F7] to-[#F0F0EB] border border-[#E0E0D8] rounded-2xl p-5 hover:shadow-md transition-shadow group">
                    <button
                        onClick={handleDismiss}
                        className="absolute top-3 right-3 text-gray-300 hover:text-gray-500 transition-colors"
                        aria-label="Скрыть"
                    >
                        <X className="w-4 h-4" />
                    </button>
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-[9px] uppercase tracking-widest text-gray-400 font-bold">
                            Полезный сервис
                        </span>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex-1">
                            <h4 className="font-bold text-[#111111] mb-1">
                                Защитите свой телефон от спам-звонков
                            </h4>
                            <p className="text-sm text-gray-500">
                                Определитель номера и блокировка мошенников в одном приложении
                            </p>
                        </div>
                        <a
                            href="#"
                            className="flex-shrink-0 px-4 py-2 bg-[#111111] text-white rounded-xl text-sm font-bold hover:bg-[#2a2a2a] transition-colors flex items-center gap-1"
                        >
                            Узнать
                            <ExternalLink className="w-3 h-3" />
                        </a>
                    </div>
                </div>
            </div>
        )
    }

    // Sidebar ad — compact, for sidebars
    if (type === 'sidebar') {
        return (
            <div className={`my-4 ${className}`}>
                <div className="relative bg-white border border-[#E0E0D8] rounded-xl p-4 hover:shadow-md transition-shadow">
                    <button
                        onClick={handleDismiss}
                        className="absolute top-2 right-2 text-gray-300 hover:text-gray-500 transition-colors"
                        aria-label="Скрыть"
                    >
                        <X className="w-3 h-3" />
                    </button>
                    <div className="text-[9px] uppercase tracking-widest text-gray-400 font-bold mb-2">
                        Реклама
                    </div>
                    <div className="text-sm font-bold text-[#111111] mb-1">
                        Проверка номера API
                    </div>
                    <p className="text-xs text-gray-500 mb-3">
                        Интегрируйте проверку мошенников в свой продукт
                    </p>
                    <a
                        href="/business"
                        className="text-xs font-bold text-[#A6845B] hover:underline"
                    >
                        Подробнее →
                    </a>
                </div>
            </div>
        )
    }

    // Banner ad — horizontal, after content
    return (
        <div className={`my-6 ${className}`}>
            <div className="relative bg-[#F9F9F7] border border-[#E0E0D8] rounded-2xl overflow-hidden">
                <button
                    onClick={handleDismiss}
                    className="absolute top-3 right-3 text-gray-300 hover:text-gray-500 transition-colors z-10"
                    aria-label="Скрыть"
                >
                    <X className="w-4 h-4" />
                </button>
                <div className="text-[9px] uppercase tracking-widest text-gray-400 font-bold text-center pt-3">
                    Реклама
                </div>
                <div className="flex items-center justify-center p-6 min-h-[90px]">
                    {/* AdSense / Yandex RSYA container — replace with real ad code */}
                    <div className="text-center text-gray-400 text-sm">
                        <span className="font-bold text-[#111111]">ScammerKetKz API</span>
                        <span className="mx-2">•</span>
                        <span>Проверка номеров для бизнеса</span>
                        <a href="/business" className="ml-3 text-[#A6845B] font-bold hover:underline">
                            Начать →
                        </a>
                    </div>
                    {/* Real ad code:
                    <ins className="adsbygoogle" style={{display:'block'}} data-ad-client="ca-pub-XXX" data-ad-slot="XXX" data-ad-format="auto" />
                    */}
                </div>
            </div>
        </div>
    )
}
