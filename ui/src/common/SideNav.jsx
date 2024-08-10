import React from 'react';
import PropTypes from 'prop-types';

import {
  SideNav,
  SideNavItems,
} from '@carbon/react';

import {
  Home,
  View,
  User,
} from '@carbon/icons-react';

import SideNavStreamsList from '../views/Streams/Menus/SideNavStreamsList.jsx';
import useAuth from '../hooks/useAuth.js';
import SideNavLink from './SideNavLink.jsx';
import SideNavGroup from './SideNavGroup.jsx';

function ComposedSideNav({ onClickSideNavExpand, isActive, isRail }) {
  const { auth } = useAuth();

  return (
    <SideNav aria-label="Side navigation" isRail={isRail} expanded={isActive} onOverlayClick={onClickSideNavExpand}>
      <SideNavItems>
        <SideNavLink renderIcon={Home} to="/dashboard" label="Home" onClick={onClickSideNavExpand} />

        <SideNavGroup group="/streams/*" renderIcon={View} large title="Streams">
          {auth?.role === 'ADMIN' && (
            <SideNavLink to="/streams/config" label="Config" onClick={onClickSideNavExpand} />
          )}
          <SideNavStreamsList onClickSideNavExpand={onClickSideNavExpand} />
        </SideNavGroup>

        {auth?.role === 'ADMIN' && (
          <SideNavLink renderIcon={User} to="/users" label="Users" onClick={onClickSideNavExpand} />
        )}

        {/* <SideNavLink to="/router" label="Router" renderIcon={Router} onClick={onClickSideNavExpand} />
        {config.probe?.enabled && <SideNavLink to="/probe" label="Probe" renderIcon={View} onClick={onClickSideNavExpand} />}
        <SideNavLink to="/salvos" label="Salvos" renderIcon={DocumentExport} onClick={onClickSideNavExpand} />
        <SideNavDivider />
        <SideNavLink to="/config/router" label="Router Config" renderIcon={SettingsServices} onClick={onClickSideNavExpand} />
        <SideNavLink to="/config/matrix" label="Matrix Config" renderIcon={TagEdit} onClick={onClickSideNavExpand} />
        <SideNavLink to="/config/probe" label="Probe Config" renderIcon={SettingsView} onClick={onClickSideNavExpand} /> */}
      </SideNavItems>
    </SideNav>
  );
}

ComposedSideNav.propTypes = {
  onClickSideNavExpand: PropTypes.func.isRequired,
  isActive: PropTypes.bool.isRequired,
  isRail: PropTypes.bool.isRequired,
};

export default ComposedSideNav;
