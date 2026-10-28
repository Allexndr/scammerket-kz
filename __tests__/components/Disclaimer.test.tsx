import { render, screen } from '@testing-library/react'
import Disclaimer from '@/components/Disclaimer'

describe('Disclaimer', () => {
  it('renders disclaimer with warning icon and text', () => {
    render(<Disclaimer />)

    expect(screen.getByText('Важное предупреждение')).toBeInTheDocument()
    expect(screen.getByText(/мы не модерируем контент/i)).toBeInTheDocument()
    expect(screen.getByText(/мы не несем ответственности/i)).toBeInTheDocument()
    expect(screen.getByText(/решение принимаете вы сами/i)).toBeInTheDocument()
  })

  it('has correct styling', () => {
    render(<Disclaimer />)

    const container = screen.getByText('Важное предупреждение').closest('div')
    expect(container).toHaveClass('bg-yellow-50')
    expect(container).toHaveClass('border-yellow-200')
  })
})



