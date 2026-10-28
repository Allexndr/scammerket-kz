'use client'

import { createContext, useContext, useState, useEffect, ReactNode, Dispatch, SetStateAction } from 'react'
import { useSession, signOut } from "next-auth/react"

type Rank = 'Новичок' | 'Охотник' | 'Эксперт' | 'Легенда'

// Basic User Type for Context
export interface User {
    id?: string;
    name: string;
    email?: string;
    phone?: string;
    image?: string;
    telegramId?: string;
    points: number;
    rank: string;
    role: 'user' | 'admin' | 'moderator';
    reportsCount: number;
    // Hybrid type: can be full objects (local) or strings (from basic DB fetch)
    // We will normalize to objects where possible
    reports: Array<{
        id: string; // or just string if it's an ID
        phone?: string;
        date: string;
        pointsEarned?: number;
        status?: string;
    } | any>;
    apiKeys?: {
        key: string;
        name: string;
        createdAt: string;
        lastUsed?: string;
        isActive: boolean;
        limit?: number;
        usage?: number;
    }[];
}

interface UserContextType {
    user: User | null
    isLoggedIn: boolean
    login: (phone: string, name?: string) => void
    logout: () => void
    addReportPoints: (details: { hasCompany: boolean, hasDescription: boolean }) => void
    setUser: Dispatch<SetStateAction<User | null>> // <--- EXPOSED NOW
}

const UserContext = createContext<UserContextType | undefined>(undefined)

const RANKS = [
    { name: 'Новичок', min: 0 },
    { name: 'Охотник', min: 50 },
    { name: 'Эксперт', min: 200 },
    { name: 'Легенда', min: 1000 }
] as const

const getRank = (points: number): Rank => {
    return [...RANKS].reverse().find(r => points >= r.min)?.name as Rank || 'Новичок'
}

export function UserProvider({ children }: { children: ReactNode }) {
    const { data: session, status } = useSession()
    const [user, setUser] = useState<User | null>(null)

    // Sync with NextAuth session and fetch full profile
    useEffect(() => {
        if (status === 'authenticated' && session?.user) {
            // Optimistic update
            setUser(prev => ({
                name: session?.user?.name || prev?.name || 'Пользователь Google',
                email: session?.user?.email || prev?.email,
                image: session?.user?.image || prev?.image,
                role: 'user', // Default role
                points: prev?.points || 0,
                rank: prev?.rank || 'Новичок',
                reportsCount: prev?.reportsCount || 0,
                reports: [],
                apiKeys: [],
                ...prev // Keep existing valid data if any
            } as User))

            // Fetch full profile from DB
            fetch('/api/profile/me')
                .then(res => res.json())
                .then(data => {
                    if (data && !data.error) {
                        setUser(prev => ({ ...prev!, ...data }))
                    }
                })
                .catch(err => console.error('Failed to load profile', err))
        }
    }, [session, status])

    useEffect(() => {
        // Restore session from local storage (legacy phone login)
        const saved = localStorage.getItem('scam_user')
        if (saved && !session) { // Only restore local if no Google session
            try {
                setUser(JSON.parse(saved))
            } catch (e) {
                localStorage.removeItem('scam_user')
            }
        }
    }, [session])

    useEffect(() => {
        if (user) {
            localStorage.setItem('scam_user', JSON.stringify(user))
        } else {
            localStorage.removeItem('scam_user')
        }
    }, [user])

    const login = (phone: string, name?: string) => {
        // Check if this is the Admin user (Emulator)
        if (phone === 'Admin' || phone === 'admin' || phone === '+77777777777') {
            setUser({
                name: 'Админ',
                phone: '+7 (777) 777-77-77',
                points: 250,
                rank: 'Легенда',
                role: 'admin',
                reportsCount: 10,
                reports: [
                    { id: '10', phone: '+77053341201', date: '2025-12-20', pointsEarned: 25, status: 'verified' },
                    { id: '9', phone: '+77052015923', date: '2025-12-19', pointsEarned: 25, status: 'verified' },
                ]
            } as User)
        } else {
            // Regular user
            setUser({
                name: name || 'Анонимный Борец',
                phone,
                points: 0,
                rank: 'Новичок',
                role: 'user',
                reportsCount: 0,
                reports: []
            } as User)
        }
    }

    const logout = async () => {
        setUser(null)
        localStorage.removeItem('scam_user')
        if (session) {
            await signOut({ redirect: false })
        }
    }

    const addReportPoints = ({ hasCompany, hasDescription }: { hasCompany: boolean, hasDescription: boolean }) => {
        if (!user) return

        let earned = 10 // Base
        if (hasCompany) earned += 15
        if (hasDescription) earned += 5

        const newPoints = user.points + earned
        const newRank = getRank(newPoints)

        const newReport = {
            id: Date.now().toString(),
            phone: '+7 (xxx) xxx-xx-xx',
            date: new Date().toISOString(),
            pointsEarned: earned,
            status: 'pending' as const
        }

        setUser({
            ...user,
            points: newPoints,
            rank: newRank,
            reportsCount: user.reportsCount + 1,
            reports: [newReport, ...user.reports]
        })
    }

    return (
        <UserContext.Provider value={{ user, isLoggedIn: !!user, login, logout, addReportPoints, setUser }}>
            {children}
        </UserContext.Provider>
    )
}

export const useUser = () => {
    const context = useContext(UserContext)
    if (!context) throw new Error('useUser must be used within UserProvider')
    return context
}
