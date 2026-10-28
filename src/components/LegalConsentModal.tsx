'use client'

import { useState, useEffect } from 'react'
import { X, Download, Shield, AlertTriangle, FileText, Scale } from 'lucide-react'

export default function LegalConsentModal() {
    const [isOpen, setIsOpen] = useState(false)
    const [hasAccepted, setHasAccepted] = useState(false)

    useEffect(() => {
        // Check if user has already accepted
        const accepted = localStorage.getItem('legal_consent_accepted')
        if (!accepted) {
            // Show modal after 1 second delay for better UX
            setTimeout(() => setIsOpen(true), 1000)
        }
        setHasAccepted(!!accepted)
    }, [])

    const handleAccept = () => {
        localStorage.setItem('legal_consent_accepted', 'true')
        localStorage.setItem('legal_consent_date', new Date().toISOString())
        setHasAccepted(true)
        setIsOpen(false)
    }

    const downloadPolicy = () => {
        const content = generatePolicyDocument()
        const blob = new Blob(['\ufeff', content], { type: 'application/msword' })
        const link = document.createElement('a')
        link.href = URL.createObjectURL(blob)
        link.download = 'Official_Legal_Agreement_ScammerKetKz.doc'
        link.click()
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 animate-fade-in bg-black/80 backdrop-blur-md">
            {/* Modal */}
            <div className="relative w-full max-w-5xl max-h-[92vh] bg-[#F9F9F7] rounded-none border-2 border-black shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden animate-scale-in flex flex-col">
                {/* Header */}
                <div className="relative bg-[#111111] border-b-4 border-[#A6845B] px-8 py-10 text-white text-center">
                    <div className="absolute top-4 left-4 opacity-20">
                        <Scale className="w-16 h-16" />
                    </div>
                    <h2 className="text-3xl sm:text-5xl font-serif font-black tracking-tighter mb-3 uppercase italic">
                        Регламент Платформы
                    </h2>
                    <div className="w-32 h-1 bg-[#A6845B] mx-auto mb-4"></div>
                    <p className="text-sm sm:text-base uppercase tracking-[0.3em] text-[#A6845B] font-bold">
                        Юридический стандарт безопасности • 2026
                    </p>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto px-8 sm:px-16 py-12 scroll-smooth">
                    {/* Official Seal/Notice */}
                    <div className="text-center mb-12">
                        <div className="inline-block p-4 border-2 border-[#111111] mb-6">
                            <AlertTriangle className="w-10 h-10 text-[#A6845B]" />
                        </div>
                        <h3 className="text-2xl font-serif font-bold text-[#111111] mb-4">ОФИЦИАЛЬНОЕ УВЕДОМЛЕНИЕ</h3>
                        <p className="text-sm text-[#666] max-w-xl mx-auto leading-relaxed">
                            Данный документ определяет условия взаимодействия между пользователем и платформой.
                            Продолжение работы с сервисом означает полное и безоговорочное согласие с нижеизложенным регламентом.
                        </p>
                    </div>

                    {/* Legal Sections */}
                    <div className="space-y-16 max-w-3xl mx-auto">
                        {/* Section 1 */}
                        <div className="relative border-t border-[#111111]/10 pt-8">
                            <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#F9F9F7] px-4 font-serif text-2xl font-bold text-[#A6845B]">§ I</span>
                            <div className="text-center mb-6">
                                <h3 className="text-lg font-bold text-[#111111] uppercase tracking-widest">Правовой статус сервиса</h3>
                            </div>
                            <div className="space-y-4 text-justify text-sm text-[#444] leading-loose px-4">
                                <p>1.1. <span className="font-bold">ScammerKetKz</span> функционирует как независимая информационная система, предназначенная для консолидации данных о подозрительных схемах на территории Республики Казахстан.</p>
                                <p>1.2. Платформа является исключительно технической площадкой для размещения пользовательского контента (UGC) и не выступает в качестве органа власти или финансового учреждения.</p>
                                <p>1.3. Верификация данных осуществляется автоматизированно на основе инструментов общественного контроля и коллективного доверия участников.</p>
                            </div>
                        </div>

                        {/* Section 2 */}
                        <div className="relative border-t border-[#111111]/10 pt-8">
                            <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#F9F9F7] px-4 font-serif text-2xl font-bold text-[#A6845B]">§ II</span>
                            <div className="text-center mb-6">
                                <h3 className="text-lg font-bold text-[#111111] uppercase tracking-widest">Эксклюзия ответственности</h3>
                            </div>
                            <div className="bg-[#C06C5F]/5 border-2 border-[#C06C5F]/20 p-8 space-y-4 text-sm text-[#444]">
                                <p className="font-bold text-[#C06C5F] text-center mb-4 uppercase text-xs tracking-[0.2em]">Правовой отказ:</p>
                                <p>• Платформа не гарантирует абсолютную достоверность каждого отзыва, за исключением случаев, подтвержденных правоохранительными органами.</p>
                                <p>• Администрация освобождается от ответственности за последствия любых финансовых операций, совершенных пользователем.</p>
                                <p>• Мы не несем ответственности за оценочные суждения пользователей, если они не нарушают законодательство РК.</p>
                            </div>
                        </div>

                        {/* Section 3 */}
                        <div className="relative border-t border-[#111111]/10 pt-8">
                            <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#F9F9F7] px-4 font-serif text-2xl font-bold text-[#A6845B]">§ III</span>
                            <div className="text-center mb-6">
                                <h3 className="text-lg font-bold text-[#111111] uppercase tracking-widest">Защита данных и приватность</h3>
                            </div>
                            <div className="space-y-4 text-sm text-[#444] leading-relaxed">
                                <div className="flex items-start gap-4 p-4 border border-[#E0E0D8]">
                                    <Shield className="w-8 h-8 text-[#A6845B] shrink-0" />
                                    <p>В соответствии с <span className="font-bold">Законом РК «О персональных данных»</span>, все идентификаторы (номера) подвергаются необратимому одностороннему хешированию. Мы не храним ваши личные данные в открытом виде.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Department Block */}
                    <div className="mt-20 border-2 border-[#111111] p-0 overflow-hidden">
                        <div className="bg-[#111111] text-white px-8 py-3 text-sm font-bold uppercase tracking-widest text-center">
                            Юридический отдел ScammerKetKz
                        </div>
                        <div className="p-8 grid sm:grid-cols-2 gap-8 text-sm text-[#111111]">
                            <div className="space-y-2">
                                <p className="font-bold uppercase text-[10px] text-gray-500">Официальный E-mail</p>
                                <p className="font-serif text-lg">legal@scammerketkz.kz</p>
                            </div>
                            <div className="space-y-2">
                                <p className="font-bold uppercase text-[10px] text-gray-500">Портал поддержки</p>
                                <p className="font-serif text-lg">@scammerketkz_support</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="bg-white border-t-4 border-[#111111] px-8 py-8 flex flex-col sm:flex-row items-center justify-center gap-6">
                    <button
                        onClick={downloadPolicy}
                        className="w-full sm:w-auto px-8 py-4 border-2 border-[#111111] font-bold text-xs uppercase tracking-widest hover:bg-[#111111] hover:text-white transition-all flex items-center justify-center gap-3"
                    >
                        <Download className="w-4 h-4" />
                        Скачать (.DOC)
                    </button>

                    <button
                        onClick={handleAccept}
                        className="w-full sm:w-auto px-16 py-4 bg-[#111111] text-white font-black text-sm uppercase tracking-[0.2em] hover:bg-[#A6845B] transition-all flex items-center justify-center gap-4 shadow-[5px_5px_0px_#A6845B]"
                    >
                        <Shield className="w-5 h-5" />
                        Я подтверждаю согласие
                    </button>
                </div>
            </div>
        </div>
    )
}

