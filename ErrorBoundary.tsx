import { Component, type ErrorInfo, type ReactNode } from 'react';
export class ErrorBoundary extends Component<{ children: ReactNode }, { error: string }> {
  state = { error: '' };
  static getDerivedStateFromError(error: Error) { return { error: error.message || 'Kesalahan tidak diketahui.' }; }
  componentDidCatch(error: Error, info: ErrorInfo) { if (import.meta.env.DEV) console.error('[NAFI]', error, info); }
  render() {
    if (this.state.error) return <main className="error-page"><div className="panel"><span className="eyebrow">SYSTEM ERROR</span><h1>NAFI Marketplace mengalami error</h1><p>{this.state.error}</p><button className="btn primary" onClick={() => location.reload()}>Muat Ulang</button></div></main>;
    return this.props.children;
  }
}
