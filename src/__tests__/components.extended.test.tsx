import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { expect, test, vi, describe } from 'vitest'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { NavigationForm } from '../components/navigation-form'
import { ChatInterface } from '../components/chat-interface'

describe('UI Primitives Components - Extended', () => {
  describe('Button component', () => {
    test('renders children', () => {
      render(<Button>Submit Action</Button>)
      expect(screen.getByText('Submit Action')).toBeInTheDocument()
    })

    test('applies variant classes', () => {
      const { rerender } = render(<Button variant="primary">Btn</Button>)
      expect(screen.getByRole('button')).toHaveClass('bg-emerald-600')

      rerender(<Button variant="secondary">Btn</Button>)
      expect(screen.getByRole('button')).toHaveClass('bg-zinc-900/60')

      rerender(<Button variant="danger">Btn</Button>)
      expect(screen.getByRole('button')).toHaveClass('text-red-400')
    })

    test('disabled state disables the button and prevents click', () => {
      const handleClick = vi.fn()
      render(<Button disabled onClick={handleClick}>Disabled Btn</Button>)
      const btn = screen.getByRole('button')
      expect(btn).toBeDisabled()
      fireEvent.click(btn)
      expect(handleClick).not.toHaveBeenCalled()
    })

    test('onClick handler fires', () => {
      const handleClick = vi.fn()
      render(<Button onClick={handleClick}>Click Me</Button>)
      fireEvent.click(screen.getByRole('button'))
      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    test('aria-label passthrough', () => {
      render(<Button aria-label="Custom Accessible Button">Btn</Button>)
      expect(screen.getByRole('button', { name: 'Custom Accessible Button' })).toBeInTheDocument()
    })
  })

  describe('Input component', () => {
    test('renders with label', () => {
      render(<Input id="test-input" label="Enter Username" />)
      expect(screen.getByLabelText('Enter Username')).toBeInTheDocument()
    })

    test('shows error message', () => {
      render(<Input id="test-input" label="Username" error="Username is required" />)
      expect(screen.getByText('Username is required')).toBeInTheDocument()
    })

    test('aria-invalid when error present', () => {
      const { rerender } = render(<Input id="test-input" label="Username" />)
      expect(screen.getByLabelText('Username')).toHaveAttribute('aria-invalid', 'false')

      rerender(<Input id="test-input" label="Username" error="Oops" />)
      expect(screen.getByLabelText('Username')).toHaveAttribute('aria-invalid', 'true')
    })

    test('onChange fires correctly', () => {
      const handleChange = vi.fn()
      render(<Input id="test-input" label="Username" onChange={handleChange} />)
      const input = screen.getByLabelText('Username')
      fireEvent.change(input, { target: { value: 'johndoe' } })
      expect(handleChange).toHaveBeenCalledTimes(1)
    })
  })
})

describe('Feature Components - Extended', () => {
  const mockZones = [
    { id: 'Z1', name: 'Gate A', status: 'open' as const },
    { id: 'Z2', name: 'Section 101', status: 'open' as const }
  ]

  describe('NavigationForm component', () => {
    test('renders start/end selectors', () => {
      render(<NavigationForm zones={mockZones} onSubmit={() => {}} loading={false} />)
      expect(screen.getByLabelText(/Departure/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/Destination/i)).toBeInTheDocument()
    })

    test('submit button disabled when empty, enabled when both selected', () => {
      render(<NavigationForm zones={mockZones} onSubmit={() => {}} loading={false} />)
      const submitBtn = screen.getByRole('button', { name: /Calculate optimal route/i })
      expect(submitBtn).toBeDisabled()

      // Render with selections (via manual state update in component, so we change inputs using testing-library)
      const startSelect = screen.getByLabelText(/Departure/i)
      const endSelect = screen.getByLabelText(/Destination/i)

      fireEvent.change(startSelect, { target: { value: 'Z1' } })
      fireEvent.change(endSelect, { target: { value: 'Z2' } })

      expect(submitBtn).toBeEnabled()
    })

    test('onSubmit fires with correct values', () => {
      const handleSubmit = vi.fn()
      render(<NavigationForm zones={mockZones} onSubmit={handleSubmit} loading={false} />)

      fireEvent.change(screen.getByLabelText(/Departure/i), { target: { value: 'Z1' } })
      fireEvent.change(screen.getByLabelText(/Destination/i), { target: { value: 'Z2' } })
      fireEvent.change(screen.getByLabelText(/AI Guide Language/i), { target: { value: 'es' } })

      fireEvent.submit(screen.getByRole('form', { name: /Route Planning Form/i }))
      expect(handleSubmit).toHaveBeenCalledWith('Z1', 'Z2', 'es')
    })
  })

  describe('ChatInterface component', () => {
    const mockMessages = [
      { role: 'user' as const, text: 'Hello ArenaIQ' },
      { role: 'model' as const, text: 'Hello operations crew' }
    ]

    test('renders message list', () => {
      render(
        <ChatInterface
          messages={mockMessages}
          sending={false}
          onSendMessage={() => {}}
          language="en"
          onLanguageChange={() => {}}
          onClearChat={() => {}}
        />
      )
      expect(screen.getByText('Hello ArenaIQ')).toBeInTheDocument()
      expect(screen.getByText('Hello operations crew')).toBeInTheDocument()
    })

    test('user message bubble vs assistant bubble styling', () => {
      render(
        <ChatInterface
          messages={mockMessages}
          sending={false}
          onSendMessage={() => {}}
          language="en"
          onLanguageChange={() => {}}
          onClearChat={() => {}}
        />
      )
      
      const userBubble = screen.getByText('Hello ArenaIQ').parentElement
      const modelBubble = screen.getByText('Hello operations crew').parentElement

      expect(userBubble).toHaveClass('bg-emerald-600')
      expect(modelBubble).toHaveClass('bg-zinc-900')
    })

    test('empty state rendering', () => {
      render(
        <ChatInterface
          messages={[]}
          sending={false}
          onSendMessage={() => {}}
          language="en"
          onLanguageChange={() => {}}
          onClearChat={() => {}}
        />
      )
      expect(screen.getByText(/Choose your language and ask your/i)).toBeInTheDocument()
    })

    test('input field accepts text and send button triggers onSend', () => {
      const handleSendMessage = vi.fn()
      render(
        <ChatInterface
          messages={[]}
          sending={false}
          onSendMessage={handleSendMessage}
          language="en"
          onLanguageChange={() => {}}
          onClearChat={() => {}}
        />
      )

      const input = screen.getByPlaceholderText(/Type message here.../i)
      fireEvent.change(input, { target: { value: 'How is concession density?' } })
      expect(input).toHaveValue('How is concession density?')

      fireEvent.submit(screen.getByRole('form', { name: /Send message form/i }))
      expect(handleSendMessage).toHaveBeenCalledWith('How is concession density?')
    })
  })
})
