'use client'

import { useState, useEffect } from 'react'
import { MessageSquare, Send } from 'lucide-react'
import { useUser } from '@/context/UserContext'
import { useToast } from '@/components/ToastProvider'
import { format } from 'date-fns'
import { useRouter } from 'next/navigation'
import { ru } from 'date-fns/locale'

interface Comment {
    _id: string
    id?: string
    userName: string
    text: string
    createdAt: string
}

export default function CommentsSection({ scamId }: { scamId: string }) {
    const { user } = useUser()
    const { showToast } = useToast()
    const router = useRouter()
    const [comments, setComments] = useState<Comment[]>([])
    const [newComment, setNewComment] = useState('')
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)

    useEffect(() => {
        fetchComments()
    }, [scamId])

    const fetchComments = async () => {
        try {
            const res = await fetch(`/api/scams/${scamId}/comments`)
            if (res.ok) {
                const data = await res.json()
                setComments(data)
            }
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!user) {
            showToast('Войдите, чтобы оставить комментарий', 'info')
            router.push('/?view=login')
            return
        }
        if (!newComment.trim()) return

        setSubmitting(true)
        try {
            const res = await fetch(`/api/scams/${scamId}/comments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    text: newComment
                })
            })

            if (res.ok) {
                const savedComment = await res.json()
                setComments([savedComment, ...comments])
                setNewComment('')
                showToast('Комментарий добавлен', 'success')
            } else {
                const err = await res.json()
                showToast(err.error || 'Ошибка', 'error')
            }
        } catch (e) {
            console.error(e)
            showToast('Ошибка сети', 'error')
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-[#E0E0D8] p-6 md:p-8">
            <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <MessageSquare className="w-6 h-6 text-[#A6845B]" />
                Обсуждение ({comments.length})
            </h3>

            {/* Comment Form */}
            <form onSubmit={handleSubmit} className="mb-10 relative">
                <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder={user ? "Напишите ваш комментарий..." : "Войдите, чтобы оставить комментарий"}
                    className="w-full bg-[#F9F9F7] border border-[#E0E0D8] rounded-xl p-4 min-h-[120px] outline-none focus:border-[#A6845B] transition-colors resize-none"
                    disabled={submitting}
                />
                <div className="flex justify-between items-center mt-3">
                    <span className="text-xs text-gray-400">
                        Ваш комментарий будет виден всем.
                    </span>
                    <button
                        type="submit"
                        disabled={submitting || !newComment.trim()}
                        className="bg-[#111111] text-white px-6 py-2 rounded-lg font-bold hover:bg-black/80 transition-colors disabled:opacity-50 flex items-center gap-2"
                        onClick={!user ? (e) => { e.preventDefault(); router.push('/?view=login'); } : undefined}
                    >
                        {user ? (
                            <>
                                {submitting ? 'Отправка...' : 'Отправить'} <Send className="w-4 h-4" />
                            </>
                        ) : (
                            'Войти через Telegram'
                        )}
                    </button>
                </div>
            </form>

            <div className="space-y-6">
                {loading ? (
                    <p className="text-center text-gray-400 py-4">Загрузка комментариев...</p>
                ) : comments.length === 0 ? (
                    <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                        <p className="text-gray-500">Пока нет комментариев. Будьте первыми!</p>
                    </div>
                ) : (
                    comments.map((comment) => (
                        <div key={comment._id || comment.id} className="group">
                            <div className="flex justify-between items-start mb-2">
                                <div className="font-bold text-[#111111]">{comment.userName}</div>
                                <div className="text-xs text-gray-400">
                                    {comment.createdAt ? format(new Date(comment.createdAt), 'd MMM yyyy, HH:mm', { locale: ru }) : ''}
                                </div>
                            </div>
                            <p className="text-gray-600 leading-relaxed bg-gray-50 p-4 rounded-xl rounded-tl-none group-hover:bg-[#F9F9F7] transition-colors">
                                {comment.text}
                            </p>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}
