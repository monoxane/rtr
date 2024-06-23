import React, { lazy } from 'react';
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
} from 'react-router-dom';

import {
  Tile, Grid, Column,
} from '@carbon/react';

import Layout from './Layout.jsx';

import PersistLogin from './PersistLogin.jsx';
import RequireAuth from './RequireAuth.jsx';

// Login Pages

const Login = lazy(() => import('../views/Login/Login.jsx'));
const Users = lazy(() => import('../views/Users/Users.jsx'));

const Router = lazy(() => import('../views/Router/Router.jsx'));
const RouterSingle = lazy(() => import('../views/Router/RouterSingle.jsx'));
const Probe = lazy(() => import('../views/Probe/Probe.jsx'));
const Salvos = lazy(() => import('../views/Salvos/Salvos.jsx'));
const Salvo = lazy(() => import('../views/Salvos/Salvo.jsx'));
const RouterConfig = lazy(() => import('../views/Config/RouterConfig.jsx'));
const MatrixConfig = lazy(() => import('../views/Config/MatrixConfig/MatrixConfig.jsx'));
const ProbeConfig = lazy(() => import('../views/Config/ProbeConfig.jsx'));

export default createBrowserRouter(
  createRoutesFromElements(
    <Route element={<Layout />}>
      <Route exact path="/login" element={<Login />} />
      <Route exact path="/" element={<PersistLogin />}>
        <Route element={<RequireAuth allowedRoles={['ADMIN', 'OPERATOR']} />}>
          <Route path="/dashboard" element={<Dashboard />} />
        </Route>

        <Route element={<RequireAuth allowedRoles={['ADMIN']} />}>
          <Route path="/users" element={<Users />} />
        </Route>

        <Route element={<RequireAuth allowedRoles={['ADMIN', 'OPERATOR']} />}>
          <Route path="/router" element={<Router />} />
          <Route path="/router/:destination" element={<RouterSingle />} />
        </Route>

        <Route element={<RequireAuth allowedRoles={['ADMIN', 'OPERATOR']} />}>
          <Route path="/probe" element={<Probe />} />
        </Route>

        <Route element={<RequireAuth allowedRoles={['ADMIN', 'OPERATOR']} />}>
          <Route path="/salvos" element={<Salvos />} />
          <Route path="/salvos/:id" element={<Salvo />} />
        </Route>

        <Route element={<RequireAuth allowedRoles={['ADMIN']} />}>
          <Route path="/config/router" element={<RouterConfig />} />
          <Route path="/config/matrix" element={<MatrixConfig />} />
          <Route path="/config/probe" element={<ProbeConfig />} />
        </Route>
      </Route>
    </Route>,
  ),
);

function Dashboard() {
  return (
    <Grid>
      <Column sm={4} md={8} lg={16}>
        <Tile>
          <h1>
            {' '}
            Welcome to
            {' '}
            <strong>rtr</strong>
            , the Route Broker
          </h1>
        </Tile>
      </Column>
    </Grid>
  );
}
