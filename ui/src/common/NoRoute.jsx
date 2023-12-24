/* eslint-disable import/extensions */
// General Imports
import React from 'react';

import {
  Grid,
  Row,
  Column,
} from '@carbon/react';

const NoRoute = function NoRoute() {
  return (
    <Grid>
      <Column lg={16}>
        <Row>
          <h1>You Took a Wrong Turn Somewhere</h1>
        </Row>
        <br />
        <Row>
          <p>404 Not Found</p>
        </Row>
      </Column>
    </Grid>
  );
};

export default NoRoute;
