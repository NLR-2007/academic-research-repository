import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <main className="page-shell">
          <section className="panel warning">
            <h1>Frontend error</h1>
            <p>{this.state.error.message}</p>
            <p>Open the browser console for the full stack trace.</p>
          </section>
        </main>
      );
    }

    return this.props.children;
  }
}
