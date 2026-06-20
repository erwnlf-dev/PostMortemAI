import React from 'react';

const s = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    background: '#0A0C10',
    color: '#F0F2F5',
    fontFamily: 'Inter, -apple-system, sans-serif',
    padding: 24,
    textAlign: 'center',
  },
  card: {
    maxWidth: 500,
    width: '100%',
    background: '#111318',
    border: '1px solid #2A2F3C',
    borderRadius: 14,
    padding: 32,
    boxShadow: '0 16px 48px rgba(0,0,0,0.6)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  iconWrapper: {
    width: 64,
    height: 64,
    borderRadius: '50%',
    background: 'rgba(248, 113, 113, 0.1)',
    border: '1px solid rgba(248, 113, 113, 0.25)',
    color: '#F87171',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 700,
    marginBottom: 8,
    color: '#F0F2F5',
    letterSpacing: '-0.02em',
  },
  desc: {
    fontSize: 14,
    color: '#8B919E',
    lineHeight: 1.5,
    marginBottom: 24,
  },
  actions: {
    display: 'flex',
    gap: 12,
    width: '100%',
    marginBottom: 20,
  },
  btnPrimary: {
    flex: 1,
    padding: '12px 20px',
    fontSize: 13,
    fontWeight: 600,
    color: '#fff',
    background: 'linear-gradient(135deg, #FF4D00 0%, #FF6A2B 100%)',
    border: 'none',
    borderRadius: 10,
    cursor: 'pointer',
    boxShadow: '0 0 12px rgba(255,77,0,0.25)',
    transition: 'all 150ms ease',
  },
  btnSecondary: {
    flex: 1,
    padding: '12px 20px',
    fontSize: 13,
    fontWeight: 600,
    color: '#8B919E',
    background: '#181C24',
    border: '1px solid #2A2F3C',
    borderRadius: 10,
    cursor: 'pointer',
    transition: 'all 150ms ease',
  },
  detailsBox: {
    width: '100%',
    textAlign: 'left',
    marginTop: 16,
  },
  toggleBtn: {
    background: 'none',
    border: 'none',
    color: '#FF6A2B',
    fontSize: 12,
    fontWeight: 500,
    cursor: 'pointer',
    padding: '4px 0',
    display: 'flex',
    alignItems: 'center',
    gap: 4,
  },
  pre: {
    background: '#0A0C10',
    border: '1px solid #2A2F3C',
    borderRadius: 8,
    padding: 12,
    fontSize: 11,
    fontFamily: 'monospace',
    color: '#F87171',
    overflowX: 'auto',
    maxHeight: 150,
    marginTop: 8,
  },
};

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, showDetails: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    localStorage.removeItem('postmortem_history'); // Try cleaning potentially corrupt data
    window.location.reload();
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={s.container}>
          <div style={s.card}>
            <div style={s.iconWrapper}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </div>
            <h2 style={s.title}>Application Crash Detected</h2>
            <p style={s.desc}>
              A critical rendering or state error occurred. You can attempt to reload the app or clear cache settings to recover.
            </p>

            <div style={s.actions}>
              <button style={s.btnPrimary} onClick={this.handleReload}>
                Reload Page
              </button>
              <button style={s.btnSecondary} onClick={this.handleReset}>
                Reset Cache & Reload
              </button>
            </div>

            <div style={s.detailsBox}>
              <button
                style={s.toggleBtn}
                onClick={() => this.setState((prev) => ({ showDetails: !prev.showDetails }))}
              >
                {this.state.showDetails ? 'Hide Error Details' : 'Show Error Details'}
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points={this.state.showDetails ? "18 15 12 9 6 15" : "6 9 12 15 18 9"} />
                </svg>
              </button>
              {this.state.showDetails && (
                <pre style={s.pre}>
                  {this.state.error?.toString() || 'Unknown Error'}
                </pre>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
