import React from 'react';

export class ErrorBoundary extends React.Component<{
  children: React.ReactNode;
}> {
  componentDidCatch(error, errorInfo) {
    console.log('plugin-render-error', error, errorInfo);
  }

  render() {
    return this.props.children;
  }
}
