import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'ScammerKetKz — Проверка номеров мошенников в Казахстане',
    description: 'База данных подозрительных номеров и компаний. Проверьте номер телефона, сообщите о мошенничестве, защитите себя и близких.',
    keywords: ['мошенники Казахстан', 'проверка номера', 'скам', 'фишинг', 'вишинг', 'телефонные мошенники', 'Kaspi', 'Halyk Bank'],
    openGraph: {
        title: 'ScammerKetKz — Защита от мошенников в Казахстане',
        description: 'Проверьте номер телефона по базе сообщества. Более 1000+ записей о мошенниках.',
        type: 'website',
        locale: 'ru_KZ',
        siteName: 'ScammerKetKz',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'ScammerKetKz — Проверка номеров мошенников',
        description: 'База данных подозрительных номеров в Казахстане',
    },
    robots: {
        index: true,
        follow: true,
    },
}
