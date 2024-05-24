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

function SidebarNav({ onClickSideNavExpand, isActive, isRail }) {
  const { config } = useContext(configContext);

  return (
    <SideNav aria-label="Side navigation" isRail={isRail} expanded={isActive} onOverlayClick={onClickSideNavExpand}>
      <SideNavItems>
        <SideNavLink to="/router" label="Router" renderIcon={Router} onClick={onClickSideNavExpand} />
        {config.probe?.enabled && <SideNavLink to="/probe" label="Probe" renderIcon={View} onClick={onClickSideNavExpand} />}
        <SideNavLink to="/salvos" label="Salvos" renderIcon={DocumentExport} onClick={onClickSideNavExpand} />
        <SideNavDivider />
        <SideNavLink to="/config/router" label="Router Config" renderIcon={SettingsServices} onClick={onClickSideNavExpand} />
        <SideNavLink to="/config/probe" label="Probe Config" renderIcon={SettingsView} onClick={onClickSideNavExpand} />
      </SideNavItems>
    </SideNav>
  );
}

SidebarNav.propTypes = {
  onClickSideNavExpand: PropTypes.func.isRequired,
  isActive: PropTypes.bool.isRequired,
  isRail: PropTypes.bool.isRequired,
};

export default SidebarNav;
