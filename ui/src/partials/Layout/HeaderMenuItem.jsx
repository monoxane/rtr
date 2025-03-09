import {
  useMatch,
  useNavigate,
} from 'react-router-dom';
import React from 'react';
import PropTypes from 'prop-types';
import { HeaderMenuItem as CarbonHeaderMenuItem } from '@carbon/react';

function HeaderMenuItem({
  onClick, label, to,
}) {
  const match = useMatch({ path: to, end: true });
  const navigate = useNavigate();

  if (match) {
    return (
      <CarbonHeaderMenuItem small isActive onClick={() => { if (onClick !== undefined) { onClick(); } navigate(to); }}>
        {label}
      </CarbonHeaderMenuItem>
    );
  }
  return (
    <CarbonHeaderMenuItem onClick={() => { if (onClick !== undefined) { onClick(); } navigate(to); }}>
      {label}
    </CarbonHeaderMenuItem>
  );
}

HeaderMenuItem.propTypes = {
  onClick: PropTypes.func.isRequired,
  label: PropTypes.string.isRequired,
  to: PropTypes.string.isRequired,
};

export default HeaderMenuItem;
