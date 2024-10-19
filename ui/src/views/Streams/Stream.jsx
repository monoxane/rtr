import { useParams } from 'react-router-dom';
import React, { useEffect } from 'react';
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

import { useQuery, useMutation } from '@apollo/client';

import {
  GET_ROUTER, ROUTER_DESTINATIONS_SUBSCRIPTION, ROUTE,
} from '../Routers/queries';
import Source from '../Routers/Components/SourceButton.jsx';
import StreamPlayer from '../../components/StreamPlayer/StreamPlayer.jsx';
import GraphQLError from '../../components/Errors/GraphQLError.jsx';

import {
  GET_STREAM,
} from './queries';

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
        {stream.isRoutable && <StreamRouting stream={stream} />}
      </Column>
    </Grid>
  );
}

function StreamRouting({ stream }) {
  const [route] = useMutation(ROUTE);

  const {
    loading, error, data, subscribeToMore,
  } = useQuery(GET_ROUTER, { variables: { id: stream.destination.router.id } });

  useEffect(() => {
    subscribeToMore({
      document: ROUTER_DESTINATIONS_SUBSCRIPTION,
      variables: { routerId: stream.destination.router.id },
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) return prev;
        const updatedDestination = subscriptionData.data.destinationUpdate;
        const destinations = [...prev.router.destinations];
        destinations.splice(updatedDestination.index - 1, 1, updatedDestination);
        return { ...prev, router: { ...prev.router, destinations } };
      },
    });
  }, []);

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
    <Tile className="iolist">
      <Grid condensed>
        { data.router.sources.map((src) => (
          <Column sm={2} lg={2} key={src.id}>
            <Source
              source={src}
              routed={src.id === data.router.destinations[stream.destination.index]}
              selected={src.id === stream.destination.routedSource?.id}
              onClick={() => route({ variables: { routerId: data.router.id, destination: stream.destination.index, source: src.index } })}
              disabled={!data.router.isConnected}
            />
          </Column>
        ))}
      </Grid>
    </Tile>
  );
}

Stream.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  stream: PropTypes.object.isRequired,
};

StreamRouting.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  stream: PropTypes.object.isRequired,
};

export default ProbeWrapper;
