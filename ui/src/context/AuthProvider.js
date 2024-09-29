/* eslint-disable react/jsx-filename-extension */
import React, {
  createContext,
  useEffect,
  useState,
} from 'react';
import PropTypes from 'prop-types';

const AuthContext = createContext({});

export const AuthProvider = function AuthProvider({ children }) {
  const [auth, setAuth] = useState({});
  const [persist, setPersist] = useState(true);

  useEffect(() => {
    if (auth?.accessToken) {
      localStorage.setItem('auth', JSON.stringify(auth));
    }
  }, [auth]);

  return (
  // eslint-disable-next-line react/jsx-no-constructed-context-values
    <AuthContext.Provider value={{
      auth, setAuth, persist, setPersist,
    }}
    >
      {children}
    </AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default AuthContext;
