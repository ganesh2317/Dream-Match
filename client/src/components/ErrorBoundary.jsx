import React, { Component } from 'react';
import GlassCard from './GlassCard';
import { AlertTriangle, RefreshCw } from 'lucide-react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
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
          background: 'var(--bg-gradient)'
        }}>
          <GlassCard style={{ maxWidth: '500px', textAlign: 'center', padding: '40px' }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'rgba(239, 68, 68, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px'
            }}>
              <AlertTriangle size={32} color="var(--error)" />
            </div>
            <h2 style={{ fontSize: '24px', marginBottom: '12px', fontWeight: 800 }}>The Subconscious Collapsed</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '15px', marginBottom: '32px', lineHeight: '1.6' }}>
              We encountered a glitch while rendering the dreamscape. Don't worry, your dreams are safe.
            </p>
            <button
              onClick={this.handleReset}
              style={{
                padding: '14px 28px',
                borderRadius: '12px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '15px'
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
