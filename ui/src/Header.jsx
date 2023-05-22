import React from 'react';
import {
  Header,
  HeaderContainer,
  HeaderName,
} from 'carbon-components-react';

function TutorialHeader() {
  return (
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
}

export default TutorialHeader;
