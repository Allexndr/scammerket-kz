'use client';

import Link from 'next/link';

export default function GlobalNotFound() {
    return (
        <html lang="ru">
            <body className="bg-[#F9F9F7] text-[#111111] antialiased">
                <div className="min-h-screen flex items-center justify-center p-4">
                    <div className="text-center">
                        <h1 className="text-9xl font-black text-[#E0E0D8]">404</h1>
                        <h2 className="text-3xl font-bold mt-4 mb-6">Страница не найдена</h2>
                        <p className="text-gray-500 mb-8">
                            Мы не смогли найти то, что вы искали.
                        </p>
                        <Link
                            href="/"
                            className="bg-[#111111] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#333] transition-colors"
                        >
                            На главную
                        </Link>
                    </div>
                </div>
            </body>
        </html>
    );
}
