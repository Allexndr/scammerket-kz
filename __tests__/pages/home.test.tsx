import { render, screen, waitFor } from '@testing-library/react'
import HomePage from '@/app/page'

// Mock components
jest.mock('@/components/SearchForm', () => {
  return function MockSearchForm() {
    return <div data-testid="search-form">Search Form</div>
  }
})

jest.mock('@/components/TopCompanies', () => {
  return function MockTopCompanies() {
    return <div data-testid="top-companies">Top Companies</div>
  }
})

jest.mock('@/components/StatsOverview', () => {
  return function MockStatsOverview() {
    return <div data-testid="stats-overview">Stats Overview</div>
  }
})

jest.mock('@/components/Disclaimer', () => {
  return function MockDisclaimer() {
    return <div data-testid="disclaimer">Disclaimer</div>
  }
})

describe('HomePage', () => {
  it('renders all main components', () => {
    render(<HomePage />)

    expect(screen.getByText('AntiScamKZ')).toBeInTheDocument()
    expect(screen.getByText('Платформа против мошенничества в Казахстане')).toBeInTheDocument()

    expect(screen.getByTestId('disclaimer')).toBeInTheDocument()
    expect(screen.getByTestId('search-form')).toBeInTheDocument()
    expect(screen.getByTestId('stats-overview')).toBeInTheDocument()
    expect(screen.getByTestId('top-companies')).toBeInTheDocument()
  })

  it('renders navigation links', () => {
    render(<HomePage />)

    expect(screen.getByText('Главная')).toBeInTheDocument()
    expect(screen.getByText('Сообщения')).toBeInTheDocument()
    expect(screen.getByText('Сообщить')).toBeInTheDocument()
    expect(screen.getByText('Рейтинг')).toBeInTheDocument()
    expect(screen.getByText('Конфиденциальность')).toBeInTheDocument()
  })

  it('renders action buttons', () => {
    render(<HomePage />)

    expect(screen.getByText('Сообщить о мошеннике')).toBeInTheDocument()
    expect(screen.getByText('Все сообщения')).toBeInTheDocument()
    expect(screen.getByText('Рейтинг пользователей')).toBeInTheDocument()
  })

  it('has correct page structure', () => {
    render(<HomePage />)

    // Check main heading
    const heading = screen.getByRole('heading', { level: 1 })
    expect(heading).toHaveTextContent('AntiScamKZ')

    // Check search section heading
    expect(screen.getByText('Проверить номер')).toBeInTheDocument()

    // Check actions section heading
    expect(screen.getByText('Действия')).toBeInTheDocument()
  })
})



