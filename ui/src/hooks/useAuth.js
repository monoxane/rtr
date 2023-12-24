import { useContext, useDebugValue } from 'react';
import AuthContext from '../context/AuthProvider';

const useAuth = () => {
  const { auth } = useContext(AuthContext);
  useDebugValue(auth, (authState) => (authState?.user ? 'Logged In' : 'Logged Out'));
  return useContext(AuthContext);
};

export default useAuth;
