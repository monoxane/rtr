import { RouterProvider } from 'react-router-dom';
import Favicon from 'react-favicon';
import React from 'react';

import {
  ErrorBoundary,
} from '@carbon/react';

import { AuthProvider } from './context/AuthProvider';

import Routes from './common/Routes.jsx';
import ReactError from './common/ReactError.jsx';
import imgs from './common/imgs.js';

function App() {
  return (
    <ErrorBoundary fallback={<ReactError />}>
      <AuthProvider>
        <Favicon url={imgs.favicon} />
        <RouterProvider router={Routes} />
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
