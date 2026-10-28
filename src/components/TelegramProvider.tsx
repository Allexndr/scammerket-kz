'use client'

import { useEffect, useState } from 'react'
import Script from 'next/script'
import { useUser } from '@/context/UserContext'

// Safe import for SDK
let WebApp: any = null;

export default function TelegramProvider({ children }: { children: React.ReactNode }) {
    const { setUser } = useUser()
    const [isTelegram, setIsTelegram] = useState(false)

    useEffect(() => {
        // Dynamic import to avoid SSR issues
        import('@twa-dev/sdk').then((lib) => {
            WebApp = lib.default

            if (WebApp.initData) {
                setIsTelegram(true)
                WebApp.ready()
                WebApp.expand() // Full height

                // Set Header Color matches theme
                WebApp.setHeaderColor(WebApp.themeParams.bg_color || '#ffffff')

                const user = WebApp.initDataUnsafe.user
                if (user) {
                    // Auto-Login Logic
                    // In a real secure app, we verify the 'initData' signature on backend!
                    // For now, we trust the Webview context (semi-secure for Mini Apps)
                    setUser(prev => ({
                        ...prev!,
                        name: [user.first_name, user.last_name].filter(Boolean).join(' '),
                        telegramId: user.id.toString(),
                        role: 'user', // default
                        points: prev?.points || 0,
                        rank: prev?.rank || 'Новичок',
                        reportsCount: prev?.reportsCount || 0,
                        image: user.photo_url,
                        apiKeys: prev?.apiKeys || []
                    }))
                }
            }
        })
    }, [setUser])

    return (
        <>
            {/* Fallback script load just in case */}
            <Script src="https://telegram.org/js/telegram-web-app.js" strategy="beforeInteractive" />
            <div className={isTelegram ? "twa-mode" : ""}>
                {children}
            </div>
        </>
    )
}
