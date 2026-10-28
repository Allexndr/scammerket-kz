'use client';

import ReportForm from '@/components/ReportForm';
import DisclaimerBanner from '@/components/DisclaimerBanner';

export default function ReportPage() {
    return (
        <div className="min-h-screen pt-32 px-4 bg-[#F9F9F7]">
            <div className="container mx-auto max-w-2xl text-center mb-10">
                <h1 className="text-3xl sm:text-5xl font-black mb-4">Сообщить о нарушении</h1>
                <p className="text-gray-600">Ваш вклад поможет очистить информационное пространство Казахстана</p>
            </div>
            <div className="container mx-auto max-w-2xl mb-20">
                <DisclaimerBanner />
                <ReportForm />
            </div>
        </div>
    )
}
