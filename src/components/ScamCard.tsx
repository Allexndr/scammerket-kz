'use client'

import Link from 'next/link'
import { ThumbsUp, ThumbsDown, MessageSquare, MapPin, Calendar, User, Building } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ru } from 'date-fns/locale'

interface ScamCardProps {
    scam: {
        _id: string
        phoneNumber: string
        company: string
        scamType: string
        region: string
        description: string
        likes: number
        dislikes: number
        isVerified: boolean
        createdAt: string
        commentCount?: number
    }
}

export default function ScamCard({ scam }: ScamCardProps) {
    const verificationRate = scam.likes + scam.dislikes > 0
        ? Math.round((scam.likes / (scam.likes + scam.dislikes)) * 100)
        : 0

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-1">
                        {scam.company}
                    </h3>
                    <div className="flex items-center text-gray-600 gap-2">
                        <span className="font-mono bg-gray-100 px-2 py-0.5 rounded text-sm">
                            {scam.phoneNumber}
                        </span>
                        {scam.isVerified && (
                            <span className="text-red-600 text-xs font-bold border border-red-200 bg-red-50 px-2 py-0.5 rounded-full">
                                ВЫСОКАЯ УГРОЗА
                            </span>
                        )}
                    </div>
                </div>
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${verificationRate >= 70 ? 'bg-red-100 text-red-700' :
                    verificationRate <= 30 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                    {verificationRate}% риск
                </div>
            </div>

            <p className="text-gray-600 mb-4 line-clamp-3">
                {scam.description}
            </p>

            <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t border-gray-50">
                <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                        <MapPin size={16} />
                        {scam.region}
                    </span>
                    <span className="flex items-center gap-1">
                        <Calendar size={16} />
                        {formatDistanceToNow(new Date(scam.createdAt), { addSuffix: true, locale: ru })}
                    </span>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1 text-green-600">
                        <ThumbsUp size={16} />
                        <span>{scam.likes}</span>
                    </div>
                    <div className="flex items-center gap-1 text-red-600">
                        <ThumbsDown size={16} />
                        <span>{scam.dislikes}</span>
                    </div>
                    <Link
                        href={`/scams/${scam._id}`}
                        className="flex items-center gap-1 text-blue-600 hover:underline ml-2"
                    >
                        <MessageSquare size={16} />
                        <span>{scam.commentCount || 0}</span>
                    </Link>
                </div>
            </div>
        </div>
    )
}
