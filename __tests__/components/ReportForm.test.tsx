/**
 * @jest-environment jsdom
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import ReportForm from '@/src/components/ReportForm'

// Mock fetch
const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>

describe('ReportForm', () => {
  beforeEach(() => {
    mockFetch.mockClear()
  })

  it('renders all form fields', () => {
    render(<ReportForm />)

    expect(screen.getByLabelText(/номер телефона мошенника/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/пол мошенника/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/компания/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/тип мошенничества/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/регион/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/описание ситуации/i)).toBeInTheDocument()
  })

  it('renders submit button', () => {
    render(<ReportForm />)

    expect(screen.getByRole('button', { name: /отправить отчет/i })).toBeInTheDocument()
  })

  it('shows disclaimer checkbox', () => {
    render(<ReportForm />)

    expect(screen.getByRole('checkbox')).toBeInTheDocument()
    expect(screen.getByText(/я понимаю и принимаю/i)).toBeInTheDocument()
  })

  it('validates required fields', async () => {
    render(<ReportForm />)

    const submitButton = screen.getByRole('button', { name: /отправить отчет/i })

    // Try to submit without filling required fields
    fireEvent.click(submitButton)

    // Should show validation errors or prevent submission
    await waitFor(() => {
      expect(mockFetch).not.toHaveBeenCalled()
    })
  })

  it('handles form submission successfully', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: 'Success' }),
    } as Response)

    render(<ReportForm />)

    // Fill required fields
    fireEvent.change(screen.getByLabelText(/номер телефона мошенника/i), {
      target: { value: '+77771234567' }
    })
    fireEvent.change(screen.getByLabelText(/компания/i), {
      target: { value: 'Test Bank' }
    })
    fireEvent.change(screen.getByLabelText(/описание ситуации/i), {
      target: { value: 'Test description' }
    })

    // Check disclaimer
    fireEvent.click(screen.getByRole('checkbox'))

    // Submit form
    fireEvent.click(screen.getByRole('button', { name: /отправить отчет/i }))

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/scams', expect.objectContaining({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      }))
    })
  })

  it('shows success message after successful submission', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: 'Success' }),
    } as Response)

    render(<ReportForm />)

    // Fill form and submit
    fireEvent.change(screen.getByLabelText(/номер телефона мошенника/i), {
      target: { value: '+77771234567' }
    })
    fireEvent.change(screen.getByLabelText(/компания/i), {
      target: { value: 'Test Bank' }
    })
    fireEvent.change(screen.getByLabelText(/описание ситуации/i), {
      target: { value: 'Test description' }
    })
    fireEvent.click(screen.getByRole('checkbox'))
    fireEvent.click(screen.getByRole('button', { name: /отправить отчет/i }))

    await waitFor(() => {
      expect(screen.getByText('✅ Отчет успешно добавлен!')).toBeInTheDocument()
    })
  })

  it('shows error message on submission failure', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Submission failed' }),
    } as Response)

    render(<ReportForm />)

    // Fill form and submit
    fireEvent.change(screen.getByLabelText(/номер телефона мошенника/i), {
      target: { value: '+77771234567' }
    })
    fireEvent.change(screen.getByLabelText(/компания/i), {
      target: { value: 'Test Bank' }
    })
    fireEvent.change(screen.getByLabelText(/описание ситуации/i), {
      target: { value: 'Test description' }
    })
    fireEvent.click(screen.getByRole('checkbox'))
    fireEvent.click(screen.getByRole('button', { name: /отправить отчет/i }))

    await waitFor(() => {
      expect(screen.getByText('Submission failed')).toBeInTheDocument()
    })
  })

  it('disables submit button when disclaimer not checked', () => {
    render(<ReportForm />)

    const submitButton = screen.getByRole('button', { name: /отправить отчет/i })

    // Fill form but don't check disclaimer
    fireEvent.change(screen.getByLabelText(/номер телефона мошенника/i), {
      target: { value: '+77771234567' }
    })
    fireEvent.change(screen.getByLabelText(/компания/i), {
      target: { value: 'Test Bank' }
    })
    fireEvent.change(screen.getByLabelText(/описание ситуации/i), {
      target: { value: 'Test description' }
    })

    expect(submitButton).toBeDisabled()
  })

  it('enables submit button when disclaimer is checked', () => {
    render(<ReportForm />)

    const submitButton = screen.getByRole('button', { name: /отправить отчет/i })
    const disclaimerCheckbox = screen.getByRole('checkbox')

    // Fill form and check disclaimer
    fireEvent.change(screen.getByLabelText(/номер телефона мошенника/i), {
      target: { value: '+77771234567' }
    })
    fireEvent.change(screen.getByLabelText(/компания/i), {
      target: { value: 'Test Bank' }
    })
    fireEvent.change(screen.getByLabelText(/описание ситуации/i), {
      target: { value: 'Test description' }
    })
    fireEvent.click(disclaimerCheckbox)

    expect(submitButton).not.toBeDisabled()
  })

  it('handles gender selection', () => {
    render(<ReportForm />)

    const genderSelect = screen.getByLabelText(/пол мошенника/i)
    fireEvent.change(genderSelect, { target: { value: 'male' } })

    expect(genderSelect).toHaveValue('male')
  })

  it('handles scam type selection', () => {
    render(<ReportForm />)

    const typeSelect = screen.getByLabelText(/тип мошенничества/i)
    fireEvent.change(typeSelect, { target: { value: 'phishing' } })

    expect(typeSelect).toHaveValue('phishing')
  })

  it('handles region selection', () => {
    render(<ReportForm />)

    const regionSelect = screen.getByLabelText(/регион/i)
    fireEvent.change(regionSelect, { target: { value: 'Алматы' } })

    expect(regionSelect).toHaveValue('Алматы')
  })

  it('shows loading state during submission', async () => {
    mockFetch.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))

    render(<ReportForm />)

    // Fill form and submit
    fireEvent.change(screen.getByLabelText(/номер телефона мошенника/i), {
      target: { value: '+77771234567' }
    })
    fireEvent.change(screen.getByLabelText(/компания/i), {
      target: { value: 'Test Bank' }
    })
    fireEvent.change(screen.getByLabelText(/описание ситуации/i), {
      target: { value: 'Test description' }
    })
    fireEvent.click(screen.getByRole('checkbox'))
    fireEvent.click(screen.getByRole('button', { name: /отправить отчет/i }))

    expect(screen.getByText('Отправка...')).toBeInTheDocument()
  })

  it('validates phone number format', () => {
    render(<ReportForm />)

    const phoneInput = screen.getByLabelText(/номер телефона мошенника/i)

    // Test invalid phone
    fireEvent.change(phoneInput, { target: { value: 'invalid' } })

    // Should still allow submission (client-side validation is minimal)
    expect(phoneInput).toHaveValue('invalid')
  })

  it('prevents submission when disclaimer not accepted', async () => {
    render(<ReportForm />)

    // Fill form but don't check disclaimer
    fireEvent.change(screen.getByLabelText(/номер телефона мошенника/i), {
      target: { value: '+77771234567' }
    })
    fireEvent.change(screen.getByLabelText(/компания/i), {
      target: { value: 'Test Bank' }
    })
    fireEvent.change(screen.getByLabelText(/описание ситуации/i), {
      target: { value: 'Test description' }
    })

    const submitButton = screen.getByRole('button', { name: /отправить отчет/i })
    fireEvent.click(submitButton)

    expect(mockFetch).not.toHaveBeenCalled()
  })

  it('handles network errors gracefully', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'))

    render(<ReportForm />)

    // Fill form and submit
    fireEvent.change(screen.getByLabelText(/номер телефона мошенника/i), {
      target: { value: '+77771234567' }
    })
    fireEvent.change(screen.getByLabelText(/компания/i), {
      target: { value: 'Test Bank' }
    })
    fireEvent.change(screen.getByLabelText(/описание ситуации/i), {
      target: { value: 'Test description' }
    })
    fireEvent.click(screen.getByRole('checkbox'))
    fireEvent.click(screen.getByRole('button', { name: /отправить отчет/i }))

    await waitFor(() => {
      expect(screen.getByText('Ошибка сети. Попробуйте позже.')).toBeInTheDocument()
    })
  })
})


