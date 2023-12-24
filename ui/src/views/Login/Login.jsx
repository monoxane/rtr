// General Imports
import React, {
  useState,
  useEffect,
} from 'react';

import {
  useNavigate,
} from 'react-router-dom';

import {
  InlineLoading,
  Grid,
  Row,
  Column,
  TextInput,
  Button,
  Stack,
  InlineNotification,
} from '@carbon/react';

import {
  ArrowRight,
} from '@carbon/icons-react';

// import axios from 'axios';

import useAuth from '../../hooks/useAuth';

const Login = function Login() {
  // const { setAuth, persist, setPersist } = useAuth();
  const { setAuth } = useAuth();
  const navigate = useNavigate();

  const [errMsg, setErrMsg] = useState('');
  const [user, setUser] = useState('ADMIN');
  const [pass, setPass] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setErrMsg('');
  }, [user, pass]);

  const handleSubmit = async () => {
    setLoading(true);

    try {
      // const response = await axios.post(
      //   '/v1/login',
      //   JSON.stringify({ username: user, password: pass }),
      //   {
      //     headers: { 'Content-Type': 'application/json' },
      //     // withCredentials: true,
      //   },
      // );
      // const accessToken = response?.data?.token;
      const accessToken = 'NO AUTH IMPLEMENTED YET'; // TODO TEMP FOR UI TESTING

      setAuth({
        user, roles: ['ADMIN'], accessToken,
      });
      setPass('');

      navigate('/');
    } catch (err) {
      if (!err?.response) {
        setErrMsg('rtr did not respond');
      } else {
        setErrMsg('Login Failed');
      }
      setLoading(false);
    }
  };

  return (
    <>
      <div />
      <Grid>
        <Column lg={4}>
          <Stack gap={4}>
            <Row>
              <h1>
                Log in to rtr
              </h1>
            </Row>
            { errMsg !== ''
            && (
            <Row>
              <InlineNotification
                title="Unable to Log in"
                subtitle={errMsg}
              />
            </Row>
            )}
            <Row>
              <TextInput
                id="username"
                type="text"
                labelText="User"
                placeholder="admin"
                disabled
                onChange={(event) => setUser(event.target.value)}
              />
            </Row>
            <Row>
              <TextInput.PasswordInput
                id="password"
                labelText="Password"
                autoComplete="true"
                onChange={(event) => setPass(event.target.value)}
              />
              <br />
              <Button
                renderIcon={loading ? InlineLoading : ArrowRight}
                onClick={() => handleSubmit()}
              >
                { loading ? 'Logging in' : 'Log in'}
              </Button>
            </Row>
          </Stack>
        </Column>
      </Grid>
    </>
  );
};

export default Login;
