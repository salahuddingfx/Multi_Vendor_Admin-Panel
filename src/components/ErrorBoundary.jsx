import { Component } from 'react';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-6">
          <div className="text-center max-w-lg">
            <div className="w-28 h-28 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-8">
              <AlertTriangle size={56} className="text-red-500" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-3">Something Went Wrong</h1>
            <p className="text-gray-500 mb-10 leading-relaxed">
              An unexpected error occurred. Please try refreshing the page.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => window.location.reload()}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-600/20"
              >
                <RotateCcw size={18} /> Refresh Page
              </button>
              <a
                href="/"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 bg-white text-indigo-600 border-2 border-indigo-200 rounded-lg font-semibold hover:border-indigo-600 transition-all"
              >
                <Home size={18} /> Go Home
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
