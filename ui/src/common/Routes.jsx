import React, { lazy, useEffect, useContext } from 'react';
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  useNavigate,
} from 'react-router-dom';
import configContext from '../context/configContext';

import Layout from './Layout.jsx';

const Router = lazy(() => import('../views/Router/Router.jsx'));
const RouterSingle = lazy(() => import('../views/Router/RouterSingle.jsx'));
const Probe = lazy(() => import('../views/Probe/Probe.jsx'));
const Salvos = lazy(() => import('../views/Salvos/Salvos.jsx'));
const Salvo = lazy(() => import('../views/Salvos/Salvo.jsx'));
const RouterConfig = lazy(() => import('../views/config.Global/RouterConfig.jsx'));
const ProbeConfig = lazy(() => import('../views/config.Global/ProbeConfig.jsx'));

export default createBrowserRouter(
  createRoutesFromElements(
    <Route element={<Layout />}>
      <Route path="/" element={<Root />} />
      <Route path="/router" element={<Router />} />
      <Route path="/router/:destination" element={<RouterSingle />} />
      <Route path="/probe" element={<Probe />} />
      <Route path="/salvos" element={<Salvos />} />
      <Route path="/salvos/:id" element={<Salvo />} />
      <Route path="/config/router" element={<RouterConfig />} />
      <Route path="/config/probe" element={<ProbeConfig />} />
    </Route>,
  ),
);

function Root() {
  const navigate = useNavigate();

  const { config } = useContext(configContext);

  useEffect(() => {
    if (config && !config.configuration_required) {
      navigate('/router');
    }

    if (config && config.configuration_required) {
      navigate('/config/router');
    }
  }, [config]);

  return (
    <>
      {config.error && 'Unable to Connect to rtr'}
      {!config.error && 'Loading...'}
    </>
  );
}
