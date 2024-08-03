import {
  Outlet,
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
  HeaderMenuButton,
  HeaderName,
  Loading,
  SkipToContent,
  OverflowMenu,
  OverflowMenuItem,
} from '@carbon/react';

import {
  User,
} from '@carbon/icons-react';
import {
  gray,
} from '@carbon/colors';

import useLogout from '../hooks/useLogout';
import useAuth from '../hooks/useAuth';

import ComposedSideNav from './SideNav.jsx';
import ReactError from './ReactError.jsx';

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
              aria-label="Open Menu"
              onClick={onClickSideNavExpand}
              isActive={isSideNavExpanded}
            />
            <HeaderName prefix="rtr //">
              Route Broker
            </HeaderName>
            {auth && auth.user
            && (
              <HeaderGlobalBar>
                  {/* <ExpandableSearch size="lg" labelText="Search" closeButtonLabelText="Clear search input" id="search-expandable-1" onChange={() => {}} onKeyDown={() => {}} /> */}
                <OverflowMenu flipped renderIcon={User} className="cds--header__action" sx={{ zIndex: 8001 }}>
                  <OverflowMenuItem className="header-user-menu" itemText={auth.user} disabled sx={{ color: 'white' }} />
                  <OverflowMenuItem className="header-user-menu" itemText="Log out" onClick={logout} />
                </OverflowMenu>
              </HeaderGlobalBar>
            )}
          </Header>
          {auth && auth.user
            && <ComposedSideNav onClickSideNavExpand={onClickSideNavExpand} isActive={isSideNavExpanded} isRail={false} /> }
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
