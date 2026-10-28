'use client'

import Link from 'next/link';
import { ShieldAlert } from 'lucide-react';
import SearchForm from '@/components/SearchForm';

export default function NotFound() {
    return (
        <div className="min-h-[80vh] flex items-center justify-center p-4">
            <div className="text-center animate-fade-in">
                <div className="relative inline-block mb-6">
                    <div className="absolute inset-0 bg-[#BC8F8F] blur-3xl opacity-20"></div>
                    <div className="relative bg-gradient-to-br from-[#BC8F8F] to-[#A57C7C] p-4 rounded-3xl shadow-xl">
                        <ShieldAlert className="w-16 h-16 text-white" />
                    </div>
                </div>

                <h1 className="text-6xl font-black mb-4 text-gradient">404</h1>

                <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4">
                    Страница не найдена
                </h2>

                <p className="text-gray-500 mb-8 max-w-md mx-auto">
                    Похоже, этой страницы не существует или она была удалена. Возможно, вы ошиблись в адресе.
                </p>

                <div className="max-w-md mx-auto mb-8 relative z-10">
                    <SearchForm />
                </div>

                <Link
                    href="/"
                    className="text-[#666666] hover:text-[#111111] font-medium transition-colors"
                >
                    Вернуться на главную
                </Link>
            </div>
        </div>
    );
}
