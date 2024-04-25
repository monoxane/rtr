import React, { useContext } from 'react';
import PropTypes from 'prop-types';

import {
  SideNav,
  SideNavItems,
  SideNavDivider,
} from '@carbon/react';

import {
  Router,
  DocumentExport,
  SettingsServices,
  SettingsView,
  View,
} from '@carbon/icons-react';
import configContext from '../context/configContext';

import SideNavLink from './SideNavLink.jsx';

import useWindowDimensions from '../hooks/useWindowDimensions';

function SidebarNav({ isActive }) {
  const { config } = useContext(configContext);

  const { width } = useWindowDimensions();
  return (
    <SideNav aria-label="Side navigation" isRail expanded={isActive || width > 2000}>
      <SideNavItems>
        <SideNavLink to="/router" label="Router" renderIcon={Router} />
        {config.probe?.enabled && <SideNavLink to="/probe" label="Probe" renderIcon={View} />}
        <SideNavLink to="/salvos" label="Salvos" renderIcon={DocumentExport} />
        <SideNavDivider />
        <SideNavLink to="/config/router" label="Router Config" renderIcon={SettingsServices} />
        <SideNavLink to="/config/probe" label="Probe Config" renderIcon={SettingsView} />
      </SideNavItems>
    </SideNav>
  );
}

SidebarNav.propTypes = {
  isActive: PropTypes.bool.isRequired,
};

export default SidebarNav;
