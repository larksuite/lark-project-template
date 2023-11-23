import React from 'react';
import Board from './features/Board';
import Button from './features/Button';
import IDButton from './features/Button/IDButton';
import Config from './features/Config';
import Controls from './features/Controls';
import Dashboard from './features/Dashboard';
import View from './features/View';

export * from './accessControl';

const renderBoard = () => <Board />;
const renderDashboard = () => <Dashboard />;
const renderConfig = () => <Config />;
const renderView = () => <View />;
const controls = Controls;
const buttons = [
  { key: 'button_demo', renderer: Button },
  { key: 'button_id', renderer: IDButton },
];

export { renderBoard, renderDashboard, renderConfig, renderView, controls, buttons };
