import React from 'react';

import {
  Tile, Grid, Column, Loading,
} from '@carbon/react';

import { useQuery } from '@apollo/client';
import { LIST_STREAMS } from '../Streams/queries';

import StreamPlayer from '../../components/StreamPlayer/StreamPlayer.jsx';
import GraphQLError from '../../components/Errors/GraphQLError.jsx';

function Dashboard() {
  return (
    <Grid>
      <Column sm={4} md={8} lg={16}>
        <Tile>
          {/* <Tile style={{ minHeight: 'calc(100vh - 48px - 64px)' }}> */}
          <h1>
            {' '}
            Welcome to
            {' '}
            <strong>rtr</strong>
            , the Route Broker
          </h1>
        </Tile>
      </Column>
      <Column sm={4} md={8} lg={16}>
        <Tile style={{ paddingLeft: '2.5em', paddingRight: '2.5em', paddingTop: '0' }}>
          <Streams />
        </Tile>
      </Column>
    </Grid>
  );
}

function Streams() {
  const {
    loading, error, data,
  } = useQuery(LIST_STREAMS);

  if (error) {
    return (
      <GraphQLError error={error} />
    );
  }

  if (!data && loading) {
    return (
      <Loading withOverlay />
    );
  }

  return (
    <Grid condensed>
      { data.streams.map((stream) => (
        <Column sm={4} md={8} lg={8}>
          <StreamPlayer slug={stream.slug} showUMD />
        </Column>
      ))}
    </Grid>
  );
}

export default Dashboard;
