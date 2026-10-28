import { render, screen } from '@testing-library/react'
import LeaderboardPage from '@/app/leaderboard/page'

// Mock components
jest.mock('@/components/LeaderboardTable', () => ({
  __esModule: true,
  default: () => <div data-testid="leaderboard-table">Leaderboard Table Component</div>
}))

describe('LeaderboardPage', () => {
  it('renders the page heading', () => {
    render(<LeaderboardPage />)

    expect(screen.getByText('🏆 Рейтинг пользователей')).toBeInTheDocument()
  })

  it('renders the subtitle', () => {
    render(<LeaderboardPage />)

    expect(screen.getByText('Топ активных участников борьбы с мошенничеством')).toBeInTheDocument()
  })

  it('renders the info section about earning points', () => {
    render(<LeaderboardPage />)

    expect(screen.getByText('Как заработать очки?')).toBeInTheDocument()
    expect(screen.getByText('+10 очков за внесение отчета о мошеннике')).toBeInTheDocument()
    expect(screen.getByText('+5 очков за голосование за/против отчета')).toBeInTheDocument()
  })

  it('renders the leaderboard table component', () => {
    render(<LeaderboardPage />)

    expect(screen.getByTestId('leaderboard-table')).toBeInTheDocument()
  })

  it('has proper container styling', () => {
    render(<LeaderboardPage />)

    const container = screen.getByText('🏆 Рейтинг пользователей').closest('.container')
    expect(container).toBeInTheDocument()
  })

  it('has proper responsive heading sizes', () => {
    render(<LeaderboardPage />)

    const heading = screen.getByRole('heading', { level: 1 })
    expect(heading).toHaveClass('text-3xl', 'font-bold', 'text-gray-900')
  })

  it('has proper info box styling', () => {
    render(<LeaderboardPage />)

    const infoBox = screen.getByText('Как заработать очки?').closest('div')
    expect(infoBox).toHaveClass('bg-blue-50', 'border', 'border-blue-200', 'rounded-lg', 'p-4')
  })
})



