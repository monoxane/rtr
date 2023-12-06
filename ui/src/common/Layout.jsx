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
  HeaderMenuButton,
  HeaderName,
  Loading,
  SkipToContent,
} from '@carbon/react';

import ReactError from './ReactError.jsx';
import SidebarNav from './SidebarNav.jsx';

function Layout() {
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
            <HeaderGlobalBar />
            <SidebarNav onClick={onClickSideNavExpand} isActive={isSideNavExpanded} />
          </Header>
          <Content className="main-content" style={{ background: gray[80] }}>
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
