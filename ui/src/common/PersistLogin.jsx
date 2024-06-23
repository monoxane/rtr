import { Outlet, useNavigate } from 'react-router-dom';
import React, { useState, useEffect } from 'react';

import {
  InlineLoading,
} from '@carbon/react';

import useAuth from '../hooks/useAuth';

const PersistLogin = function PersistLogin() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const { auth, setAuth, persist } = useAuth();

  useEffect(() => {
    if (persist && !auth?.accessToken) {
      if (!localStorage.getItem('auth')) {
        navigate('/login');
      }
      setAuth(JSON.parse(localStorage.getItem('auth')));
    } else {
      setIsLoading(false);
    }
  }, [auth, persist, isLoading]);

  if (!persist) {
    return <Outlet />;
  }

  if (isLoading) {
    return (
      <InlineLoading />
    );
  }

  return <Outlet />;
};

export default PersistLogin;
