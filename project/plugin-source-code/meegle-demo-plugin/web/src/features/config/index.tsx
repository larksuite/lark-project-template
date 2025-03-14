import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './app';
import { Entry } from '../../component';

const container = document.createElement('div');
container.id = 'app';
// container.style.height = '800px';
document.body.appendChild(container);
const root = createRoot(container);
root.render(
  <Entry>
    <App />
  </Entry>,
);
