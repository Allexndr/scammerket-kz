/**
 * @jest-environment jsdom
 */

import { render, screen, waitFor } from '@testing-library/react'
import LeaderboardTable from '@/src/components/LeaderboardTable'

// Mock fetch
const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>

describe('LeaderboardTable', () => {
  beforeEach(() => {
    mockFetch.mockClear()
  })

  it('renders loading state initially', () => {
    render(<LeaderboardTable />)

    expect(screen.getByText('🏆 Рейтинг пользователей')).toBeInTheDocument()
  })

  it('renders empty state when no users', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ users: [] }),
    } as Response)

    render(<LeaderboardTable />)

    await waitFor(() => {
      expect(screen.getByText('🏆')).toBeInTheDocument()
      expect(screen.getByText('Пока нет участников')).toBeInTheDocument()
      expect(screen.getByText('Будьте первым! Сообщите о мошеннике и заработайте очки.')).toBeInTheDocument()
    })
  })

  it('renders users list when data loads successfully', async () => {
    const mockUsers = [
      {
        _id: 'user1',
        name: 'John Doe',
        points: 150,
        rank: 'Охотник',
        reportsCount: 5,
        votesCount: 20
      },
      {
        _id: 'user2',
        name: 'Jane Smith',
        points: 200,
        rank: 'Эксперт',
        reportsCount: 8,
        votesCount: 15
      }
    ]

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ users: mockUsers }),
    } as Response)

    render(<LeaderboardTable />)

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument()
      expect(screen.getByText('Jane Smith')).toBeInTheDocument()
      expect(screen.getByText('150')).toBeInTheDocument()
      expect(screen.getByText('200')).toBeInTheDocument()
    })
  })

  it('handles API errors gracefully', async () => {
    mockFetch.mockRejectedValueOnce(new Error('API Error'))

    render(<LeaderboardTable />)

    await waitFor(() => {
      expect(screen.getByText('Пока нет участников')).toBeInTheDocument()
    })
  })

  it('displays user ranks correctly', async () => {
    const mockUsers = [
      {
        _id: 'user1',
        name: 'John Doe',
        points: 150,
        rank: 'Охотник',
        reportsCount: 5,
        votesCount: 20
      }
    ]

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ users: mockUsers }),
    } as Response)

    render(<LeaderboardTable />)

    await waitFor(() => {
      expect(screen.getByText('Охотник')).toBeInTheDocument()
    })
  })

  it('shows gamification information in empty state', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ users: [] }),
    } as Response)

    render(<LeaderboardTable />)

    await waitFor(() => {
      expect(screen.getByText('Как заработать очки?')).toBeInTheDocument()
      expect(screen.getByText('+10 очков за внесение отчета о мошеннике')).toBeInTheDocument()
      expect(screen.getByText('+5 очков за голосование за/против отчета')).toBeInTheDocument()
    })
  })

  it('displays user statistics correctly', async () => {
    const mockUsers = [
      {
        _id: 'user1',
        name: 'John Doe',
        points: 150,
        rank: 'Охотник',
        reportsCount: 5,
        votesCount: 20
      }
    ]

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ users: mockUsers }),
    } as Response)

    render(<LeaderboardTable />)

    await waitFor(() => {
      expect(screen.getByText('⭐ 150 очков')).toBeInTheDocument()
      expect(screen.getByText('📝 5 отчетов')).toBeInTheDocument()
      expect(screen.getByText('🗳️ 20 голосов')).toBeInTheDocument()
    })
  })

  it('includes call-to-action button in empty state', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ users: [] }),
    } as Response)

    render(<LeaderboardTable />)

    await waitFor(() => {
      expect(screen.getByText('Стать первым участником')).toBeInTheDocument()
    })
  })

  it('renders proper table structure for users', async () => {
    const mockUsers = [
      {
        _id: 'user1',
        name: 'John Doe',
        points: 150,
        rank: 'Охотник',
        reportsCount: 5,
        votesCount: 20
      }
    ]

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ users: mockUsers }),
    } as Response)

    render(<LeaderboardTable />)

    await waitFor(() => {
      // Check for proper card structure
      const userCard = screen.getByText('John Doe').closest('div')
      expect(userCard).toHaveClass('bg-white', 'rounded-xl', 'shadow-md')
    })
  })

  it('displays gamification info box styling', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ users: [] }),
    } as Response)

    render(<LeaderboardTable />)

    await waitFor(() => {
      const infoBox = screen.getByText('Как заработать очки?').closest('div')
      expect(infoBox).toHaveClass('bg-blue-50', 'border', 'border-blue-200', 'rounded-lg')
    })
  })

  it('shows proper empty state message', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ users: [] }),
    } as Response)

    render(<LeaderboardTable />)

    await waitFor(() => {
      expect(screen.getByText('Будьте первым! Сообщите о мошеннике и заработайте очки.')).toBeInTheDocument()
    })
  })

  it('handles API response with missing fields', async () => {
    const mockUsers = [
      {
        _id: 'user1',
        name: 'John Doe',
        points: 150,
        rank: 'Охотник'
        // Missing reportsCount and votesCount
      }
    ]

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ users: mockUsers }),
    } as Response)

    render(<LeaderboardTable />)

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument()
      // Should still render without crashing
    })
  })

  it('limits user display appropriately', async () => {
    const mockUsers = Array(60).fill({
      _id: 'user1',
      name: 'User',
      points: 100,
      rank: 'Новичок',
      reportsCount: 1,
      votesCount: 5
    })

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ users: mockUsers }),
    } as Response)

    render(<LeaderboardTable />)

    await waitFor(() => {
      // Should handle large arrays without performance issues
      expect(screen.getByText('User')).toBeInTheDocument()
    })
  })
})


