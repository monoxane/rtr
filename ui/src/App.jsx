import React from 'react';
import Favicon from 'react-favicon';

import { RouterProvider } from 'react-router-dom';

import {
  ErrorBoundary,
} from '@carbon/react';

import imgs from './common/imgs.js';

import ReactError from './common/ReactError.jsx';
import Routes from './common/Routes.jsx';

function App() {
  return (
    <ErrorBoundary fallback={<ReactError />}>
      <Favicon url={imgs.favicon} />
      <RouterProvider router={Routes} />
    </ErrorBoundary>
  );
}

export default App;
