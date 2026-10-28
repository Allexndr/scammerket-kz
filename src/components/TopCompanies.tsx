'use client'

import { useEffect, useState } from 'react'
import { Building2, TrendingUp, AlertTriangle } from 'lucide-react'
import Link from 'next/link'

interface CompanyData {
  company: string
  count: number
  verificationRate: number
}

export default function TopCompanies() {
  const [companies, setCompanies] = useState<any[]>([])

  useEffect(() => {
    fetch('/api/top-companies')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setCompanies(data)
        }
      })
      .catch(console.error)
  }, [])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-[#111111] flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-[#A6845B]" />
          Топ угроз по компаниям
        </h3>
      </div>

      <div className="space-y-3">
        {companies.length === 0 ? (
          <div className="text-center py-8 text-gray-500 text-sm">Данные загружаются...</div>
        ) : (
          companies.map((item, idx) => (
            <div
              key={item.company || idx}
              className="group flex items-center justify-between p-4 bg-white border border-[#E0E0D8] hover:border-[#A6845B] transition-all hover:shadow-md"
            >
              <div className="flex items-center gap-4">
                <span className="text-2xl font-serif font-black text-[#A6845B]/20 group-hover:text-[#A6845B]/40 transition-colors">
                  {idx + 1}
                </span>
                <div>
                  <h4 className="font-bold text-[#111111]">{item.company}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 ${item.risk === 'Критический' ? 'bg-[#C06C5F] text-white' :
                      item.risk === 'Высокий' ? 'bg-[#E6B89C] text-[#111111]' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                      {item.risk} риск
                    </span>
                    <span className="text-[10px] text-gray-400 font-mono">
                      ID: {840 + idx * 42}
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-[#111111]">{item.count}</div>
                <div className="text-[10px] uppercase text-gray-400 font-bold">Жалоб</div>
              </div>
            </div>
          )))}
      </div>

      <Link
        href="/?view=leaderboard"
        className="block text-center py-3 text-sm font-bold text-[#A6845B] hover:bg-[#A6845B]/5 border border-dashed border-[#A6845B]/30 mt-6 transition-all"
      >
        Смотреть весь список (100+)
      </Link>
    </div>
  )
}

