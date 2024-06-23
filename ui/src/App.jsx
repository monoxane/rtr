import React, { useState, useMemo, useEffect } from 'react';
import Favicon from 'react-favicon';
import useAxios from 'axios-hooks';

import PropTypes from 'prop-types';

import { RouterProvider } from 'react-router-dom';

import {
  ErrorBoundary,
} from '@carbon/react';

import imgs from './common/imgs.js';

import ReactError from './common/ReactError.jsx';
import Routes from './common/Routes.jsx';

import configContext from './context/configContext';
import { AuthProvider } from './context/AuthProvider';

function ConfigContext({ children }) {
  const [config, setConfig] = useState({ loading: true, error: false });

  const [{ data, loading, error }, refreshConfig] = useAxios(
    '/v1/config',
  );

  const value = useMemo(
    () => ({
      name: 'Memoized Configuration Context',
      config,
      refreshConfig: () => refreshConfig(),
    }),
    [config],
  );

  useEffect(() => {
    setConfig({ ...data, loading, error });
  }, [data, loading, error]);

  return <configContext.Provider value={value}>{children}</configContext.Provider>;
}

ConfigContext.propTypes = {
  children: PropTypes.node.isRequired,
};

function App() {
  return (
    <ErrorBoundary fallback={<ReactError />}>
      <AuthProvider>
        <ConfigContext>
          <Favicon url={imgs.favicon} />
          <RouterProvider router={Routes} />
        </ConfigContext>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
