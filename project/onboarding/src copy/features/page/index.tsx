import React from 'react';
import { createRoot } from 'react-dom/client';

const container = document.createElement('div');
container.id = 'app';
document.body.appendChild(container);
const root = createRoot(container);

root.render(
  <div>
    <h1 className="title">Demo Feature Test</h1>
  </div>,
);
