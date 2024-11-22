import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.less';
import { FieldManager } from './components/FieldManager';
import { WorkItemFinder } from './components/WorkItemFinder';
import { AppContainer } from '../../common/components/AppContainer';

// The entry file for tab.
const container = document.createElement('div');
container.id = 'app';
document.body.appendChild(container);
const root = createRoot(container);
root.render(
  <>
    <AppContainer>
      <FieldManager />
      <WorkItemFinder />
    </AppContainer>
  </>,
);
