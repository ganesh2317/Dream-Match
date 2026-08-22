import React, { Component } from 'react';
import GlassCard from './GlassCard';
import { AlertTriangle, RefreshCw } from 'lucide-react';

/**
 * @file ErrorBoundary.jsx
 * React Error Boundary component catching uncaught UI errors and displaying a fallback card.
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }


  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          height: '100vh',
          width: '100vw',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          background: 'var(--bg-dark)',
          backgroundImage: 'radial-gradient(ellipse at 50% 30%, rgba(248,113,113,0.06) 0%, transparent 55%), var(--bg-gradient)',
        }}>
          <GlassCard level="float" style={{ maxWidth: '500px', textAlign: 'center', padding: '48px 40px' }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'var(--alert-glow)',
              border: '1px solid rgba(248, 113, 113, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 28px'
            }}>
              <AlertTriangle size={28} color="var(--alert)" />
            </div>
            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'var(--text-xl)',
              fontWeight: 600,
              letterSpacing: '-0.02em',
              marginBottom: '12px',
            }}>The Subconscious Collapsed</h2>
            <p style={{
              fontFamily: 'var(--font-body)',
              color: 'var(--fog)',
              fontSize: 'var(--text-base)',
              marginBottom: import.meta.env.DEV && this.state.error ? '16px' : '36px',
              lineHeight: '1.65'
            }}>
              Something went wrong in the dreamscape. Your data is safe.
            </p>
            {import.meta.env.DEV && this.state.error && (
              <pre style={{
                textAlign: 'left',
                background: 'var(--alert-glow)',
                border: '1px solid rgba(248, 113, 113, 0.2)',
                borderRadius: 'var(--radius-md)',
                padding: '14px',
                fontSize: '11px',
                fontFamily: 'var(--font-body)',
                color: 'var(--alert)',
                overflowX: 'auto',
                marginBottom: '24px',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word'
              }}>
                {this.state.error.toString()}
                {this.state.errorInfo && '\n\nComponent Stack:' + this.state.errorInfo.componentStack}
              </pre>
            )}
            <button
              onClick={this.handleReset}
              style={{
                padding: '14px 28px',
                borderRadius: 'var(--radius-md)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--text-base)',
                fontWeight: 600,
              }}
            >
              <RefreshCw size={16} /> Reconnect Mind
            </button>
          </GlassCard>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
