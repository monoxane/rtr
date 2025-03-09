import {
  useMatch,
} from 'react-router-dom';
import React from 'react';
import PropTypes from 'prop-types';
import { HeaderMenu as CarbonHeaderMenu } from '@carbon/react';

function HeaderMenu({
  title, group, children,
}) {
  const match = useMatch({ path: group });

  if (match) {
    return (
      <CarbonHeaderMenu isActive aria-label={title} menuLinkName={title}>
        {children}
      </CarbonHeaderMenu>
    );
  }
  return (
    <CarbonHeaderMenu aria-label={title} menuLinkName={title}>
      {children}
    </CarbonHeaderMenu>
  );
}

HeaderMenu.propTypes = {
  title: PropTypes.string.isRequired,
  group: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
};

export default HeaderMenu;