function generatePolicyDocument(): string {
    return `
<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head>
    <meta charset="utf-8">
    <title>Legal Agreement ScammerKetKz</title>
    <style>
        body { font-family: 'Times New Roman', Times, serif; color: #111111; line-height: 1.5; }
        h1 { text-align: center; text-transform: uppercase; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 30px; }
        .section { margin-bottom: 20px; text-align: justify; }
        .title { font-weight: bold; text-transform: uppercase; font-size: 14pt; margin-bottom: 15px; display: block; }
        .seal { text-align: center; margin-top: 50px; font-weight: bold; border: 1px solid #000; padding: 20px; display: inline-block; }
        .footer { margin-top: 100px; font-size: 10pt; color: #666; }
    </style>
</head>
<body>
    <h1>Юридическое соглашение и регламент использования</h1>
    <p style="text-align: center; font-weight: bold;">Платформа ScammerKetKz • Казахстан • ${new Date().toLocaleDateString('ru-RU')}</p>
    
    <div class="section">
        <span class="title">I. Общие положения и применимое законодательство</span>
        <p>Настоящее юридическое соглашение (далее — "Соглашение") регламентирует правовые отношения между администрацией Платформы ScammerKetKz (далее — "Сервис") и физическим лицом (пользователем), осуществляющим доступ к Сервису.</p>
        <p>Сервис действует в строгом соответствии с Законом Республики Казахстан "Об онлайн-платформах и онлайн-рекламе" и Законом РК "О персональных данных и их защите".</p>
    </div>

    <div class="section">
        <span class="title">II. Статус информационного контента</span>
        <p>Весь контент, размещаемый на Сервисе, является пользовательским (User Generated Content). Сервис не выступает в качестве органа предварительного следствия или суда.</p>
        <p>Информация носит рекомендательный характер. Статус "Высокая угроза" присваивается на основе коллективного мнения участников сообщества и не является окончательным юридическим вердиктом.</p>
    </div>

    <div class="section">
        <span class="title">III. Ограничение юридической ответственности</span>
        <p>Администрация Сервиса не несет ответственности за любой ущерб (прямой или косвенный), включая, но не ограничиваясь: потерю денежных средств, репутационные риски или моральный вред, возникший в результате использования информации с портала.</p>
    </div>

    <div class="section">
        <span class="title">IV. Обязательства пользователя</span>
        <p>Пользователь обязуется предоставлять только достоверные сведения. Размещение заведомо ложной информации преследуется по закону РК (Статья 274 УК РК - Распространение заведомо ложной информации).</p>
    </div>

    <div class="footer">
        <p>Документ сформирован автоматически цифровой системой ScammerKetKz.</p>
        <p>ID Документа: SRC-LGA-${Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
        <p>&copy; 2026 ScammerKetKz Legal Department.</p>
    </div>
</body>
</html>
    `.trim()
}
