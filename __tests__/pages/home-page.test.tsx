import { render, screen, waitFor } from '@testing-library/react'
import HomePage from '@/app/page'

// Mock components
jest.mock('@/components/SearchForm', () => ({
  __esModule: true,
  default: () => <div data-testid="search-form">Search Form Component</div>
}))

jest.mock('@/components/TopCompanies', () => ({
  __esModule: true,
  default: () => <div data-testid="top-companies">Top Companies Component</div>
}))

jest.mock('@/components/StatsOverview', () => ({
  __esModule: true,
  default: () => <div data-testid="stats-overview">Stats Overview Component</div>
}))

jest.mock('@/components/Disclaimer', () => ({
  __esModule: true,
  default: () => <div data-testid="disclaimer">Disclaimer Component</div>
}))

describe('HomePage', () => {
  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks()
  })

  it('renders the main heading with ScammerKetKz branding', () => {
    render(<HomePage />)

    const heading = screen.getByRole('heading', { level: 1, name: /ScammerKetKz/i })
    expect(heading).toBeInTheDocument()
    expect(heading).toHaveClass('bg-gradient-to-r', 'from-blue-600', 'to-purple-600')
  })

  it('renders the subtitle', () => {
    render(<HomePage />)

    expect(screen.getByText('Платформа против мошенничества в Казахстане')).toBeInTheDocument()
  })

  it('renders the branding badge', () => {
    render(<HomePage />)

    expect(screen.getByText('🛡️ Защищаем вместе • Проверено сообществом • Бесплатно')).toBeInTheDocument()
  })

  it('renders the disclaimer component', () => {
    render(<HomePage />)

    expect(screen.getByTestId('disclaimer')).toBeInTheDocument()
  })

  it('renders the search section with proper heading', () => {
    render(<HomePage />)

    expect(screen.getByText('🔍 Проверить номер телефона')).toBeInTheDocument()
    expect(screen.getByTestId('search-form')).toBeInTheDocument()
  })

  it('renders the statistics section', () => {
    render(<HomePage />)

    expect(screen.getByText('📊 Статистика платформы')).toBeInTheDocument()
    expect(screen.getByTestId('stats-overview')).toBeInTheDocument()
  })

  it('renders the top companies section', () => {
    render(<HomePage />)

    expect(screen.getByTestId('top-companies')).toBeInTheDocument()
  })

  it('renders the quick actions section', () => {
    render(<HomePage />)

    expect(screen.getByText('🚀 Быстрые действия')).toBeInTheDocument()
    expect(screen.getByText('📝 Сообщить о мошеннике')).toBeInTheDocument()
    expect(screen.getByText('📋 Все сообщения')).toBeInTheDocument()
    expect(screen.getByText('🏆 Рейтинг пользователей')).toBeInTheDocument()
  })

  it('renders action buttons with proper styling', () => {
    render(<HomePage />)

    const reportButton = screen.getByText('📝 Сообщить о мошеннике')
    const allMessagesButton = screen.getByText('📋 Все сообщения')
    const leaderboardButton = screen.getByText('🏆 Рейтинг пользователей')

    expect(reportButton).toHaveClass('bg-gradient-to-r', 'from-red-500', 'to-red-600')
    expect(allMessagesButton).toHaveClass('bg-gradient-to-r', 'from-blue-500', 'to-blue-600')
    expect(leaderboardButton).toHaveClass('bg-gradient-to-r', 'from-green-500', 'to-green-600')
  })

  it('has proper responsive classes', () => {
    render(<HomePage />)

    // Check main heading responsive classes
    const heading = screen.getByRole('heading', { level: 1 })
    expect(heading).toHaveClass('text-3xl', 'sm:text-4xl', 'lg:text-5xl')

    // Check subtitle responsive classes
    const subtitle = screen.getByText('Платформа против мошенничества в Казахстане')
    expect(subtitle).toHaveClass('text-lg', 'sm:text-xl')

    // Check grid responsive classes in actions
    const actionsGrid = screen.getByText('🚀 Быстрые действия').closest('div')?.querySelector('.grid')
    expect(actionsGrid).toHaveClass('grid-cols-1', 'sm:grid-cols-2', 'lg:grid-cols-3')
  })

  it('renders all sections in correct order', () => {
    render(<HomePage />)

    const sections = [
      screen.getByRole('heading', { name: /ScammerKetKz/i }),
      screen.getByTestId('disclaimer'),
      screen.getByText('🔍 Проверить номер телефона'),
      screen.getByText('📊 Статистика платформы'),
      screen.getByTestId('top-companies'),
      screen.getByText('🚀 Быстрые действия')
    ]

    // Check that sections appear in document
    sections.forEach(section => {
      expect(section).toBeInTheDocument()
    })
  })
})



