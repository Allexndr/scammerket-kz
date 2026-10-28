/**
 * @jest-environment jsdom
 */

import { render, screen, waitFor } from '@testing-library/react'
import HomePage from '@/app/page'

// Mock all components to avoid complex dependencies
jest.mock('@/components/SearchForm', () => ({
  __esModule: true,
  default: () => <div data-testid="search-form">Search Form</div>
}))

jest.mock('@/components/TopCompanies', () => ({
  __esModule: true,
  default: () => <div data-testid="top-companies">Top Companies</div>
}))

jest.mock('@/components/StatsOverview', () => ({
  __esModule: true,
  default: () => <div data-testid="stats-overview">Stats Overview</div>
}))

jest.mock('@/components/Disclaimer', () => ({
  __esModule: true,
  default: () => <div data-testid="disclaimer">Disclaimer</div>
}))

describe('HomePage Integration', () => {
  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks()
  })

  it('renders complete page layout', () => {
    render(<HomePage />)

    // Check main page structure
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
    expect(screen.getByText('Платформа против мошенничества в Казахстане')).toBeInTheDocument()
  })

  it('displays branding elements', () => {
    render(<HomePage />)

    // Check ScammerKetKz branding
    const heading = screen.getByRole('heading', { level: 1 })
    expect(heading).toHaveTextContent('ScammerKetKz')

    // Check branding badge
    expect(screen.getByText(/Защищаем вместе/i)).toBeInTheDocument()
  })

  it('includes all main sections', () => {
    render(<HomePage />)

    // Search section
    expect(screen.getByText('🔍 Проверить номер телефона')).toBeInTheDocument()

    // Stats section
    expect(screen.getByText('📊 Статистика платформы')).toBeInTheDocument()

    // Companies section (text should be there)
    expect(screen.getByTestId('top-companies')).toBeInTheDocument()

    // Actions section
    expect(screen.getByText('🚀 Быстрые действия')).toBeInTheDocument()
  })

  it('has proper responsive design classes', () => {
    render(<HomePage />)

    const mainHeading = screen.getByRole('heading', { level: 1 })
    expect(mainHeading).toHaveClass('text-3xl', 'sm:text-4xl', 'lg:text-5xl')

    const subtitle = screen.getByText('Платформа против мошенничества в Казахстане')
    expect(subtitle).toHaveClass('text-lg', 'sm:text-xl')
  })

  it('includes call-to-action buttons', () => {
    render(<HomePage />)

    expect(screen.getByText('📝 Сообщить о мошеннике')).toBeInTheDocument()
    expect(screen.getByText('📋 Все сообщения')).toBeInTheDocument()
    expect(screen.getByText('🏆 Рейтинг пользователей')).toBeInTheDocument()
  })

  it('has proper semantic structure', () => {
    render(<HomePage />)

    // Should have proper heading hierarchy
    const h1 = screen.getByRole('heading', { level: 1 })
    expect(h1).toBeInTheDocument()

    // Should have main content sections
    expect(screen.getByText('🔍 Проверить номер телефона')).toBeInTheDocument()
    expect(screen.getByText('📊 Статистика платформы')).toBeInTheDocument()
  })

  it('maintains accessibility standards', () => {
    render(<HomePage />)

    // Main heading should exist
    const mainHeading = screen.getByRole('heading', { level: 1 })
    expect(mainHeading).toBeVisible()

    // Should not have any accessibility violations (basic check)
    const allHeadings = screen.getAllByRole('heading')
    expect(allHeadings.length).toBeGreaterThan(0)
  })

  it('has consistent styling patterns', () => {
    render(<HomePage />)

    // Check that main sections have consistent styling
    const searchSection = screen.getByText('🔍 Проверить номер телефона').closest('div')
    expect(searchSection).toHaveClass('bg-white', 'rounded-xl', 'shadow-lg')

    const statsSection = screen.getByText('📊 Статистика платформы').closest('div')
    expect(statsSection).toHaveClass('mb-8')

    const actionsSection = screen.getByText('🚀 Быстрые действия').closest('div')
    expect(actionsSection).toHaveClass('bg-white', 'rounded-xl', 'shadow-lg')
  })
})


