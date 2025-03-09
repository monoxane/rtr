import {
  Outlet,

  useNavigate,
} from 'react-router-dom';
import React, {
  Suspense,
} from 'react';

import {
  Content,
  ErrorBoundary,
  Header,
  HeaderContainer,
  HeaderGlobalBar,
  HeaderName,
  Loading,
  OverflowMenu,
  OverflowMenuItem,
  HeaderNavigation,
} from '@carbon/react';

import {
  User,
} from '@carbon/icons-react';
import {
  gray,
} from '@carbon/colors';

import StreamsNavList from '../../views/Streams/Menus/StreamsNavList.jsx';
import RoutersNavList from '../../views/Routers/Menus/RoutersNavList.jsx';
import useLogout from '../../hooks/useLogout.js';
import useAuth from '../../hooks/useAuth.js';

import ReactError from '../../components/Errors/ReactError.jsx';
import HeaderMenuItem from './HeaderMenuItem.jsx';
import HeaderMenu from './HeaderMenu.jsx';

function Layout() {
  const { auth } = useAuth();
  const logout = useLogout();
  const navigate = useNavigate();

  return (
    <HeaderContainer
      render={() => (
        <>
          <Header aria-label="The Route Broker">
            <HeaderName prefix="rtr" href="/dashboard" onClick={() => { navigate('/dashboard'); }}>
              The Route Broker
            </HeaderName>
            {auth && auth.user
            && (
              <>
                <HeaderNavigation>
                  <HeaderMenuItem to="/dashboard" label="Dashboard" />
                  <HeaderMenu group="/routers/*" title="Routing">
                    <HeaderMenuItem to="/routers/config" label="Routers" />
                    <RoutersNavList />
                  </HeaderMenu>
                  <HeaderMenu group="/streams/*" title="Streams">
                    <HeaderMenuItem to="/streams/config" label="Streams" />
                    <StreamsNavList />
                  </HeaderMenu>

                  {auth.role === 'ADMIN' && (
                    <HeaderMenu group="/admin/*" title="Admin">
                      <HeaderMenuItem to="/admin/users" label="Users" />
                    </HeaderMenu>
                  )}
                </HeaderNavigation>
                <HeaderGlobalBar>
                  <OverflowMenu flipped renderIcon={User} className="cds--header__action" sx={{ zIndex: 8001 }}>
                    <OverflowMenuItem itemText={auth.user} disabled sx={{ color: 'white' }} />
                    <OverflowMenuItem itemText="Log out" onClick={logout} />
                  </OverflowMenu>
                </HeaderGlobalBar>
              </>
            )}
          </Header>
          <Content className={`main-content ${!auth?.user && 'unauthenticated'}`} style={{ background: gray[80] }}>
            <Suspense fallback={<Loading />}>
              <ErrorBoundary fallback={<ReactError />}>
                <Outlet />
              </ErrorBoundary>
            </Suspense>
          </Content>
        </>
      )}
    />
  );
}

export default Layout;
