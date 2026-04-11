import { Component } from 'react'
import type { ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

/**
 * ⚡ ERROR BOUNDARY
 * Catches runtime errors in the app and prevents full page crash
 * Provides fallback UI with error details
 */
export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log to console in dev, could send to error tracking service in prod
    console.error('Error caught by boundary:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-[#03010a] text-white">
          <div className="max-w-md rounded-lg border border-red-500/50 bg-red-950/20 p-6 backdrop-blur-sm">
            <h1 className="mb-2 text-2xl font-bold">Something went wrong</h1>
            <p className="mb-4 text-red-200">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="w-full rounded-lg bg-red-600 px-4 py-2 font-semibold hover:bg-red-700 transition-colors"
            >
              Reload Page
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
