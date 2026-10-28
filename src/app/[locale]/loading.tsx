import { Shield } from 'lucide-react'

export default function Loading() {
    return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center">
            <div className="relative">
                <Shield className="w-16 h-16 text-[#A6845B] animate-pulse" />
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 border-4 border-[#A6845B]/20 border-t-[#A6845B] rounded-full animate-spin"></div>
                </div>
            </div>
            <p className="mt-4 text-gray-500 font-medium animate-pulse">Загрузка...</p>
        </div>
    )
}
