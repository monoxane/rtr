// General Imports
import {
  useNavigate,
} from 'react-router-dom';
import React, {
  useState,
  useEffect,
} from 'react';

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

import { useMutation, gql } from '@apollo/client';

import useAuth from '../../hooks/useAuth';

const LOGIN = gql`mutation login($username:String!, $password:String!) {
  login(username:$username, password:$password) {
    token
    user {
      id
      username
      role
    }
  }
}`;

const Login = function Login() {
  const { setAuth, setPersist } = useAuth();
  const navigate = useNavigate();

  const [errors, setErrors] = useState({});
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [loading, setLoading] = useState(false);

  const [login] = useMutation(LOGIN);

  useEffect(() => {
    setErrors({});
  }, [user, pass]);

  const handleSubmit = async () => {
    setPersist(true);
    setLoading(true);

    login({ variables: { username: user, password: pass } }).then((res) => {
      setLoading(false);

      setAuth({
        user: res.data.login.user.username, role: res.data.login.user.role, accessToken: res.data.login.token,
      });

      setUser('');
      setPass('');

      navigate('/dashboard');
    }).catch((err) => {
      if (err.message === 'invalid password') {
        setErrors({ password: 'Incorrect Password' });
      } else if (err.message === 'user not found') {
        setErrors({ username: 'User not found' });
      } else {
        setErrors({ general: `Login Failed: ${err.message}` });
      }
      setLoading(false);
    });
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
