import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { supabaseAdmin } from '@/lib/supabase'
import SearchForm from '@/components/SearchForm'
import AdSpace from '@/components/AdSpace'
import Link from 'next/link'
import { Shield, AlertTriangle, MessageSquarePlus, Search } from 'lucide-react'

// Allow dynamic params
export const dynamic = 'force-dynamic'

interface PageProps {
    params: {
        phone: string
        locale: string
    }
}

async function getScamByPhone(phone: string) {
    try {
        const cleanPhone = phone.replace(/\D/g, '')
        const { data: scam } = await supabaseAdmin
            .from('scams')
            .select('id, phone_number, company, scam_type, description, likes, dislikes, is_verified')
            .or(`phone_number.eq.${cleanPhone},phone_number.eq.+${cleanPhone},phone_number.eq.${phone}`)
            .limit(1)
            .single()

        return scam || null
    } catch (e) {
        return null
    }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const phone = params.phone
    return {
        title: `Кто звонил с номера ${phone}? Отзывы и проверка | ScammerKet`,
        description: `Узнайте, кто звонил с ${phone}. Проверка на мошенничество, отзывы реальных людей, уровень риска. Бесплатная база номеров Казахстана.`,
    }
}

export default async function PhonePage({ params }: PageProps) {
    const { phone } = params
    const scam = await getScamByPhone(phone)
    const formattedPhone = phone.replace(/(\d{1})(\d{3})(\d{3})(\d{2})(\d{2})/, '+$1 ($2) $3-$4-$5')

    if (scam) {
        return (
            <div className="min-h-screen bg-[#F9F9F7] py-12 px-4">
                <div className="container mx-auto max-w-4xl">
                    <Link href="/" className="text-gray-500 mb-8 inline-block hover:text-black">← На главную</Link>

                    <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-red-100">
                        <div className="bg-red-50 p-8 border-b border-red-100">
                            <div className="flex items-center gap-4 mb-4">
                                <AlertTriangle className="w-12 h-12 text-red-500" />
                                <h1 className="text-3xl md:text-4xl font-black text-[#111111]">
                                    Внимание! Номер найден в базе
                                </h1>
                            </div>
                            <p className="text-xl text-gray-700">
                                Номер <strong>{formattedPhone}</strong> отмечен как подозрительный.
                            </p>
                        </div>

                        <div className="p-8">
                            <div className="grid md:grid-cols-2 gap-8">
                                <div>
                                    <h3 className="text-gray-500 text-sm uppercase tracking-wider mb-2">Компания / Тег</h3>
                                    <p className="text-2xl font-bold mb-6">{scam.company || 'Не указана'}</p>

                                    <h3 className="text-gray-500 text-sm uppercase tracking-wider mb-2">Категория</h3>
                                    <span className="inline-block bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-bold mb-6">
                                        {scam.scam_type}
                                    </span>
                                </div>
                                <div>
                                    <div className="bg-gray-50 p-6 rounded-xl">
                                        <div className="text-4xl font-black text-center mb-2 text-red-600">
                                            {scam.likes + scam.dislikes > 0
                                                ? Math.round((scam.likes / (scam.likes + scam.dislikes)) * 100)
                                                : 0}%
                                        </div>
                                        <div className="text-center text-gray-500 text-sm font-medium">Индекс опасности</div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 pt-8 border-t border-gray-100">
                                <h3 className="text-xl font-bold mb-4">Детали отчета:</h3>
                                <p className="text-gray-600 leading-relaxed text-lg">
                                    {scam.description}
                                </p>
                            </div>

                            <div className="mt-8">
                                <Link
                                    href={`/scams/${scam.id}`}
                                    className="w-full block text-center bg-[#111111] text-white py-4 rounded-xl font-bold hover:bg-gray-800 transition-colors"
                                >
                                    Смотреть полные детали и комментарии
                                </Link>
                            </div>
                        </div>
                    </div>

                    <AdSpace type="native" className="my-8" />
                </div>
            </div>
        )
    }

    // ==========================================
    // SEO TRAP: Номера нет в базе
    // ==========================================
    return (
        <div className="min-h-screen bg-[#F9F9F7] py-12 px-4">
            <div className="container mx-auto max-w-3xl text-center">
                <Link href="/" className="text-gray-500 mb-12 inline-block hover:text-black">← На главную</Link>

                <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-[#E0E0D8]">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Search className="w-10 h-10 text-[#A6845B]" />
                    </div>

                    <h1 className="text-3xl md:text-5xl font-black text-[#111111] mb-6">
                        Кто звонил с {formattedPhone}?
                    </h1>

                    <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                        Мы пока не получали жалоб на номер <span className="font-bold text-black">{formattedPhone}</span>.
                        Однако этот номер искали уже несколько раз.
                    </p>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-10 text-left">
                        <h3 className="font-bold text-yellow-900 mb-2 flex items-center gap-2">
                            <Shield className="w-5 h-5" />
                            Будьте осторожны!
                        </h3>
                        <p className="text-yellow-800">
                            Отсутствие отзывов не гарантирует безопасность. Мошенники часто меняют номера.
                            Если вам звонили с подозрительным предложением — сообщите нам.
                        </p>
                    </div>

                    <div className="grid gap-4">
                        <Link
                            href={`/?view=report&phone=${phone}`}
                            className="w-full bg-[#111111] text-white text-lg font-bold py-4 rounded-xl hover:bg-gray-800 transition-all transform hover:-translate-y-1 shadow-lg flex items-center justify-center gap-3"
                        >
                            <MessageSquarePlus className="w-6 h-6" />
                            Оставить первый отзыв
                        </Link>

                        <p className="text-sm text-gray-400 mt-4">
                            Ваш отзыв поможет тысячам других людей избежать обмана.
                        </p>
                    </div>
                </div>

                <div className="mt-12">
                    <h2 className="text-2xl font-bold mb-6">Проверить другой номер</h2>
                    <SearchForm />
                </div>

                <AdSpace type="banner" className="mt-12" />
            </div>
        </div>
    )
}
