// General Imports
import React, {
  useState,
  useEffect,
} from 'react';

import {
  useNavigate,
} from 'react-router-dom';

import {
  Stack,
  InlineLoading,
  Form,
  TextInput,
  Button,
  InlineNotification,
  Grid,
  Column,
} from '@carbon/react';

import {
  ArrowRight,
} from '@carbon/icons-react';

import axios from 'axios';

import useAuth from '../../hooks/useAuth';

const Login = function Login() {
  const { setAuth, setPersist } = useAuth();
  const navigate = useNavigate();

  const [errors, setErrors] = useState({});
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setErrors({});
  }, [user, pass]);

  const handleSubmit = async () => {
    setPersist(true);
    setLoading(true);

    try {
      const response = await axios.post(
        '/v1/api/login',
        JSON.stringify({ username: user, password: pass }),
        {
          headers: { 'Content-Type': 'application/json' },
          // withCredentials: true,
        },
      );
      const accessToken = response?.data?.token;

      setAuth({
        user, role: response?.data?.role, accessToken,
      });
      setUser('');
      setPass('');

      navigate('/dashboard');
    } catch (err) {
      if (!err?.response) {
        setErrors({ general: 'Could not connect to rtr' });
      } else if (err.response?.status === 400) {
        setErrors({ general: 'Missing Username or Password' });
      } else if (err.response?.status === 401) {
        if (err.response.data.sta === 404) {
          setErrors({ username: err.response.data.msg });
        }

        if (err.response.data.sta === 401) {
          setErrors({ password: err.response.data.msg });
        }
      } else if (err.response?.status === 500) {
        setErrors({ general: err.response.data.msg });
      } else {
        setErrors({ general: 'Login Failed' });
      }
      setLoading(false);
    }
  };

  return (
    <Grid>
      <Column sm={4} md={8} lg={8}>
        <Form>
          <Stack gap={4}>
            <h1>
              Log in to
              {' '}
              <strong>rtr</strong>
            </h1>
            <br />
            {errors.general && (
            <InlineNotification
              lowContrast={false}
              subtitle={errors.general}
            />
            )}
            <TextInput
              id="username"
              // light
              type="text"
              placeholder="user@route.broker"
              labelText="Username"
              required
              invalid={errors.username}
              invalidText={errors.username}
              onChange={(e) => setUser(e.target.value)}
            />
            <TextInput
              id="password"
              // light
              type="password"
              required
              invalid={errors.password}
              invalidText={errors.password}
              placeholder="Enter your password"
              labelText="Password"
              onChange={(e) => setPass(e.target.value)}
            />
            <br />
            <Button
              kind="primary"
              renderIcon={loading ? InlineLoading : ArrowRight}
              tabIndex={0}
              size="lg"
              // type="submit"
              onClick={handleSubmit}
            >
              Continue
            </Button>
          </Stack>
        </Form>
      </Column>
    </Grid>
  );
};

export default Login;
