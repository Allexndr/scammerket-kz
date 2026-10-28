/**
 * @jest-environment jsdom
 */

import { render, screen, waitFor } from '@testing-library/react'
import StatsOverview from '@/src/components/StatsOverview'

// Mock fetch
const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>

describe('StatsOverview', () => {
  beforeEach(() => {
    mockFetch.mockClear()
  })

  it('renders loading state initially', () => {
    render(<StatsOverview />)

    // Should show loading skeletons
    expect(screen.getAllByRole('generic', { hidden: true })).toHaveLength(4)
  })

  it('renders stats cards when data loads successfully', async () => {
    const mockStats = {
      totalScams: 150,
      totalVerified: 120,
      verificationRate: 80,
      totalVotes: 300
    }

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ totalStats: mockStats }),
    } as Response)

    render(<StatsOverview />)

    await waitFor(() => {
      expect(screen.getByText('Всего сообщений')).toBeInTheDocument()
      expect(screen.getByText('Верифицировано')).toBeInTheDocument()
      expect(screen.getByText('Всего голосов')).toBeInTheDocument()
      expect(screen.getByText('Активных пользователей')).toBeInTheDocument()
    })

    // Check that values are displayed
    expect(screen.getByText('150')).toBeInTheDocument()
    expect(screen.getByText('80%')).toBeInTheDocument()
    expect(screen.getByText('300')).toBeInTheDocument()
  })

  it('renders empty stats when no data available', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ totalStats: null }),
    } as Response)

    render(<StatsOverview />)

    await waitFor(() => {
      expect(screen.getByText('0')).toBeInTheDocument()
    })
  })

  it('handles API errors gracefully', async () => {
    mockFetch.mockRejectedValueOnce(new Error('API Error'))

    render(<StatsOverview />)

    await waitFor(() => {
      expect(screen.getByText('0')).toBeInTheDocument()
    })
  })

  it('has proper responsive grid layout', async () => {
    const mockStats = {
      totalScams: 100,
      totalVerified: 80,
      verificationRate: 80,
      totalVotes: 200
    }

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ totalStats: mockStats }),
    } as Response)

    render(<StatsOverview />)

    await waitFor(() => {
      const grid = screen.getByText('Всего сообщений').closest('div')
      expect(grid).toHaveClass('grid', 'grid-cols-1', 'sm:grid-cols-2', 'lg:grid-cols-4')
    })
  })

  it('displays correct stat values', async () => {
    const mockStats = {
      totalScams: 250,
      totalVerified: 200,
      verificationRate: 80,
      totalVotes: 500
    }

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ totalStats: mockStats }),
    } as Response)

    render(<StatsOverview />)

    await waitFor(() => {
      expect(screen.getByText('250')).toBeInTheDocument()
      expect(screen.getByText('80%')).toBeInTheDocument()
      expect(screen.getByText('500')).toBeInTheDocument()
    })
  })

  it('renders stat cards with proper styling', async () => {
    const mockStats = {
      totalScams: 100,
      totalVerified: 80,
      verificationRate: 80,
      totalVotes: 200
    }

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ totalStats: mockStats }),
    } as Response)

    render(<StatsOverview />)

    await waitFor(() => {
      const cards = screen.getAllByText(/\d+/)
      cards.forEach(card => {
        const cardElement = card.closest('div')
        expect(cardElement).toHaveClass('bg-white', 'rounded-xl', 'shadow-md')
      })
    })
  })

  it('calculates active users estimate correctly', async () => {
    const mockStats = {
      totalScams: 100,
      totalVerified: 80,
      verificationRate: 80,
      totalVotes: 200
    }

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ totalStats: mockStats }),
    } as Response)

    render(<StatsOverview />)

    await waitFor(() => {
      // Should show ~33 (100 / 3 rounded)
      expect(screen.getByText('~33')).toBeInTheDocument()
    })
  })
})


