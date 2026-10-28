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

describe('ReportPage', () => {
  it('renders the page heading', () => {
    render(<ReportPage />)

    expect(screen.getByText('Сообщить о мошеннике')).toBeInTheDocument()
  })

  it('renders the subtitle', () => {
    render(<ReportPage />)

    expect(screen.getByText('Помогите другим пользователям избежать мошенничества')).toBeInTheDocument()
  })

  it('renders the disclaimer component', () => {
    render(<ReportPage />)

    expect(screen.getByTestId('disclaimer')).toBeInTheDocument()
  })

  it('renders the report form component', () => {
    render(<ReportPage />)

    expect(screen.getByTestId('report-form')).toBeInTheDocument()
  })

  it('has proper container styling', () => {
    render(<ReportPage />)

    const container = screen.getByText('Сообщить о мошеннике').closest('.container')
    expect(container).toBeInTheDocument()
  })

  it('has proper max width container', () => {
    render(<ReportPage />)

    const maxWidthContainer = screen.getByText('Сообщить о мошеннике').closest('.max-w-2xl')
    expect(maxWidthContainer).toBeInTheDocument()
  })

  it('has proper card styling for the form section', () => {
    render(<ReportPage />)

    const formSection = screen.getByTestId('report-form').closest('.bg-white')
    expect(formSection).toHaveClass('rounded-lg', 'shadow-md', 'p-6')
  })
})



