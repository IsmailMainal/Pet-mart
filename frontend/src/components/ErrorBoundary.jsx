import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from './UI';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center p-6 text-center">
          <div className="bg-white p-10 rounded-[3rem] shadow-2xl shadow-stone-200 border border-stone-100 max-w-lg w-full">
            <div className="w-20 h-20 bg-red-100 text-red-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <AlertTriangle size={40} />
            </div>
            <h1 className="text-2xl font-black text-stone-800 mb-2">Oops! Something went wrong</h1>
            <p className="text-stone-500 mb-8 text-sm">
              An unexpected error occurred. Don't worry, your data is safe. Try refreshing the page or going back to the dashboard.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                variant="primary" 
                className="flex-1" 
                onClick={() => window.location.reload()}
              >
                <RefreshCw size={16} /> Refresh Page
              </Button>
              <Button 
                variant="secondary" 
                className="flex-1" 
                onClick={() => window.location.href = '/dashboard'}
              >
                <Home size={16} /> Go Dashboard
              </Button>
            </div>
            {process.env.NODE_ENV === 'development' && (
              <div className="mt-8 p-4 bg-stone-900 rounded-2xl text-left overflow-auto max-h-40">
                <code className="text-red-400 text-xs whitespace-pre-wrap">
                  {this.state.error?.toString()}
                </code>
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
