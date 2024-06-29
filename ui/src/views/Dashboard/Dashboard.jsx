import React from 'react';

import {
  Tile, Grid, Column,
} from '@carbon/react';

function Dashboard() {
  return (
    <Grid>
      <Column sm={4} md={8} lg={16}>
        <Tile style={{ minHeight: 'calc(100vh - 48px - 64px)' }}>
          <h1>
            {' '}
            Welcome to
            {' '}
            <strong>rtr</strong>
            , the Route Broker
          </h1>
        </Tile>
      </Column>
    </Grid>
  );
}

export default Dashboard;
