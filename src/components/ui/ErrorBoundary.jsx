import React from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    console.error('ResumeFit error:', error, info)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
    window.location.href = '/dashboard'
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <AlertTriangle size={32} />
          <h1>Something went wrong</h1>
          <p>The app hit an unexpected error. Your saved session data in the browser is still safe.</p>
          <button type="button" className="btn btn-primary" onClick={this.handleReset}>
            <RefreshCw size={14} />
            Back to dashboard
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
