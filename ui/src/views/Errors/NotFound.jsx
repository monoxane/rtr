import {
  useNavigate,
} from 'react-router-dom';
import React from 'react';

import {
  Stack,
  Button,
  Grid,
  Column,
} from '@carbon/react';

import { Location } from '@carbon/pictograms-react';
import {
  Home,
} from '@carbon/icons-react';

const NotFound = function NotFound() {
  const navigate = useNavigate();

  return (
    <Grid>
      <Column sm={4} md={8} lg={8}>
        <Stack gap={4}>
          <Location />
          <h1>
            This Cable is not Connected.
          </h1>
          <p>
            The page you are looking for could not be found.
          </p>
          <Button
            kind="primary"
            renderIcon={Home}
            tabIndex={0}
            size="lg"
              // type="submit"
            onClick={() => navigate('/dashboard')}
          >
            Dashboard
          </Button>
        </Stack>
      </Column>
    </Grid>
  );
};

export default NotFound;
