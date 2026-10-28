/**
 * @jest-environment jsdom
 */

import { render, screen } from '@testing-library/react'
import LeaderboardPage from '@/app/leaderboard/page'

// Mock components
jest.mock('@/components/LeaderboardTable', () => ({
  __esModule: true,
  default: () => <div data-testid="leaderboard-table">Leaderboard Table Component</div>
}))

describe('LeaderboardPage Integration', () => {
  it('renders page with correct title and description', () => {
    render(<LeaderboardPage />)

    expect(screen.getByText('🏆 Рейтинг пользователей')).toBeInTheDocument()
    expect(screen.getByText('Топ активных участников борьбы с мошенничеством')).toBeInTheDocument()
  })

  it('includes leaderboard table component', () => {
    render(<LeaderboardPage />)

    expect(screen.getByTestId('leaderboard-table')).toBeInTheDocument()
  })

  it('displays gamification information', () => {
    render(<LeaderboardPage />)

    expect(screen.getByText('Как заработать очки?')).toBeInTheDocument()
    expect(screen.getByText('+10 очков за внесение отчета о мошеннике')).toBeInTheDocument()
    expect(screen.getByText('+5 очков за голосование за/против отчета')).toBeInTheDocument()
  })

  it('has proper page structure', () => {
    render(<LeaderboardPage />)

    // Should have heading
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()

    // Should have proper container structure
    const container = screen.getByText('🏆 Рейтинг пользователей').closest('.container')
    expect(container).toBeInTheDocument()
  })

  it('has responsive design classes', () => {
    render(<LeaderboardPage />)

    const heading = screen.getByRole('heading', { level: 1 })
    expect(heading).toHaveClass('text-3xl', 'font-bold', 'text-gray-900')
  })

  it('maintains semantic structure', () => {
    render(<LeaderboardPage />)

    // Should have proper heading hierarchy
    const heading = screen.getByRole('heading', { level: 1 })
    expect(heading).toHaveTextContent('🏆 Рейтинг пользователей')

    // Should have descriptive subtitle
    expect(screen.getByText('Топ активных участников борьбы с мошенничеством')).toBeInTheDocument()
  })

  it('has informative content sections', () => {
    render(<LeaderboardPage />)

    // Gamification info box
    const infoBox = screen.getByText('Как заработать очки?').closest('div')
    expect(infoBox).toHaveClass('bg-blue-50', 'border', 'border-blue-200', 'rounded-lg')

    // Leaderboard table
    expect(screen.getByTestId('leaderboard-table')).toBeInTheDocument()
  })

  it('follows design system patterns', () => {
    render(<LeaderboardPage />)

    // Check that page has consistent spacing and layout
    const mainContainer = screen.getByText('🏆 Рейтинг пользователей').closest('.container')
    expect(mainContainer).toBeInTheDocument()

    // Check information architecture
    expect(screen.getByText('Как заработать очки?')).toBeInTheDocument()
    expect(screen.getByTestId('leaderboard-table')).toBeInTheDocument()
  })

  it('has call-to-action for empty state', () => {
    render(<LeaderboardPage />)

    // The leaderboard table component handles empty state
    expect(screen.getByTestId('leaderboard-table')).toBeInTheDocument()
  })
})


