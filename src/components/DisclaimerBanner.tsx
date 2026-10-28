'use client'

import { Info, X } from 'lucide-react'
import { useState, useEffect } from 'react'

export default function DisclaimerBanner() {
    const [visible, setVisible] = useState(false)

    useEffect(() => {
        const dismissed = localStorage.getItem('disclaimer-dismissed')
        if (!dismissed) setVisible(true)
    }, [])

    const handleDismiss = () => {
        localStorage.setItem('disclaimer-dismissed', '1')
        setVisible(false)
    }

    if (!visible) return null

    return (
        <div className="bg-[#FFF8E7] border border-[#E8D44D]/30 rounded-xl p-4 mb-6 flex items-start gap-3">
            <Info className="w-5 h-5 text-[#B8860B] flex-shrink-0 mt-0.5" />
            <div className="flex-1 text-sm text-[#5a4a00]">
                <p className="font-bold mb-1">Важно</p>
                <p className="text-xs leading-relaxed">
                    Номера телефонов публикуются открыто для защиты общества от мошенников.
                    Данные предоставлены пользователями (UGC) и не являются официальным подтверждением.
                    Если вас оклеветали —{' '}
                    <a href="/report?type=appeal" className="underline font-bold">подайте жалобу</a>.
                </p>
            </div>
            <button
                onClick={handleDismiss}
                className="text-[#B8860B] hover:text-[#5a4a00] flex-shrink-0"
                aria-label="Закрыть"
            >
                <X className="w-4 h-4" />
            </button>
        </div>
    )
}
