import React from 'react';
import config from './config';
import DisplayTableCell from './DisplayTableCell';

export default {
  config,
  component: {
    displayJSX: props => {
      return <DisplayTableCell {...props} />;
    },
  },
};
