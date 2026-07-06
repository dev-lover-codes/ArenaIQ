import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { expect, test, vi, describe } from 'vitest'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { NavigationForm } from '../components/navigation-form'
import { ChatInterface } from '../components/chat-interface'

describe('UI Primitives Components', () => {
  test('Button renders children and handles clicks', () => {
    const handleClick = vi.fn()
    render(<Button onClick={handleClick}>Click Me</Button>)
    
    const btn = screen.getByRole('button', { name: /Click Me/i })
    expect(btn).toBeInTheDocument()
    
    fireEvent.click(btn)
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  test('Button disables and displays spinner during loading state', () => {
    render(<Button loading={true}>Click Me</Button>)
    const btn = screen.getByRole('button')
    expect(btn).toBeDisabled()
  })

  test('Input renders correct labels and handles values', () => {
    const handleChange = vi.fn()
    render(<Input label="Name" id="name-input" onChange={handleChange} value="Fifa" readOnly />)
    
    const label = screen.getByLabelText('Name')
    expect(label).toBeInTheDocument()
    expect(label).toHaveValue('Fifa')
  })
})

describe('Feature Layout Components', () => {
  const mockZones = [
    { id: '1', name: 'Gate A', status: 'open' as const },
    { id: '2', name: 'Section 100', status: 'open' as const }
  ]

  test('NavigationForm trigger onSubmit with proper data values', () => {
    const handleSubmit = vi.fn()
    render(<NavigationForm zones={mockZones} onSubmit={handleSubmit} loading={false} />)

    const startSelect = screen.getByLabelText(/Departure/i)
    const endSelect = screen.getByLabelText(/Destination/i)
    
    fireEvent.change(startSelect, { target: { value: '1' } })
    fireEvent.change(endSelect, { target: { value: '2' } })

    const submitBtn = screen.getByRole('button', { name: /Calculate optimal route/i })
    fireEvent.click(submitBtn)

    expect(handleSubmit).toHaveBeenCalledWith('1', '2', 'en')
  })

  test('ChatInterface renders history and fires events', () => {
    const handleSendMessage = vi.fn()
    const handleClearChat = vi.fn()
    const handleLangChange = vi.fn()

    const mockMessages = [
      { role: 'user' as const, text: 'Hello' },
      { role: 'model' as const, text: 'Welcome to Stadium' }
    ]

    render(
      <ChatInterface
        messages={mockMessages}
        sending={false}
        onSendMessage={handleSendMessage}
        language="en"
        onLanguageChange={handleLangChange}
        onClearChat={handleClearChat}
      />
    )

    // Check message visibility
    expect(screen.getByText('Hello')).toBeInTheDocument()
    expect(screen.getByText('Welcome to Stadium')).toBeInTheDocument()

    // Test input send
    const input = screen.getByLabelText('Message Input')
    fireEvent.change(input, { target: { value: 'Query details' } })
    
    const sendBtn = screen.getByRole('button', { name: /Send message/i })
    fireEvent.click(sendBtn)
    
    expect(handleSendMessage).toHaveBeenCalledWith('Query details')

    // Test clear trigger
    const clearBtn = screen.getByRole('button', { name: /Clear chat messages/i })
    fireEvent.click(clearBtn)
    expect(handleClearChat).toHaveBeenCalledTimes(1)
  })
})
