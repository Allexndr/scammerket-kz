export interface Badge {
    id: string
    name: string
    description: string
    icon: string
    color: string
    condition: (user: {
        points: number
        reportsCount: number
        verifiedReportsCount: number
        peopleProtected: number
        streak: number
        votes: string[]
    }) => boolean
}

export const BADGES: Badge[] = [
    {
        id: 'first_report',
        name: 'Первый отчёт',
        description: 'Добавили первый номер в базу',
        icon: '📝',
        color: '#8A9A5B',
        condition: (u) => u.reportsCount >= 1,
    },
    {
        id: 'five_reports',
        name: 'Бдительный',
        description: 'Добавили 5 отчётов',
        icon: '👁️',
        color: '#A6845B',
        condition: (u) => u.reportsCount >= 5,
    },
    {
        id: 'ten_reports',
        name: 'Страж',
        description: 'Добавили 10 отчётов',
        icon: '🛡️',
        color: '#C06C5F',
        condition: (u) => u.reportsCount >= 10,
    },
    {
        id: 'fifty_reports',
        name: 'Охотник за мошенниками',
        description: 'Добавили 50 отчётов',
        icon: '🎯',
        color: '#CD7F32',
        condition: (u) => u.reportsCount >= 50,
    },
    {
        id: 'hundred_reports',
        name: 'Легенда',
        description: 'Добавили 100 отчётов',
        icon: '👑',
        color: '#FFD700',
        condition: (u) => u.reportsCount >= 100,
    },
    {
        id: 'first_verified',
        name: 'Правдолюб',
        description: 'Ваш отчёт подтверждён сообществом',
        icon: '✅',
        color: '#8A9A5B',
        condition: (u) => u.verifiedReportsCount >= 1,
    },
    {
        id: 'ten_verified',
        name: 'Точность',
        description: '10 отчётов подтверждены',
        icon: '⭐',
        color: '#A6845B',
        condition: (u) => u.verifiedReportsCount >= 10,
    },
    {
        id: 'protected_100',
        name: 'Защитник',
        description: 'Ваши отчёты защитили 100 человек',
        icon: '🦸',
        color: '#C06C5F',
        condition: (u) => u.peopleProtected >= 100,
    },
    {
        id: 'protected_1000',
        name: 'Герой народа',
        description: 'Ваши отчёты защитили 1,000 человек',
        icon: '🏆',
        color: '#CD7F32',
        condition: (u) => u.peopleProtected >= 1000,
    },
    {
        id: 'voter',
        name: 'Голос сообщества',
        description: 'Проголосовали 10 раз',
        icon: '🗳️',
        color: '#A6845B',
        condition: (u) => u.votes.length >= 10,
    },
    {
        id: 'streak_7',
        name: 'Неделя активности',
        description: '7 дней подряд',
        icon: '🔥',
        color: '#C06C5F',
        condition: (u) => u.streak >= 7,
    },
    {
        id: 'streak_30',
        name: 'Месяц без пропусков',
        description: '30 дней подряд',
        icon: '⚡',
        color: '#FFD700',
        condition: (u) => u.streak >= 30,
    },
    {
        id: 'points_500',
        name: 'Охотник',
        description: 'Набрали 500 очков',
        icon: '🎯',
        color: '#A6845B',
        condition: (u) => u.points >= 500,
    },
    {
        id: 'points_1000',
        name: 'Эксперт',
        description: 'Набрали 1,000 очков',
        icon: '⭐',
        color: '#CD7F32',
        condition: (u) => u.points >= 1000,
    },
]

export function getUserBadges(user: {
    points: number
    reportsCount: number
    verifiedReportsCount: number
    peopleProtected: number
    streak: number
    votes: string[]
}): Badge[] {
    return BADGES.filter(badge => badge.condition(user))
}

export function getNextBadges(user: {
    points: number
    reportsCount: number
    verifiedReportsCount: number
    peopleProtected: number
    streak: number
    votes: string[]
}): Badge[] {
    return BADGES.filter(badge => !badge.condition(user))
        .slice(0, 3)
}
