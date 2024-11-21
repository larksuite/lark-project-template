import React from 'react';
import { createRoot } from 'react-dom/client';

// The default entry file.
const container = document.createElement('div');
container.id = 'app';
document.body.appendChild(container);
const root = createRoot(container);

root.render(
  <div>
    <h1 className="title">Demo Feature</h1>
  </div>,
);
