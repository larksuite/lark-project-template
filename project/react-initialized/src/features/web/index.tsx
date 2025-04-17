import React, { lazy, Suspense } from 'react';
import ReactDOM from 'react-dom';
import { createRoot } from 'react-dom/client';

const App = lazy(() => import('./App'));

export default async function main() {
  await window.JSSDK.shared.setSharedModules({
    React,
    ReactDOM,
  });

  const container = document.createElement('div');
  container.id = 'app';
  document.body.appendChild(container);
  const root = createRoot(container);

  root.render(
    <Suspense fallback={<div>loading...</div>}>
      <App />
    </Suspense>
  );
}
