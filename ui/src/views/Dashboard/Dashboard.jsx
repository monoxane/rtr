import React from 'react';

import {
  Tile, Grid, Column, Loading, Layer,
} from '@carbon/react';

import {
  CheckmarkOutline,
  MisuseOutline,
} from '@carbon/icons-react';

import {
  green,
  red,
} from '@carbon/colors';

import { useQuery } from '@apollo/client';
import { LIST_STREAMS } from '../Streams/queries';
import { LIST_ROUTERS } from '../Routers/queries';

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
      <br />
      <Column sm={4} md={8} lg={16}>
        <Tile style={{ paddingLeft: '2.5em', paddingRight: '2.5em' }}>
          <Routers />
        </Tile>
      </Column>
      <br />
      <Column sm={4} md={8} lg={16}>
        <Tile style={{ paddingLeft: '2.5em', paddingRight: '2.5em' }}>
          <Streams />
        </Tile>
      </Column>
    </Grid>
  );
}

function Routers() {
  const {
    loading, error, data,
  } = useQuery(LIST_ROUTERS);

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

  if (data.routers.length === 0) {
    return null;
  }

  return (
    <Grid condensed>
      { data.routers.map((router) => (
        <Column sm={4} md={4} lg={4}>
          <Layer>
            <h3>
              <span
                style={{ color: router.isConnected ? green[40] : red[40] }}
              >
                {router.isConnected ? <CheckmarkOutline size={20} /> : <MisuseOutline size={20} />}
              </span>
              {' '}
              {router.label}
            </h3>
          </Layer>
        </Column>
      ))}
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

  if (data.streams.length === 0) {
    return <h4><em>There are no Streams to display</em></h4>;
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
