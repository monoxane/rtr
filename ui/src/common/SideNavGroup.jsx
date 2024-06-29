import {
  useMatch,
} from 'react-router-dom';
import React from 'react';
import PropTypes from 'prop-types';
import { SideNavMenu } from '@carbon/react';

function CustomSideNavMenu({
  title, group, renderIcon, children,
}) {
  const match = useMatch({ path: group });

  if (match) {
    return (
      <SideNavMenu large defaultExpanded title={title} renderIcon={renderIcon}>
        {children}
      </SideNavMenu>
    );
  }
  return (
    <SideNavMenu large title={title} renderIcon={renderIcon}>
      {children}
    </SideNavMenu>
  );
}

CustomSideNavMenu.propTypes = {
  title: PropTypes.string.isRequired,
  group: PropTypes.string.isRequired,
  renderIcon: PropTypes.node.isRequired,
  children: PropTypes.node.isRequired,
};

export default CustomSideNavMenu;
