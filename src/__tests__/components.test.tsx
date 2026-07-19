import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { expect, test, vi, describe, it } from 'vitest'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { ErrorBoundary } from '../components/ErrorBoundary'

describe('ErrorBoundary', () => {
  it('renders children when no error', () => {
    render(
      <ErrorBoundary>
        <div>Safe content</div>
      </ErrorBoundary>
    )
    expect(screen.getByText('Safe content')).toBeInTheDocument()
  })

  it('renders fallback on error', () => {
    const ThrowError = () => { throw new Error('Test error') }
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    )
    expect(screen.getByRole('alert')).toBeInTheDocument()
    spy.mockRestore()
  })
})

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

  test('Button applies variant classes', () => {
    const { rerender } = render(<Button variant="primary">Btn</Button>)
    expect(screen.getByRole('button')).toHaveClass('bg-emerald-600')

    rerender(<Button variant="secondary">Btn</Button>)
    expect(screen.getByRole('button')).toHaveClass('bg-zinc-900/60')

    rerender(<Button variant="danger">Btn</Button>)
    expect(screen.getByRole('button')).toHaveClass('text-red-400')
  })

  test('Button disabled state disables the button and prevents click', () => {
    const handleClick = vi.fn()
    render(<Button disabled onClick={handleClick}>Disabled Btn</Button>)
    const btn = screen.getByRole('button')
    expect(btn).toBeDisabled()
    fireEvent.click(btn)
    expect(handleClick).not.toHaveBeenCalled()
  })

  test('Button aria-label passthrough', () => {
    render(<Button aria-label="Custom Accessible Button">Btn</Button>)
    expect(screen.getByRole('button', { name: 'Custom Accessible Button' })).toBeInTheDocument()
  })

  test('Input renders correct labels and handles values', () => {
    const handleChange = vi.fn()
    render(<Input label="Name" id="name-input" onChange={handleChange} value="Fifa" readOnly />)

    const label = screen.getByLabelText('Name')
    expect(label).toBeInTheDocument()
    expect(label).toHaveValue('Fifa')
  })

  test('Input renders with label (extended)', () => {
    render(<Input id="test-input" label="Enter Username" />)
    expect(screen.getByLabelText('Enter Username')).toBeInTheDocument()
  })

  test('Input shows error message', () => {
    render(<Input id="test-input" label="Username" error="Username is required" />)
    expect(screen.getByText('Username is required')).toBeInTheDocument()
  })

  test('Input aria-invalid when error present', () => {
    const { rerender } = render(<Input id="test-input" label="Username" />)
    expect(screen.getByLabelText('Username')).toHaveAttribute('aria-invalid', 'false')

    rerender(<Input id="test-input" label="Username" error="Oops" />)
    expect(screen.getByLabelText('Username')).toHaveAttribute('aria-invalid', 'true')
  })

  test('Input onChange fires correctly', () => {
    const handleChange = vi.fn()
    render(<Input id="test-input" label="Username" onChange={handleChange} />)
    const input = screen.getByLabelText('Username')
    fireEvent.change(input, { target: { value: 'johndoe' } })
    expect(handleChange).toHaveBeenCalledTimes(1)
  })
})
