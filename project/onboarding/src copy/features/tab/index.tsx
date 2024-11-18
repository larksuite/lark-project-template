import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.less';
import { Entry, FieldManager } from '../../component';
import '../../utils/mobile_console';

const container = document.createElement('div');
container.id = 'app';
// container.style.height = '800px';
document.body.appendChild(container);
const root = createRoot(container);
root.render(
  <Entry>
    <FieldManager />
  </Entry>,
);
