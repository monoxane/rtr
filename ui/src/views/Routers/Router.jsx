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
  PortInput,
  PortOutput,
  Rocket,
  CheckmarkOutline,
  MisuseOutline,
} from '@carbon/icons-react';

import {
  green,
  red,
} from '@carbon/colors';

import { useQuery, useMutation } from '@apollo/client';

import GraphQLError from '../../components/Errors/GraphQLError.jsx';

import { GET_ROUTER, ROUTER_DESTINATIONS_SUBSCRIPTION, ROUTE } from './queries';
import Source from './Components/SourceButton.jsx';
import RoutingStatusBox from './Components/RoutingStatusBox.jsx';
import Destination from './Components/DestinationButton.jsx';

function RouterWrapper() {
  const { routerId, destinationIndex } = useParams();

  const {
    loading, error, data, subscribeToMore,
  } = useQuery(GET_ROUTER, { variables: { id: routerId } });

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
      destination={destinationIndex}
      subscribeToDestinationUpdates={() => subscribeToMore({
        document: ROUTER_DESTINATIONS_SUBSCRIPTION,
        variables: { routerId },
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

function Router({ router, destination = null, subscribeToDestinationUpdates }) {
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

  useEffect(() => {
    if (destination !== null) setSelectedDestination(router.destinations[destination - 1]);
  }, [destination]);

  useEffect(() => subscribeToDestinationUpdates(), []);

  const [route] = useMutation(ROUTE);

  return (
    <Grid>
      <Column sm={4} md={8} lg={16}>
        <Tile style={destination === null ? {} : { paddingBottom: 0, minHeight: 0 }}>
          <h4>
            <span
              style={{ color: router.isConnected ? green[40] : red[40], paddingRight: '12px' }}
            >
              {router.isConnected ? <CheckmarkOutline size={20} /> : <MisuseOutline size={20} />}
            </span>
            <strong>{router.label}</strong>
            {/* If there is a solo'd destination we show its label */}
            {destination !== null && (
              <>
                :
                {' '}
                {router.destinations[destination - 1].label}
              </>
            )}
          </h4>
          <p>{router.description}</p>
        </Tile>
        {/* We only show the destination list if there is no solo'd destination */}
        { destination === null
        && (
          <Tile className="iolist">
            <Grid condensed>
              { router.destinations.map((dst) => (
                <Column sm={2} lg={2} key={dst.id}>
                  <Destination
                    destination={dst}
                    onClick={() => setSelectedDestination(dst)}
                    selected={dst.id === selectedDestination.id}
                    disabled={!router.isConnected}
                  />
                </Column>
              ))}
            </Grid>
          </Tile>
        )}
        <Tile>
          <Grid>
            <RoutingStatusBox
              renderIcon={<PortOutput size={30} />}
              label={selectedDestination?.label || 'No Destination Selected'}
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
                style={{ width: '100%', marginTop: '8px' }}
              >
                Take Route
              </Button>
            </Column>
            <RoutingStatusBox
              renderIcon={<PortInput size={30} />}
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
                  disabled={!selectedDestination.id || !router.isConnected}
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
  destination: PropTypes.number,
  subscribeToDestinationUpdates: PropTypes.func.isRequired,
};

Router.defaultProps = {
  destination: null,
};

export default RouterWrapper;
