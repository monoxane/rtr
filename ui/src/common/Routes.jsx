import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
} from 'react-router-dom';
import React, { lazy } from 'react';

import RequireAuth from './RequireAuth.jsx';
import PersistLogin from './PersistLogin.jsx';
import Layout from './Layout.jsx';

// Errors
const NotFound = lazy(() => import('../views/Errors/NotFound.jsx'));
const NotAllowed = lazy(() => import('../views/Errors/NotAllowed.jsx'));

// App Views Pages
const Login = lazy(() => import('../views/Login/Login.jsx'));
const Dashboard = lazy(() => import('../views/Dashboard/Dashboard.jsx'));
const Users = lazy(() => import('../views/Users/Users.jsx'));
const Streams = lazy(() => import('../views/Streams/Streams.jsx'));
const Stream = lazy(() => import('../views/Streams/Stream.jsx'));
const Routers = lazy(() => import('../views/Routers/Routers.jsx'));
const Router = lazy(() => import('../views/Routers/Router.jsx'));

// const Router = lazy(() => import('../views/OldRouter/Router.jsx'));
// const RouterSingle = lazy(() => import('../views/OldRouter/RouterSingle.jsx'));
// const Probe = lazy(() => import('../views/OldProbe/Probe.jsx'));
// const Salvos = lazy(() => import('../views/OldSalvos/Salvos.jsx'));
// const Salvo = lazy(() => import('../views/OldSalvos/Salvo.jsx'));
// const RouterConfig = lazy(() => import('../views/OldConfig/RouterConfig.jsx'));
// const MatrixConfig = lazy(() => import('../views/OldConfig/MatrixConfig/MatrixConfig.jsx'));
// const ProbeConfig = lazy(() => import('../views/OldConfig/ProbeConfig.jsx'));

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
          <Route path="/streams/config" element={<Streams />} />
          <Route path="/streams/view/:streamSlug" element={<Stream />} />
        </Route>

        <Route element={<RequireAuth allowedRoles={['ADMIN', 'OPERATOR']} />}>
          <Route path="/routers/config" element={<Routers />} />
          <Route path="/routers/:id/control" element={<Router />} />
          {/* <Route path="/routers/:id/control/:destination" element={<RouterSingle />} /> */}
        </Route>

        <Route path="/unauthorized" element={<NotAllowed />} />
        <Route path="/*" element={<NotFound />} />
      </Route>
    </Route>,
  ),
);
