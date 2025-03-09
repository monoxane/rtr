import {
  useNavigate,
} from 'react-router-dom';
import React from 'react';

import {
  ClickableTile, Grid, Column, Loading,
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
      <Column sm={4} md={8} lg={16} style={{ textAlign: 'center' }}>
        <h1>
          {' '}
          Welcome to
          {' '}
          <strong>rtr</strong>
          , The Route Broker
        </h1>
      </Column>
      <br />
      <Column sm={4} md={8} lg={16} style={{ textAlign: 'center' }}>
        <h4>
          Routers
        </h4>
      </Column>
      <Column sm={4} md={8} lg={16}>
        <Routers />
      </Column>
      <br />
      <Column sm={4} md={8} lg={16} style={{ textAlign: 'center' }}>
        <h4>
          Streams
        </h4>
      </Column>
      <Column sm={4} md={8} lg={16}>
        <Streams />
      </Column>
    </Grid>
  );
}

function Routers() {
  const navigate = useNavigate();

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
    <Grid>
      { data.routers.map((router) => (
        <Column sm={4} md={4} lg={4}>
          <ClickableTile onClick={() => navigate(`/routers/${router.id}/control`)}>
            <h3>
              <span
                style={{ color: router.isConnected ? green[40] : red[40] }}
              >
                {router.isConnected ? <CheckmarkOutline size={20} /> : <MisuseOutline size={20} />}
              </span>
              {' '}
              {router.label}
            </h3>
          </ClickableTile>
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
    <Grid condensed style={{ paddingLeft: '1em', paddingRight: '1em' }}>
      { data.streams.map((stream) => (
        <Column sm={4} md={4} lg={8}>
          <StreamPlayer slug={stream.slug} showUMD />
        </Column>
      ))}
    </Grid>
  );
}

export default Dashboard;
