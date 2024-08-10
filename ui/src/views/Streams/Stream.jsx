import { useParams } from 'react-router-dom';
import React from 'react';
import PropTypes from 'prop-types';

import {
  Loading,
  // TabList,
  // Tab,
  // Tabs,
  // TabPanels,
  // TabPanel,
  // Button,
  Tile,
  Grid,
  Column,
} from '@carbon/react';

// import {
//   Information,
// } from '@carbon/icons-react';

import { useQuery } from '@apollo/client';

import StreamPlayer from '../../components/StreamPlayer/StreamPlayer.jsx';
import GraphQLError from '../../components/Errors/GraphQLError.jsx';

import { GET_STREAM } from './queries';

function ProbeWrapper() {
  const { streamSlug } = useParams();

  const {
    loading, error, data,
  } = useQuery(GET_STREAM, { variables: { slug: streamSlug } });

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
    <Stream stream={data.stream} />
  );
}

function Stream({ stream }) {
  return (
    <Grid>
      <Column sm={4} md={8} lg={16}>
        <Tile>
          <h4>{stream.label}</h4>
          <br />
          <StreamPlayer slug={stream.slug} showUMD />
        </Tile>
      </Column>
    </Grid>
  );
}

Stream.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  stream: PropTypes.object.isRequired,
};

export default ProbeWrapper;
