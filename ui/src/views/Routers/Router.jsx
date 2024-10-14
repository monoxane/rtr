import { useParams } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

import {
  Loading,
  Tile,
  Grid,
  Column,
  Button,
} from '@carbon/react';

import {
  ArrowUp,
  ArrowDown,
  Rocket,
} from '@carbon/icons-react';

import { useQuery, useMutation } from '@apollo/client';

import GraphQLError from '../../components/Errors/GraphQLError.jsx';

import { GET_ROUTER, ROUTER_DESTINATIONS_SUBSCRIPTION, ROUTE } from './queries';
import Source from './Components/SourceButton.jsx';
import RoutingStatusBox from './Components/RoutingStatusBox.jsx';
import Destination from './Components/DestinationButton.jsx';

function RouterWrapper() {
  const { id } = useParams();

  const {
    loading, error, data, subscribeToMore,
  } = useQuery(GET_ROUTER, { variables: { id } });

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
    <Router
      router={data.router}
      subscribeToDestinationUpdates={() => subscribeToMore({
        document: ROUTER_DESTINATIONS_SUBSCRIPTION,
        variables: { routerId: id },
        updateQuery: (prev, { subscriptionData }) => {
          if (!subscriptionData.data) return prev;
          const updatedDestination = subscriptionData.data.destinationUpdate;
          const destinations = [...prev.router.destinations];
          destinations.splice(updatedDestination.index - 1, 1, updatedDestination);
          return { ...prev, router: { ...prev.router, destinations } };
        },
      })}
    />
  );
}

function Router({ router, subscribeToDestinationUpdates }) {
  const [selectedDestination, setSelectedDestination] = useState({});
  const [selectedSource, setSelectedSource] = useState({});

  useEffect(() => {
    if (selectedDestination?.routedSource?.id) {
      const srcElement = document.getElementById(`source-${selectedDestination.routedSource.id}`);
      srcElement.scrollIntoView();
    }
  }, [selectedDestination]);

  useEffect(() => {
    if (selectedDestination.id) {
      setSelectedDestination(router.destinations[selectedDestination.index - 1]);
    }
  }, [router]);

  useEffect(() => subscribeToDestinationUpdates(), []);

  const [route] = useMutation(ROUTE);

  return (
    <Grid>
      <Column sm={4} md={8} lg={16}>
        <Tile>
          <h4>
            <strong>{router.label}</strong>
            {' '}
            <em>
              (
              {router.provider.label}
              {' '}
              on
              {' '}
              {router.ipAddress}
              )
            </em>
          </h4>
          <p>{router.description}</p>
        </Tile>
        <Tile className="iolist">
          <Grid condensed>
            { router.destinations.map((dst) => (
              <Column sm={2} lg={2} key={dst.id}>
                <Destination
                  destination={dst}
                  onClick={() => setSelectedDestination(dst)}
                  selected={dst.id === selectedDestination.id}
                />
              </Column>
            ))}
          </Grid>
        </Tile>
        <Tile>
          <Grid>
            <RoutingStatusBox
              renderIcon={<ArrowUp size={30} />}
              label={selectedDestination?.label || 'No Source Selected'}
              description={selectedDestination?.description}
              number={selectedDestination?.index}
            />
            <Column sm={2} md={4} lg={4}>
              <Button
                renderIcon={Rocket}
                kind="danger"
                disabled={!selectedSource?.id || selectedDestination?.routedSource?.id === selectedSource?.id}
                iconDescription="Take Source to Destination"
                onClick={() => {
                  route({ variables: { routerId: router.id, destination: selectedDestination.index, source: selectedSource.index } });
                }}
                style={{ width: '100%' }}
                size="xl"
              >
                Take Route
              </Button>
            </Column>
            <RoutingStatusBox
              renderIcon={<ArrowDown size={30} />}
              label={selectedSource?.label || selectedDestination?.routedSource?.label || 'No Source Selected'}
              description={selectedSource?.description || selectedDestination?.routedSource?.description}
              number={selectedSource?.index || selectedDestination?.routedSource?.index}
            />
          </Grid>
        </Tile>
        <Tile className="iolist">
          <Grid condensed>
            { router.sources.map((src) => (
              <Column sm={2} lg={2} key={src.id}>
                <Source
                  source={src}
                  routed={src.id === selectedDestination?.routedSource?.id}
                  selected={src.id === selectedSource?.id}
                  onClick={() => setSelectedSource(src)}
                />
              </Column>
            ))}
          </Grid>
        </Tile>
      </Column>
    </Grid>
  );
}

Router.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  router: PropTypes.object.isRequired,
  subscribeToDestinationUpdates: PropTypes.func.isRequired,
};

export default RouterWrapper;
