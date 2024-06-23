import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { makeUseAxios } from 'axios-hooks';
import useAuth from './useAuth';

const axiosPrivate = axios.create({
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

const getAxiosPrivate = () => {
  const { auth } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const requestIntercept = axiosPrivate.interceptors.request.use((config) => {
      if (!config.headers.Authorization) {
        // eslint-disable-next-line no-param-reassign
        config.headers.Authorization = `Bearer ${auth?.accessToken}`;
      }
      return config;
    }, (error) => Promise.reject(error));

    const responseIntercept = axiosPrivate.interceptors.response.use(
      (response) => response,
      async (error) => {
        const prevRequest = error?.config;
        if (error?.response?.status === 401 && !prevRequest?.sent) {
          localStorage.removeItem('auth');
          navigate('/login');
        }
        return Promise.reject(error);
      },
    );

    return () => {
      axiosPrivate.interceptors.request.eject(requestIntercept);
      axiosPrivate.interceptors.response.eject(responseIntercept);
    };
  }, [auth]);

  return axiosPrivate;
};

const getAxiosHook = () => makeUseAxios({
  axios: getAxiosPrivate(),
});

export default getAxiosHook;

export { getAxiosPrivate };
