/**
 * @jest-environment jsdom
 */

import { render, screen } from '@testing-library/react'
import ReportPage from '@/app/report/page'

// Mock components
jest.mock('@/components/ReportForm', () => ({
  __esModule: true,
  default: () => <div data-testid="report-form">Report Form Component</div>
}))

jest.mock('@/components/Disclaimer', () => ({
  __esModule: true,
  default: () => <div data-testid="disclaimer">Disclaimer Component</div>
}))

describe('ReportPage Integration', () => {
  it('renders page with correct title and description', () => {
    render(<ReportPage />)

    expect(screen.getByText('Сообщить о мошеннике')).toBeInTheDocument()
    expect(screen.getByText('Помогите другим пользователям избежать мошенничества')).toBeInTheDocument()
  })

  it('includes disclaimer component', () => {
    render(<ReportPage />)

    expect(screen.getByTestId('disclaimer')).toBeInTheDocument()
  })

  it('includes report form component', () => {
    render(<ReportPage />)

    expect(screen.getByTestId('report-form')).toBeInTheDocument()
  })

  it('has proper page structure', () => {
    render(<ReportPage />)

    // Should have heading
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()

    // Should have proper container structure
    const container = screen.getByText('Сообщить о мошеннике').closest('.container')
    expect(container).toBeInTheDocument()
  })

  it('has responsive design classes', () => {
    render(<ReportPage />)

    const mainContainer = screen.getByText('Сообщить о мошеннике').closest('.max-w-2xl')
    expect(mainContainer).toBeInTheDocument()
  })

  it('maintains semantic structure', () => {
    render(<ReportPage />)

    // Should have proper heading
    const heading = screen.getByRole('heading', { level: 1 })
    expect(heading).toHaveTextContent('Сообщить о мошеннике')

    // Should have descriptive text
    expect(screen.getByText('Помогите другим пользователям избежать мошенничества')).toBeInTheDocument()
  })

  it('has consistent card styling', () => {
    render(<ReportPage />)

    const formCard = screen.getByTestId('report-form').closest('.bg-white')
    expect(formCard).toHaveClass('rounded-lg', 'shadow-md', 'p-6')
  })

  it('follows design system patterns', () => {
    render(<ReportPage />)

    // Check spacing and layout
    const mainContainer = screen.getByText('Сообщить о мошеннике').closest('.container')
    expect(mainContainer).toBeInTheDocument()

    // Check that components are properly contained
    expect(screen.getByTestId('disclaimer')).toBeInTheDocument()
    expect(screen.getByTestId('report-form')).toBeInTheDocument()
  })
})


