import React from 'react';
import {
  useMatch,
  useNavigate,
} from 'react-router-dom';
import PropTypes from 'prop-types';
import { SideNavLink } from '@carbon/react';

function CustomSideNavLink({
  onClick, label, to, renderIcon,
}) {
  const match = useMatch({ path: to, end: true });
  const navigate = useNavigate();

  if (match) {
    return (
      <SideNavLink large aria-current="page" renderIcon={renderIcon} onClick={() => { onClick(); navigate(to); }}>
        {label}
      </SideNavLink>
    );
  }
  return (
    <SideNavLink large renderIcon={renderIcon} onClick={() => { onClick(); navigate(to); }}>
      {label}
    </SideNavLink>
  );
}

CustomSideNavLink.propTypes = {
  onClick: PropTypes.func.isRequired,
  label: PropTypes.string.isRequired,
  to: PropTypes.string.isRequired,
  renderIcon: PropTypes.node.isRequired,
};

export default CustomSideNavLink;
