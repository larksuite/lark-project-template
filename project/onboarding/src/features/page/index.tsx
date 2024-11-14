import React from 'react';
import { createRoot } from 'react-dom/client';
import '../../utils/mobile_console';
import { Entry } from '../../component';
import Board from './app';

const container = document.createElement('div');
container.id = 'app';
document.body.appendChild(container);
const root = createRoot(container);
root.render(
  <Entry>
    <Board />
  </Entry>,
);
