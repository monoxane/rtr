import React, { lazy } from 'react';

import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  useNavigate,
} from 'react-router-dom';

import Layout from './Layout.jsx';

const Router = lazy(() => import('../views/Router/Router.jsx'));
const RouterSingle = lazy(() => import('../views/Router/RouterSingle.jsx'));
const Probe = lazy(() => import('../views/Probe/Probe.jsx'));
const Salvos = lazy(() => import('../views/Salvos/Salvos.jsx'));
const Config = lazy(() => import('../views/Config/Config.jsx'));

export default createBrowserRouter(
  createRoutesFromElements(
    <Route element={<Layout />}>
      <Route path="/" element={<Root />} />
      <Route path="/router" element={<Router />} />
      <Route path="/router/:destination" element={<RouterSingle />} />
      <Route path="/probe" element={<Probe />} />
      <Route path="/salvos" element={<Salvos />} />
      <Route path="/config" element={<Config />} />
    </Route>,
  ),
);

function Root() {
  const navigate = useNavigate();

  return (
    <>{navigate('/router')}</>
  );
}
