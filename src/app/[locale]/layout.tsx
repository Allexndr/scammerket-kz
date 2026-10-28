import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import Navigation from '@/components/Navigation';
import { UserProvider } from '@/context/UserContext';
import NextAuthProvider from '@/components/NextAuthProvider';
import '../globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { ToastProvider } from '@/components/ToastProvider';
import ErrorBoundary from '@/components/ErrorBoundary';
import TelegramProvider from '@/components/TelegramProvider';
import ServiceWorkerRegister from '@/components/ServiceWorkerRegister';

export const metadata: Metadata = {
    title: {
        default: 'ScammerKetKz — Проверка номеров мошенников в Казахстане',
        template: '%s | ScammerKetKz',
    },
    description: 'База данных подозрительных номеров и компаний. Проверьте номер телефона, сообщите о мошенничестве, защитите себя и близких.',
    keywords: ['мошенники Казахстан', 'проверка номера', 'скам', 'фишинг', 'вишинг', 'телефонные мошенники', 'Kaspi', 'Halyk Bank', 'антифрод'],
    manifest: '/manifest.json',
    appleWebApp: {
        capable: true,
        statusBarStyle: 'black-translucent',
        title: 'ScammerKet',
    },
    applicationName: 'ScammerKet',
    icons: {
        icon: '/icon.svg',
        apple: '/icon.svg',
    },
    openGraph: {
        title: 'ScammerKetKz — Защита от мошенников в Казахстане',
        description: 'Проверьте номер телефона по базе сообщества. Сообщите о мошенничестве.',
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
    alternates: {
        canonical: '/',
        languages: {
            'ru': '/',
            'kk': '/kz',
            'en': '/en',
        },
    },
};

export const viewport = {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false, // Важно для TWA, чтобы не зумилось
    themeColor: '#111111',
}

export default async function LocaleLayout({
    children,
    params: { locale }
}: {
    children: React.ReactNode;
    params: { locale: string };
}) {
    if (!routing.locales.includes(locale as any)) {
        notFound();
    }

    const messages = await getMessages();

    return (
        <html lang={locale} suppressHydrationWarning>
            <body className="antialiased min-h-screen pt-20">
                <ServiceWorkerRegister />
                <NextIntlClientProvider locale={locale} messages={messages}>
                    <NextAuthProvider>
                        <UserProvider>
                            <ToastProvider>
                                <TelegramProvider>
                                    <ErrorBoundary>
                                        <Navbar />
                                        {children}
                                        <Footer />
                                    </ErrorBoundary>
                                </TelegramProvider>
                            </ToastProvider>
                        </UserProvider>
                    </NextAuthProvider>
                </NextIntlClientProvider>
            </body>
        </html>
    );
}
