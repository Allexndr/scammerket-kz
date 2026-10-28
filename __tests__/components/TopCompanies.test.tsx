/**
 * @jest-environment jsdom
 */

import { render, screen, waitFor } from '@testing-library/react'
import TopCompanies from '@/src/components/TopCompanies'

// Mock fetch
const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>

describe('TopCompanies', () => {
  beforeEach(() => {
    mockFetch.mockClear()
  })

  it('renders loading state initially', () => {
    render(<TopCompanies />)

    expect(screen.getByText('🏆 Топ компаний-мошенников')).toBeInTheDocument()
    expect(screen.getByText('Загрузка...')).toBeInTheDocument()
  })

  it('renders companies list when data loads successfully', async () => {
    const mockCompanies = [
      {
        company: 'TestBank',
        totalReports: 50,
        verifiedReports: 40,
        verificationRate: 80,
        avgLikes: 2.5,
        avgDislikes: 0.5
      },
      {
        company: 'FakeShop',
        totalReports: 30,
        verifiedReports: 20,
        verificationRate: 67,
        avgLikes: 1.8,
        avgDislikes: 0.8
      }
    ]

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ topCompanies: mockCompanies }),
    } as Response)

    render(<TopCompanies />)

    await waitFor(() => {
      expect(screen.getByText('TestBank')).toBeInTheDocument()
      expect(screen.getByText('FakeShop')).toBeInTheDocument()
    })

    expect(screen.getByText('50 сообщений')).toBeInTheDocument()
    expect(screen.getByText('30 сообщений')).toBeInTheDocument()
  })

  it('renders empty state when no companies', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ topCompanies: [] }),
    } as Response)

    render(<TopCompanies />)

    await waitFor(() => {
      expect(screen.getByText('📊')).toBeInTheDocument()
      expect(screen.getByText('Пока нет данных')).toBeInTheDocument()
      expect(screen.getByText('Будьте первым, кто сообщит о мошеннической компании!')).toBeInTheDocument()
    })
  })

  it('handles API errors gracefully', async () => {
    mockFetch.mockRejectedValueOnce(new Error('API Error'))

    render(<TopCompanies />)

    await waitFor(() => {
      expect(screen.getByText('📊')).toBeInTheDocument()
      expect(screen.getByText('Пока нет данных')).toBeInTheDocument()
    })
  })

  it('displays verification rates correctly', async () => {
    const mockCompanies = [
      {
        company: 'TestBank',
        totalReports: 50,
        verifiedReports: 40,
        verificationRate: 80,
        avgLikes: 2.5,
        avgDislikes: 0.5
      }
    ]

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ topCompanies: mockCompanies }),
    } as Response)

    render(<TopCompanies />)

    await waitFor(() => {
      expect(screen.getByText('80%')).toBeInTheDocument()
    })
  })

  it('renders company cards with proper styling', async () => {
    const mockCompanies = [
      {
        company: 'TestBank',
        totalReports: 50,
        verifiedReports: 40,
        verificationRate: 80,
        avgLikes: 2.5,
        avgDislikes: 0.5
      }
    ]

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ topCompanies: mockCompanies }),
    } as Response)

    render(<TopCompanies />)

    await waitFor(() => {
      const companyCard = screen.getByText('TestBank').closest('div')
      expect(companyCard).toHaveClass('bg-gradient-to-r', 'from-gray-50', 'to-gray-100')
    })
  })

  it('shows ranking numbers for companies', async () => {
    const mockCompanies = [
      {
        company: 'FirstBank',
        totalReports: 50,
        verifiedReports: 40,
        verificationRate: 80,
        avgLikes: 2.5,
        avgDislikes: 0.5
      },
      {
        company: 'SecondBank',
        totalReports: 30,
        verifiedReports: 20,
        verificationRate: 67,
        avgLikes: 1.8,
        avgDislikes: 0.8
      }
    ]

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ topCompanies: mockCompanies }),
    } as Response)

    render(<TopCompanies />)

    await waitFor(() => {
      expect(screen.getByText('1')).toBeInTheDocument()
      expect(screen.getByText('2')).toBeInTheDocument()
    })
  })

  it('displays average likes and dislikes', async () => {
    const mockCompanies = [
      {
        company: 'TestBank',
        totalReports: 50,
        verifiedReports: 40,
        verificationRate: 80,
        avgLikes: 2.5,
        avgDislikes: 0.5
      }
    ]

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ topCompanies: mockCompanies }),
    } as Response)

    render(<TopCompanies />)

    await waitFor(() => {
      expect(screen.getByText('👍 2.5')).toBeInTheDocument()
      expect(screen.getByText('👎 0.5')).toBeInTheDocument()
    })
  })

  it('has proper responsive design classes', async () => {
    const mockCompanies = [
      {
        company: 'TestBank',
        totalReports: 50,
        verifiedReports: 40,
        verificationRate: 80,
        avgLikes: 2.5,
        avgDislikes: 0.5
      }
    ]

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ topCompanies: mockCompanies }),
    } as Response)

    render(<TopCompanies />)

    await waitFor(() => {
      const container = screen.getByText('TestBank').closest('.rounded-xl')
      expect(container).toHaveClass('bg-white', 'rounded-xl', 'shadow-lg', 'border', 'border-gray-100')
    })
  })

  it('includes call-to-action for empty state', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ topCompanies: [] }),
    } as Response)

    render(<TopCompanies />)

    await waitFor(() => {
      expect(screen.getByText('Сообщить о первой компании')).toBeInTheDocument()
    })
  })

  it('limits display to top 10 companies', async () => {
    const mockCompanies = Array(15).fill({
      company: 'TestBank',
      totalReports: 50,
      verifiedReports: 40,
      verificationRate: 80,
      avgLikes: 2.5,
      avgDislikes: 0.5
    })

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ topCompanies: mockCompanies }),
    } as Response)

    render(<TopCompanies />)

    await waitFor(() => {
      // Should show ranking numbers 1-10
      expect(screen.getByText('10')).toBeInTheDocument()
      expect(screen.queryByText('15')).not.toBeInTheDocument()
    })
  })
})


