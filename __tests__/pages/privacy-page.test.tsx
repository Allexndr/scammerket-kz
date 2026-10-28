import { render, screen } from '@testing-library/react'
import PrivacyPage from '@/app/privacy/page'

describe('PrivacyPage', () => {
  it('renders the page heading', () => {
    render(<PrivacyPage />)

    expect(screen.getByText('Политика конфиденциальности')).toBeInTheDocument()
  })

  it('renders all main sections', () => {
    render(<PrivacyPage />)

    expect(screen.getByText('1. Общие положения')).toBeInTheDocument()
    expect(screen.getByText('2. Сбор информации')).toBeInTheDocument()
    expect(screen.getByText('3. Использование информации')).toBeInTheDocument()
    expect(screen.getByText('4. Раскрытие информации')).toBeInTheDocument()
    expect(screen.getByText('5. Защита данных')).toBeInTheDocument()
    expect(screen.getByText('6. Ваши права')).toBeInTheDocument()
    expect(screen.getByText('7. Cookies и аналитика')).toBeInTheDocument()
    expect(screen.getByText('8. Ответственность')).toBeInTheDocument()
    expect(screen.getByText('9. Изменения политики')).toBeInTheDocument()
    expect(screen.getByText('10. Контакты')).toBeInTheDocument()
  })

  it('renders disclaimer content', () => {
    render(<PrivacyPage />)

    expect(screen.getByText(/мы не собираем персональные данные/i)).toBeInTheDocument()
    expect(screen.getByText(/мы не передаем/i)).toBeInTheDocument()
    expect(screen.getByText(/мы не несем ответственности/i)).toBeInTheDocument()
  })

  it('renders contact information', () => {
    render(<PrivacyPage />)

    expect(screen.getByText('По вопросам конфиденциальности обращайтесь:')).toBeInTheDocument()
    expect(screen.getByText('privacy@antiscamkz.kz')).toBeInTheDocument()
  })

  it('has proper container styling', () => {
    render(<PrivacyPage />)

    const container = screen.getByText('Политика конфиденциальности').closest('.container')
    expect(container).toBeInTheDocument()
  })

  it('has proper max width container', () => {
    render(<PrivacyPage />)

    const maxWidthContainer = screen.getByText('Политика конфиденциальности').closest('.max-w-4xl')
    expect(maxWidthContainer).toBeInTheDocument()
  })

  it('has proper card styling', () => {
    render(<PrivacyPage />)

    const card = screen.getByText('Политика конфиденциальности').closest('.bg-white')
    expect(card).toHaveClass('rounded-lg', 'shadow-md', 'p-8')
  })

  it('renders section headings with proper styling', () => {
    render(<PrivacyPage />)

    const sectionHeadings = [
      screen.getByText('1. Общие положения'),
      screen.getByText('2. Сбор информации'),
      screen.getByText('3. Использование информации')
    ]

    sectionHeadings.forEach(heading => {
      expect(heading).toHaveClass('text-2xl', 'font-semibold', 'text-gray-900', 'mb-4')
    })
  })

  it('renders current date in the last updated section', () => {
    render(<PrivacyPage />)

    // Check that there's a date string (we can't predict exact date)
    const lastUpdatedElement = screen.getByText(/Последнее обновление:/i)
    expect(lastUpdatedElement).toBeInTheDocument()
  })
})



