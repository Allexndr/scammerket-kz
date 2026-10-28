'use client'

import { ReactNode, Component, ErrorInfo } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

interface Props {
    children: ReactNode
}

interface State {
    hasError: boolean
    error?: Error
}

export default class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props)
        this.state = { hasError: false }
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error }
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('ErrorBoundary caught:', error, errorInfo)
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-[60vh] flex flex-col items-center justify-center p-4">
                    <div className="bg-white rounded-2xl border border-[#E0E0D8] p-8 max-w-md text-center">
                        <AlertTriangle className="w-12 h-12 text-[#C06C5F] mx-auto mb-4" />
                        <h2 className="text-xl font-bold text-[#111111] mb-2">
                            Что-то пошло не так
                        </h2>
                        <p className="text-sm text-gray-500 mb-6">
                            Произошла ошибка при загрузке страницы. Попробуйте обновить.
                        </p>
                        <button
                            onClick={() => {
                                this.setState({ hasError: false })
                                window.location.reload()
                            }}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-[#111111] text-white rounded-xl font-bold hover:bg-[#2a2a2a] transition-colors"
                        >
                            <RefreshCw className="w-4 h-4" />
                            Обновить страницу
                        </button>
                    </div>
                </div>
            )
        }

        return this.props.children
    }
}
