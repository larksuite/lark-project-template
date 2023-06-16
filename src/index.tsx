import React from 'react';
import Board from './features/Board';
import Button from './features/Button';
import IDButton from './features/Button/IDButton';
import Config from './features/Config';
import Control from './features/Control';
import Dashboard from './features/Dashboard';
import View from './features/View';

export * from './accessControl';

const renderBoard = () => <Board />;
const renderDashboard = () => <Dashboard />;
const renderConfig = () => <Config />;
const renderView = () => <View />;
const controls = [{ key: 'control_demo', renderer: Control }];
const buttons = [
  { key: 'button_demo', renderer: Button },
  { key: 'button_id', renderer: IDButton },
];

export { renderBoard, renderDashboard, renderConfig, renderView, controls, buttons };
