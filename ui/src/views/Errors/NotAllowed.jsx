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

import { UnauthorizedUserAccess } from '@carbon/pictograms-react';
import {
  Home,
} from '@carbon/icons-react';

const NotAllowed = function NotAllowed() {
  const navigate = useNavigate();

  return (
    <Grid>
      <Column sm={4} md={8} lg={8}>
        <Stack gap={4}>
          <UnauthorizedUserAccess />
          <h1>
            You can&apos;t access this.
          </h1>
          <p>
            The page you are looking for requires permissions that you do not have.
          </p>
          <Button
            kind="primary"
            renderIcon={Home}
            tabIndex={0}
            size="lg"
            onClick={() => navigate('/dashboard')}
          >
            Dashboard
          </Button>
        </Stack>
      </Column>
    </Grid>
  );
};

export default NotAllowed;
