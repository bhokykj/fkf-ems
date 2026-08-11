import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("React Error Boundary caught an error:", error, errorInfo);
  }

  handleReset = () => {
    localStorage.clear();
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', background: '#F8FAFC', fontFamily: 'sans-serif' }}>
          <div style={{ background: '#FFFFFF', padding: '2.5rem', borderRadius: '20px', border: '1px solid #E2E8F0', maxWidth: '500px', width: '100%', textAlign: 'center', boxShadow: '0 20px 40px rgba(0,0,0,0.08)' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#FEF2F2', color: '#EF4444', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto', fontSize: '1.5rem', fontWeight: 'bold' }}>
              !
            </div>
            <h2 style={{ color: '#0F172A', marginBottom: '0.5rem', fontSize: '1.4rem' }}>FKF Micro-Credit System</h2>
            <p style={{ color: '#64748B', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              Kuna hitilafu ndogo imetokea wakati wa kupakia ukurasa. Bonyeza kitufe hapa chini kusafisha cache na kufungua upya.
            </p>
            <div style={{ background: '#F1F5F9', padding: '0.75rem', borderRadius: '8px', fontSize: '0.75rem', color: '#EF4444', fontFamily: 'monospace', marginBottom: '1.5rem', wordBreak: 'break-all' }}>
              {this.state.error?.toString()}
            </div>
            <button 
              onClick={this.handleReset}
              style={{ background: 'linear-gradient(135deg, #D4AF37 0%, #B8860B 100%)', color: '#000', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '10px', fontWeight: '800', fontSize: '0.9rem', cursor: 'pointer', width: '100%' }}
            >
              Safisha Cache & Fungua Mfumo Upya (Reset & Reload)
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
)
