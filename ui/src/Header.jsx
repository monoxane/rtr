import React from 'react';
import {
  Header,
  HeaderContainer,
  HeaderName,
  HeaderNavigation,
  HeaderMenuButton,
  HeaderMenuItem,
  SkipToContent,
} from 'carbon-components-react';

const TutorialHeader = () => (
  <HeaderContainer
    render={() => (
      <Header aria-label="Carbon Tutorial">
        <HeaderName prefix="rtr //">
           Router Controller
        </HeaderName>
      </Header>
    )}
  />
);

export default TutorialHeader;