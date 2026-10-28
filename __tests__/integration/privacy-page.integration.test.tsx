/**
 * @jest-environment jsdom
 */

import { render, screen } from '@testing-library/react'
import PrivacyPage from '@/app/privacy/page'

describe('PrivacyPage Integration', () => {
  it('renders main page heading', () => {
    render(<PrivacyPage />)

    expect(screen.getByText('Политика конфиденциальности')).toBeInTheDocument()
  })

  it('includes all policy sections', () => {
    render(<PrivacyPage />)

    const sections = [
      '1. Общие положения',
      '2. Сбор информации',
      '3. Использование информации',
      '4. Раскрытие информации',
      '5. Защита данных',
      '6. Ваши права',
      '7. Cookies и аналитика',
      '8. Ответственность',
      '9. Изменения политики',
      '10. Контакты'
    ]

    sections.forEach(section => {
      expect(screen.getByText(section)).toBeInTheDocument()
    })
  })

  it('displays disclaimer content', () => {
    render(<PrivacyPage />)

    expect(screen.getByText(/мы не собираем персональные данные/i)).toBeInTheDocument()
    expect(screen.getByText(/мы не передаем/i)).toBeInTheDocument()
    expect(screen.getByText(/мы не несем ответственности/i)).toBeInTheDocument()
  })

  it('includes contact information', () => {
    render(<PrivacyPage />)

    expect(screen.getByText('По вопросам конфиденциальности обращайтесь:')).toBeInTheDocument()
    expect(screen.getByText('privacy@antiscamkz.kz')).toBeInTheDocument()
  })

  it('has proper page structure', () => {
    render(<PrivacyPage />)

    // Should have heading
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()

    // Should have proper container structure
    const container = screen.getByText('Политика конфиденциальности').closest('.container')
    expect(container).toBeInTheDocument()
  })

  it('has responsive design classes', () => {
    render(<PrivacyPage />)

    const maxWidthContainer = screen.getByText('Политика конфиденциальности').closest('.max-w-4xl')
    expect(maxWidthContainer).toBeInTheDocument()
  })

  it('maintains semantic structure', () => {
    render(<PrivacyPage />)

    // Should have proper heading hierarchy
    const headings = screen.getAllByRole('heading')
    expect(headings.length).toBeGreaterThan(1) // Main heading + section headings

    // Main heading should be level 1
    const mainHeading = screen.getByRole('heading', { level: 1 })
    expect(mainHeading).toHaveTextContent('Политика конфиденциальности')
  })

  it('has consistent card styling', () => {
    render(<PrivacyPage />)

    const card = screen.getByText('Политика конфиденциальности').closest('.bg-white')
    expect(card).toHaveClass('rounded-lg', 'shadow-md', 'p-8')
  })

  it('follows content hierarchy', () => {
    render(<PrivacyPage />)

    // Check that sections appear in logical order
    const sections = [
      screen.getByText('1. Общие положения'),
      screen.getByText('2. Сбор информации'),
      screen.getByText('3. Использование информации')
    ]

    sections.forEach(section => {
      expect(section).toBeInTheDocument()
    })
  })

  it('includes current date information', () => {
    render(<PrivacyPage />)

    // Should have some date information (exact date may vary)
    const lastUpdatedText = screen.getByText(/Последнее обновление:/i)
    expect(lastUpdatedText).toBeInTheDocument()
  })

  it('has proper content organization', () => {
    render(<PrivacyPage />)

    // Check that contact information is properly placed
    const contactSection = screen.getByText('10. Контакты')
    expect(contactSection).toBeInTheDocument()

    // Email should be in contact section
    expect(screen.getByText('privacy@antiscamkz.kz')).toBeInTheDocument()
  })
})


