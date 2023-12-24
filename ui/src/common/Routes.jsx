import React, { lazy, useEffect } from 'react';

import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  useNavigate,
} from 'react-router-dom';

import Layout from './Layout.jsx';
import PersistLogin from './PersistLogin.jsx';
import NoRoute from './NoRoute.jsx';
import RequireAuth from './RequireAuth.jsx';

const Login = lazy(() => import('../views/Login/Login.jsx'));

const Router = lazy(() => import('../views/Router/Router.jsx'));
const RouterSingle = lazy(() => import('../views/Router/RouterSingle.jsx'));
const Probe = lazy(() => import('../views/Probe/Probe.jsx'));
const Salvos = lazy(() => import('../views/Salvos/Salvos.jsx'));
const Salvo = lazy(() => import('../views/Salvos/Salvo.jsx'));
const Config = lazy(() => import('../views/Config/Config.jsx'));

const ROLES = {
  Admin: 'ADMIN',
  Operator: 'OPERATOR',
  Viewer: 'VIEWER',
};

export default createBrowserRouter(
  createRoutesFromElements(
    <Route element={<Layout />}>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<PersistLogin />}>
        <Route element={<RequireAuth allowedRoles={[ROLES.Admin]} />}>
          <Route path="/" element={<Root />} />
          <Route path="/router" element={<Router />} />
        </Route>
        <Route path="/router/:destination" element={<RouterSingle />} />
        <Route path="/probe" element={<Probe />} />
        <Route path="/salvos" element={<Salvos />} />
        <Route path="/salvos/:id" element={<Salvo />} />
        <Route path="/config" element={<Config />} />
      </Route>
      <Route path="*" element={<NoRoute />} />
    </Route>,
  ),
);

function Root() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate('/router');
  }, []);

  return (
    <>
      Redirecting...
    </>
  );
}
