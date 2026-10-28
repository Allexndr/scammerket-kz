'use client'

import { usePathname, useRouter } from '@/i18n/routing'
import { Globe } from 'lucide-react'
import { useState } from 'react'

export default function LanguageSwitcher() {
    const router = useRouter()
    const pathname = usePathname()
    const [isOpen, setIsOpen] = useState(false)

    const toggleLanguage = (locale: string) => {
        router.replace(pathname, { locale: locale as any })
        setIsOpen(false)
    }

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-gray-600 hover:bg-[#FAF0E6] transition-colors"
            >
                <Globe className="w-5 h-5 text-[#D2B48C]" />
                <span className="font-medium hidden sm:inline">RU</span>
            </button>

            {isOpen && (
                <div className="absolute top-full right-0 mt-2 w-32 bg-white rounded-xl shadow-xl border border-[#F7E7CE] py-2 z-50 animate-fade-in">
                    {[
                        { code: 'kz', label: 'Қазақша' },
                        { code: 'ru', label: 'Русский' },
                        { code: 'en', label: 'English' },
                    ].map((lang) => (
                        <button
                            key={lang.code}
                            onClick={() => toggleLanguage(lang.code)}
                            className="block w-full text-left px-4 py-2 hover:bg-[#FAF0E6] text-gray-700 transition-colors"
                        >
                            {lang.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}
