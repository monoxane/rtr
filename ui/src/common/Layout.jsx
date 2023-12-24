import React, {
  Suspense,
} from 'react';
import {
  Outlet,
} from 'react-router-dom';

import {
  gray,
} from '@carbon/colors';

import {
  Content,
  ErrorBoundary,
  Header,
  HeaderContainer,
  HeaderGlobalBar,
  OverflowMenu,
  OverflowMenuItem,
  HeaderMenuButton,
  HeaderName,
  Loading,
  SkipToContent,
} from '@carbon/react';

import {
  UserAvatar,
} from '@carbon/icons-react';

import useAuth from '../hooks/useAuth';
import useLogout from '../hooks/useLogout';

import ReactError from './ReactError.jsx';
import SidebarNav from './SidebarNav.jsx';

function Layout() {
  const { auth } = useAuth();
  const logout = useLogout();

  return (
    <HeaderContainer
      render={({ isSideNavExpanded, onClickSideNavExpand }) => (
        <>
          <Header aria-label="rtr //">
            <SkipToContent />
            <HeaderMenuButton
              aria-label="Open menu"
              onClick={onClickSideNavExpand}
              isActive={isSideNavExpanded}
            />
            <HeaderName prefix="rtr //">
              Router Controller
            </HeaderName>
            <HeaderGlobalBar>
              {auth?.user
              && (
                <OverflowMenu flipped renderIcon={UserAvatar} iconDescription="user" className="cds--header__action">
                  <OverflowMenuItem hasDivider itemText={`${auth.user} (${auth.roles})`} />
                  <OverflowMenuItem hasDivider itemText="Log out" onClick={logout} />
                </OverflowMenu>
              )}
            </HeaderGlobalBar>
            {auth?.accessToken
            && <SidebarNav onClick={onClickSideNavExpand} isActive={isSideNavExpanded} />}
          </Header>
          <Content className={`main-content ${auth?.accessToken && 'with-nav'}`} style={{ background: gray[80] }}>
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
