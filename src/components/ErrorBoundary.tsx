'use client'
import React from 'react'

interface Props {
  children: React.ReactNode
  fallback?: React.ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo): void {
    console.error('ArenaIQ Error Boundary:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? (
        <div role="alert" className="p-8 text-center">
          <h2 className="text-xl font-bold text-red-400 mb-2">
            Something went wrong
          </h2>
          <p className="text-slate-400 text-sm">
            {this.state.error?.message ?? 'An unexpected error occurred'}
          </p>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="mt-4 px-4 py-2 bg-gold text-navy-deep rounded-lg 
              font-bold text-sm"
          >
            Try Again
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
