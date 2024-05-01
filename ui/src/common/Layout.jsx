import React, {
  Suspense,
  useContext,
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
import configContext from '../context/configContext';

import ReactError from './ReactError.jsx';
import SidebarNav from './SidebarNav.jsx';

function Layout() {
  const { config } = useContext(configContext);
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
              {config?.router?.label || 'Router Controller'}
            </HeaderName>
            <HeaderGlobalBar />
            <SidebarNav onClickSideNavExpand={onClickSideNavExpand} isActive={isSideNavExpanded} />
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
