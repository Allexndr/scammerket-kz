'use client'

import { useEffect, useState } from 'react'
import { Trophy, Medal, Award } from 'lucide-react'

interface UserRank {
  _id: string
  name: string
  rank: string
  points: number
  reportsCount: number
  votesCount: number
}

export default function LeaderboardTable() {
  const [users, setUsers] = useState<UserRank[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchLeaderboard() {
      try {
        const response = await fetch('/api/leaderboard')
        if (response.ok) {
          const data = await response.json()
          setUsers(data.users || [])
        } else {
          setUsers([])
        }
      } catch (error) {
        console.error('Error fetching leaderboard:', error)
        setUsers([])
      } finally {
        setLoading(false)
      }
    }

    fetchLeaderboard()
  }, [])

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-300 rounded w-1/4"></div>
                <div className="h-3 bg-gray-300 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Trophy className="w-6 h-6 text-yellow-500" />
      case 1:
        return <Medal className="w-6 h-6 text-gray-400" />
      case 2:
        return <Award className="w-6 h-6 text-orange-600" />
      default:
        return <span className="w-6 h-6 flex items-center justify-center text-lg font-bold text-gray-500">{index + 1}</span>
    }
  }

  const getRankColor = (rank: string) => {
    switch (rank) {
      case 'Мастер':
        return 'bg-purple-100 text-purple-800'
      case 'Эксперт':
        return 'bg-green-100 text-green-800'
      case 'Охотник':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900">Топ участников</h2>
      </div>

      <div className="divide-y divide-gray-200">
        {users.map((user, index) => (
          <div key={user._id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0">
                {getRankIcon(index)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-semibold text-gray-900 truncate">
                    {user.name}
                  </h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRankColor(user.rank)}`}>
                    {user.rank}
                  </span>
                </div>

                <div className="mt-1 flex items-center gap-4 text-sm text-gray-600">
                  <span>⭐ {user.points} очков</span>
                  <span>📝 {user.reportsCount} отчетов</span>
                  <span>🗳️ {user.votesCount} голосов</span>
                </div>
              </div>

              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">
                  {user.points}
                </div>
                <div className="text-xs text-gray-500">
                  очков
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {users.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">🏆</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Пока нет участников</h3>
          <p className="text-gray-600 mb-6">
            Будьте первым! Сообщите о нарушении и заработайте очки.
          </p>
          <a
            href="/report"
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-300 transform hover:-translate-y-1 shadow-lg"
          >
            Стать первым участником
          </a>
        </div>
      ) : (
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <div className="text-center text-sm text-gray-600">
            Хотите попасть в рейтинг? <a href="/report" className="text-blue-600 hover:underline">Сообщите о нарушении</a>
          </div>
        </div>
      )}
    </div>
  )
}
