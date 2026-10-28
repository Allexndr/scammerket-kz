import type { Metadata } from 'next'
import Link from 'next/link'
import { Phone, Shield, AlertTriangle, ArrowRight, Search } from 'lucide-react'

export const metadata: Metadata = {
    title: 'Типы мошенничества — телефонные scams в Казахстане',
    description: 'Фишинг, вишинг, криптомошенничество, фейковые магазины и другие виды обмана. Узнайте как работают мошенники и как защититься.',
    keywords: ['типы мошенничества', 'фишинг', 'вишинг', 'смшинг', 'криптомошенничество', 'фейковый магазин', 'телефонные мошенники Казахстан'],
}

const scamTypes = [
    { slug: 'phishing', label: 'Банковский фишинг', icon: '🎣', desc: 'Мошенники представляются банком и крадут данные карт' },
    { slug: 'vishing', label: 'Вишинг (телефонный обман)', icon: '📞', desc: 'Звонки от «службы безопасности» с целью получить коды' },
    { slug: 'smishing', label: 'SMS-фишинг', icon: '💬', desc: 'Ссылки в SMS на фишинговые сайты' },
    { slug: 'crypto', label: 'Криптомошенничество', icon: '₿', desc: 'Фейковые инвестиции, пирамиды, кража кошельков' },
    { slug: 'fake_sale', label: 'Фейковая продажа', icon: '🛒', desc: 'Товары по заниженным ценам, предоплата и исчезновение' },
    { slug: 'fake_shop', label: 'Фейковый магазин', icon: '🏪', desc: 'Поддельные интернет-магазины' },
    { slug: 'impersonation', label: 'Лже-сотрудник', icon: '👤', desc: 'Представляются полицией, банком, госуслугами' },
    { slug: 'investment', label: 'Инвестиционная пирамида', icon: '📈', desc: 'Обещания высокой доходности, Ponzi-схемы' },
    { slug: 'loan', label: 'Ложный заём', icon: '💰', desc: 'Предложение кредита с предоплатой' },
    { slug: 'rental', label: 'Мошенничество с арендой', icon: '🏠', desc: 'Сдача несуществующих квартир' },
    { slug: 'prize', label: 'Выигрыш приза', icon: '🎁', desc: '«Вы выиграли» — для получения нужно оплатить комиссию' },
    { slug: 'other', label: 'Другое', icon: '⚠️', desc: 'Прочие виды мошенничества' },
]

export default function ScamTypesPage() {
    return (
        <div className="min-h-screen pt-28 pb-20 px-4 bg-[#F9F9F7]">
            <div className="container mx-auto max-w-5xl">
                <div className="text-center mb-12">
                    <h1 className="text-4xl sm:text-5xl font-black mb-4 text-[#111111]">
                        Типы мошенничества
                    </h1>
                    <p className="text-[#666666] text-lg max-w-2xl mx-auto">
                        Узнайте, как работают мошенники в Казахстане. Проверьте номер телефона в базе.
                    </p>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
                    {scamTypes.map((type) => (
                        <Link
                            key={type.slug}
                            href={`/scams?type=${type.slug}`}
                            className="group bg-white border border-[#E0E0D8] rounded-2xl p-6 hover:border-[#A6845B] hover:shadow-xl transition-all"
                        >
                            <div className="text-3xl mb-3">{type.icon}</div>
                            <h3 className="font-bold text-[#111111] mb-2 group-hover:text-[#A6845B] transition-colors">
                                {type.label}
                            </h3>
                            <p className="text-sm text-gray-500 leading-relaxed">{type.desc}</p>
                            <div className="mt-4 flex items-center gap-1 text-sm font-bold text-[#A6845B] opacity-0 group-hover:opacity-100 transition-opacity">
                                Смотреть номера <ArrowRight className="w-4 h-4" />
                            </div>
                        </Link>
                    ))}
                </div>

                <div className="bg-[#111111] rounded-3xl p-8 sm:p-12 text-center text-white">
                    <Shield className="w-12 h-12 text-[#A6845B] mx-auto mb-4" />
                    <h2 className="text-2xl font-bold mb-3">Проверьте номер телефона</h2>
                    <p className="text-gray-400 mb-6 max-w-md mx-auto">
                        Введите номер, чтобы проверить, есть ли жалобы на него в базе
                    </p>
                    <Link
                        href="/?view=search"
                        className="inline-flex items-center gap-2 bg-[#A6845B] text-white px-8 py-4 rounded-xl font-bold hover:bg-[#8a6d49] transition-colors"
                    >
                        <Search className="w-5 h-5" />
                        Проверить номер
                    </Link>
                </div>
            </div>
        </div>
    )
}
