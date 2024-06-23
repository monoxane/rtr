import React from 'react';
import PropTypes from 'prop-types';
import { useLocation, Navigate, Outlet } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

const RequireAuth = function RequireAuth({ allowedRoles }) {
  const { auth } = useAuth();
  const location = useLocation();

  return (
    // eslint-disable-next-line no-nested-ternary
    allowedRoles?.includes(auth?.role)
      ? <Outlet />
      : auth?.user
        ? <Navigate to="/unauthorized" state={{ from: location }} replace />
        : <Navigate to="/login" state={{ from: location }} replace />
  );
};

RequireAuth.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  allowedRoles: PropTypes.array.isRequired,
};

export default RequireAuth;
