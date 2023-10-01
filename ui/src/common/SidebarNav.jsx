import React from 'react';
import PropTypes from 'prop-types';

import {
  SideNav,
  SideNavItems,
  SideNavDivider,
} from '@carbon/react';

import {
  Router,
  Package,
  Settings,
  View,
} from '@carbon/icons-react';

import SideNavLink from './SideNavLink.jsx';

function SidebarNav({ isActive }) {
  return (
    <SideNav aria-label="Side navigation" isRail expanded={isActive}>
      <SideNavItems>
        <SideNavLink to="/router" label="Router" renderIcon={Router} />
        <SideNavLink to="/probe" label="Probe" renderIcon={View} />
        <SideNavLink to="/salvos" label="Salvos" renderIcon={Package} />
        <SideNavDivider />
        <SideNavLink to="/config" label="Configuration" renderIcon={Settings} />
      </SideNavItems>
    </SideNav>
  );
}

SidebarNav.propTypes = {
  isActive: PropTypes.bool.isRequired,
};

export default SidebarNav;
