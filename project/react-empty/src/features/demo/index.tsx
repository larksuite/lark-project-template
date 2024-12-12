import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

export default function main() {
  const container = document.createElement('div');
  container.id = 'app';
  document.body.appendChild(container);
  const root = createRoot(container);

  root.render(
    <App />,
  );
}
