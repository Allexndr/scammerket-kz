'use client'

import { useState, useEffect } from 'react'
import { useRouter } from '@/i18n/routing'
import { Search, Building2, Phone } from 'lucide-react'

export default function SearchForm() {
    const router = useRouter()
    const [query, setQuery] = useState('')
    const [type, setType] = useState<'phone' | 'company'>('phone')
    const [totalRecords, setTotalRecords] = useState<number | null>(null)

    useEffect(() => {
        fetch('/api/stats')
            .then(res => res.json())
            .then(data => setTotalRecords(data.totalScams))
            .catch(err => console.error(err))
    }, [])

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!query.trim()) return

        router.push(`/?q=${encodeURIComponent(query)}&type=${type}&view=search`, { scroll: false })
    }

    return (
        <form onSubmit={handleSubmit} className="w-full flex flex-col items-center gap-6">
            <div className="flex gap-2 p-1 bg-[#F0F0EB] rounded-lg">
                <button
                    type="button"
                    onClick={() => setType('phone')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all text-xs font-bold uppercase tracking-wider ${type === 'phone' ? 'bg-[#111111] text-white' : 'text-[#444444] hover:bg-white/50'
                        }`}
                >
                    <Phone className="w-3.5 h-3.5" />
                    По номеру
                </button>
                <button
                    type="button"
                    onClick={() => setType('company')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all text-xs font-bold uppercase tracking-wider ${type === 'company' ? 'bg-[#111111] text-white' : 'text-[#444444] hover:bg-white/50'
                        }`}
                >
                    <Building2 className="w-3.5 h-3.5" />
                    По компании
                </button>
            </div>

            <div className="w-full relative group">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={type === 'phone' ? "Введите номер телефона..." : "Название организации..."}
                    className="w-full px-6 py-5 rounded-none border border-[#E0E0D8] bg-white text-[#111111] text-xl outline-none focus:border-[#A6845B] transition-all text-center shadow-sm group-hover:shadow-md"
                />
                <Search className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-300 w-6 h-6" />
            </div>

            <button
                type="submit"
                disabled={!query.trim()}
                className="btn-primary px-16 py-4 text-lg min-w-[280px] border-b-4 border-black/20 hover:border-bronze disabled:opacity-50"
            >
                Найти в базе
            </button>

            <div className="flex flex-col items-center gap-2">
                <p
                    className="text-[10px] text-[#A6845B] font-bold uppercase tracking-[0.2em]"
                    suppressHydrationWarning
                >
                    Проверка по {totalRecords !== null ? totalRecords.toLocaleString() : '...'} записям
                </p>
            </div>
        </form>
    )
}

