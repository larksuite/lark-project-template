import React from 'react';
import { createRoot } from 'react-dom/client';
import { Entry } from '../../component';

import App from './app';

const container = document.createElement('div');
container.id = 'app';
document.body.appendChild(container);
const root = createRoot(container);
root.render(
  <Entry>
    <App />
  </Entry>,
);
