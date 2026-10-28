import { render, screen } from '@testing-library/react'
import AdBanner from '@/components/AdBanner'

// Mock window.adsbygoogle
const mockPush = jest.fn()
Object.defineProperty(window, 'adsbygoogle', {
  writable: true,
  value: { push: mockPush },
})

describe('AdBanner', () => {
  beforeEach(() => {
    mockPush.mockClear()
    // Set NODE_ENV to development for testing
    process.env.NODE_ENV = 'development'
  })

  afterEach(() => {
    process.env.NODE_ENV = 'test'
  })

  it('renders placeholder in development mode', () => {
    render(<AdBanner position="top" size="728x90" />)

    expect(screen.getByText('Реклама 728x90')).toBeInTheDocument()
    expect(screen.getByText('top')).toBeInTheDocument()
  })

  it('renders different sizes correctly', () => {
    const { rerender } = render(<AdBanner position="top" size="320x50" />)
    expect(screen.getByText('Реклама 320x50')).toBeInTheDocument()

    rerender(<AdBanner position="content" size="300x250" />)
    expect(screen.getByText('Реклама 300x250')).toBeInTheDocument()
  })

  it('has correct styling for ad container', () => {
    render(<AdBanner position="top" size="728x90" />)

    const container = screen.getByText('Реклама 728x90').closest('.ad-container')
    expect(container).toHaveClass('flex', 'justify-center', 'items-center')
    expect(container).toHaveClass('bg-gray-50', 'border', 'border-gray-200')
  })

  it('initializes AdSense in production mode', () => {
    process.env.NODE_ENV = 'production'

    render(<AdBanner position="top" size="728x90" />)

    // AdSense should be initialized
    expect(mockPush).toHaveBeenCalled()

    process.env.NODE_ENV = 'test'
  })
})



