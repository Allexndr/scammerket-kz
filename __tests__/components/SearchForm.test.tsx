/**
 * @jest-environment jsdom
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import SearchForm from '@/src/components/SearchForm'

// Mock fetch
const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>

describe('SearchForm', () => {
  beforeEach(() => {
    mockFetch.mockClear()
  })

  it('renders search input and button', () => {
    render(<SearchForm />)

    expect(screen.getByPlaceholderText(/введите номер телефона/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /найти/i })).toBeInTheDocument()
  })

  it('shows loading state during search', async () => {
    mockFetch.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))

    render(<SearchForm />)

    const input = screen.getByPlaceholderText(/введите номер телефона/i)
    const button = screen.getByRole('button', { name: /найти/i })

    fireEvent.change(input, { target: { value: '+77771234567' } })
    fireEvent.click(button)

    expect(screen.getByText('Поиск...')).toBeInTheDocument()

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/search?q=%2B77771234567')
    })
  })

  it('displays search results when found', async () => {
    const mockResults = [
      {
        _id: '1',
        phoneNumber: '777****567',
        gender: 'male',
        company: 'Test Bank',
        scamType: 'phishing',
        region: 'Алматы',
        description: 'Test scam description',
        likes: 10,
        dislikes: 2,
        verificationRate: 83,
        reportedBy: { name: 'Test User', rank: 'Охотник' },
        createdAt: '2024-01-01T00:00:00.000Z',
        commentCount: 3
      }
    ]

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ results: mockResults }),
    } as Response)

    render(<SearchForm />)

    const input = screen.getByPlaceholderText(/введите номер телефона/i)
    const button = screen.getByRole('button', { name: /найти/i })

    fireEvent.change(input, { target: { value: '+77771234567' } })
    fireEvent.click(button)

    await waitFor(() => {
      expect(screen.getByText('777****567')).toBeInTheDocument()
      expect(screen.getByText('Test Bank')).toBeInTheDocument()
      expect(screen.getByText('👍 10')).toBeInTheDocument()
      expect(screen.getByText('👎 2')).toBeInTheDocument()
    })
  })

  it('shows "nothing found" message when no results', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ results: [] }),
    } as Response)

    render(<SearchForm />)

    const input = screen.getByPlaceholderText(/введите номер телефона/i)
    const button = screen.getByRole('button', { name: /найти/i })

    fireEvent.change(input, { target: { value: '+77771234567' } })
    fireEvent.click(button)

    await waitFor(() => {
      expect(screen.getByText(/ничего не найдено/i)).toBeInTheDocument()
    })
  })

  it('handles API errors gracefully', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'))

    render(<SearchForm />)

    const input = screen.getByPlaceholderText(/введите номер телефона/i)
    const button = screen.getByRole('button', { name: /найти/i })

    fireEvent.change(input, { target: { value: '+77771234567' } })
    fireEvent.click(button)

    await waitFor(() => {
      expect(screen.getByText(/ничего не найдено/i)).toBeInTheDocument()
    })
  })

  it('displays scam type correctly', async () => {
    const mockResults = [
      {
        _id: '1',
        phoneNumber: '777****567',
        gender: 'male',
        company: 'Test Bank',
        scamType: 'phishing',
        region: 'Алматы',
        description: 'Test scam description',
        likes: 10,
        dislikes: 2,
        verificationRate: 83,
        reportedBy: { name: 'Test User', rank: 'Охотник' },
        createdAt: '2024-01-01T00:00:00.000Z',
        commentCount: 3
      }
    ]

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ results: mockResults }),
    } as Response)

    render(<SearchForm />)

    const input = screen.getByPlaceholderText(/введите номер телефона/i)
    const button = screen.getByRole('button', { name: /найти/i })

    fireEvent.change(input, { target: { value: '+77771234567' } })
    fireEvent.click(button)

    await waitFor(() => {
      expect(screen.getByText('Фишинг')).toBeInTheDocument()
    })
  })

  it('shows verification status correctly', async () => {
    const mockResults = [
      {
        _id: '1',
        phoneNumber: '777****567',
        gender: 'male',
        company: 'Test Bank',
        scamType: 'phishing',
        region: 'Алматы',
        description: 'Test scam description',
        likes: 10,
        dislikes: 2,
        isVerified: true,
        verificationRate: 83,
        reportedBy: { name: 'Test User', rank: 'Охотник' },
        createdAt: '2024-01-01T00:00:00.000Z',
        commentCount: 3
      }
    ]

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ results: mockResults }),
    } as Response)

    render(<SearchForm />)

    const input = screen.getByPlaceholderText(/введите номер телефона/i)
    const button = screen.getByRole('button', { name: /найти/i })

    fireEvent.change(input, { target: { value: '+77771234567' } })
    fireEvent.click(button)

    await waitFor(() => {
      expect(screen.getByText('Верифицировано')).toBeInTheDocument()
      expect(screen.getByText('83%')).toBeInTheDocument()
    })
  })

  it('displays reporter information', async () => {
    const mockResults = [
      {
        _id: '1',
        phoneNumber: '777****567',
        gender: 'male',
        company: 'Test Bank',
        scamType: 'phishing',
        region: 'Алматы',
        description: 'Test scam description',
        likes: 10,
        dislikes: 2,
        verificationRate: 83,
        reportedBy: { name: 'Test User', rank: 'Охотник' },
        createdAt: '2024-01-01T00:00:00.000Z',
        commentCount: 3
      }
    ]

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ results: mockResults }),
    } as Response)

    render(<SearchForm />)

    const input = screen.getByPlaceholderText(/введите номер телефона/i)
    const button = screen.getByRole('button', { name: /найти/i })

    fireEvent.change(input, { target: { value: '+77771234567' } })
    fireEvent.click(button)

    await waitFor(() => {
      expect(screen.getByText('Test User')).toBeInTheDocument()
      expect(screen.getByText('Охотник')).toBeInTheDocument()
    })
  })

  it('shows comment count when available', async () => {
    const mockResults = [
      {
        _id: '1',
        phoneNumber: '777****567',
        gender: 'male',
        company: 'Test Bank',
        scamType: 'phishing',
        region: 'Алматы',
        description: 'Test scam description',
        likes: 10,
        dislikes: 2,
        verificationRate: 83,
        reportedBy: { name: 'Test User', rank: 'Охотник' },
        createdAt: '2024-01-01T00:00:00.000Z',
        commentCount: 5
      }
    ]

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ results: mockResults }),
    } as Response)

    render(<SearchForm />)

    const input = screen.getByPlaceholderText(/введите номер телефона/i)
    const button = screen.getByRole('button', { name: /найти/i })

    fireEvent.change(input, { target: { value: '+77771234567' } })
    fireEvent.click(button)

    await waitFor(() => {
      expect(screen.getByText('5 комментариев')).toBeInTheDocument()
    })
  })

  it('handles empty search query', () => {
    render(<SearchForm />)

    const button = screen.getByRole('button', { name: /найти/i })
    fireEvent.click(button)

    expect(mockFetch).not.toHaveBeenCalled()
  })

  it('displays formatted date', async () => {
    const mockResults = [
      {
        _id: '1',
        phoneNumber: '777****567',
        gender: 'male',
        company: 'Test Bank',
        scamType: 'phishing',
        region: 'Алматы',
        description: 'Test scam description',
        likes: 10,
        dislikes: 2,
        verificationRate: 83,
        reportedBy: { name: 'Test User', rank: 'Охотник' },
        createdAt: '2024-01-01T00:00:00.000Z',
        commentCount: 3
      }
    ]

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ results: mockResults }),
    } as Response)

    render(<SearchForm />)

    const input = screen.getByPlaceholderText(/введите номер телефона/i)
    const button = screen.getByRole('button', { name: /найти/i })

    fireEvent.change(input, { target: { value: '+77771234567' } })
    fireEvent.click(button)

    await waitFor(() => {
      // Should show formatted date (actual format may vary)
      expect(screen.getByText(/\d{1,2}\.\d{1,2}\.\d{4}/)).toBeInTheDocument()
    })
  })

  it('masks phone numbers in results', async () => {
    const mockResults = [
      {
        _id: '1',
        phoneNumber: '77771234567', // Full number in data
        gender: 'male',
        company: 'Test Bank',
        scamType: 'phishing',
        region: 'Алматы',
        description: 'Test scam description',
        likes: 10,
        dislikes: 2,
        verificationRate: 83,
        reportedBy: { name: 'Test User', rank: 'Охотник' },
        createdAt: '2024-01-01T00:00:00.000Z',
        commentCount: 3
      }
    ]

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ results: mockResults }),
    } as Response)

    render(<SearchForm />)

    const input = screen.getByPlaceholderText(/введите номер телефона/i)
    const button = screen.getByRole('button', { name: /найти/i })

    fireEvent.change(input, { target: { value: '+77771234567' } })
    fireEvent.click(button)

    await waitFor(() => {
      // Should show masked number
      expect(screen.getByText('777****567')).toBeInTheDocument()
      expect(screen.queryByText('77771234567')).not.toBeInTheDocument()
    })
  })

  it('handles multiple search results', async () => {
    const mockResults = [
      {
        _id: '1',
        phoneNumber: '777****567',
        gender: 'male',
        company: 'Bank A',
        scamType: 'phishing',
        region: 'Алматы',
        description: 'First scam',
        likes: 10,
        dislikes: 2,
        verificationRate: 83,
        reportedBy: { name: 'User A', rank: 'Охотник' },
        createdAt: '2024-01-01T00:00:00.000Z',
        commentCount: 3
      },
      {
        _id: '2',
        phoneNumber: '777****890',
        gender: 'female',
        company: 'Bank B',
        scamType: 'crypto',
        region: 'Астана',
        description: 'Second scam',
        likes: 5,
        dislikes: 1,
        verificationRate: 83,
        reportedBy: { name: 'User B', rank: 'Новичок' },
        createdAt: '2024-01-02T00:00:00.000Z',
        commentCount: 1
      }
    ]

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ results: mockResults }),
    } as Response)

    render(<SearchForm />)

    const input = screen.getByPlaceholderText(/введите номер телефона/i)
    const button = screen.getByRole('button', { name: /найти/i })

    fireEvent.change(input, { target: { value: '+77771234567' } })
    fireEvent.click(button)

    await waitFor(() => {
      expect(screen.getByText('Bank A')).toBeInTheDocument()
      expect(screen.getByText('Bank B')).toBeInTheDocument()
      expect(screen.getByText('First scam')).toBeInTheDocument()
      expect(screen.getByText('Second scam')).toBeInTheDocument()
    })
  })
})