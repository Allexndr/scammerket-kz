'use client'

import { AlertTriangle } from 'lucide-react'

export default function Disclaimer() {
    return (
        <div className="relative overflow-hidden rounded-2xl bg-[#FFFcf5] border border-[#DEB887] p-6 sm:p-8">
            <div className="flex items-start gap-5">
                <div className="flex-shrink-0">
                    <div className="bg-[#FFF4E5] p-3 rounded-xl border border-[#DEB887]">
                        <AlertTriangle className="w-6 h-6 text-[#A6845B]" />
                    </div>
                </div>

                <div className="flex-1">
                    <h3 className="text-lg font-bold mb-3 text-[#111111] uppercase tracking-wide">
                        Официальное уведомление
                    </h3>

                    <div className="space-y-3 text-sm text-[#444444] leading-relaxed">
                        <p className="flex items-start gap-2">
                            <span className="font-bold text-[#A6845B]">01.</span>
                            <span>
                                <strong className="font-bold text-[#111111]">Отсутствие модерации.</strong> Платформа не проверяет достоверность данных перед публикацией. Верификация осуществляется исключительно сообществом через систему голосования.
                            </span>
                        </p>

                        <p className="flex items-start gap-2">
                            <span className="font-bold text-[#A6845B]">02.</span>
                            <span>
                                <strong className="font-bold text-[#111111]">Отказ от ответственности.</strong> Администрация не несет ответственности за возможные неточности. Информация носит справочный характер.
                            </span>
                        </p>

                        <p className="flex items-start gap-2">
                            <span className="font-bold text-[#A6845B]">03.</span>
                            <span>
                                <strong className="font-bold text-[#111111]">Самостоятельное решение.</strong> Используя данные платформы, вы принимаете решение на свой страх и риск.
                            </span>
                        </p>
                    </div>
                </div>
            </div>

            {/* Decorative Stamp Effect */}
            <div className="absolute top-4 right-4 text-[10rem] font-black text-[#A6845B]/5 pointer-events-none rotate-12 select-none">
                !
            </div>
        </div>
    )
}
