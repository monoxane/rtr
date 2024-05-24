import { useState, useEffect } from 'react';
import useAxios from 'axios-hooks';
import useWebSocket from 'react-use-websocket';

function useMatrix(disableInitialRequest) {
  const [matrix, setMatrix] = useState([]);
  const [probeStats, setProbeStats] = useState([]);
  const [haveReceivedData, setHaveReceivedData] = useState(false);
  const [haveReceivedProbeData, setHaveReceivedProbeData] = useState(false);
  const wsuri = `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.hostname}${window.location.port ? `:${window.location.port}` : ''}/v1/ws/rtr`;

  const [{ data, loading, error }, refreshAxios] = useAxios(
    '/v1/matrix',
  );

  if (data && matrix.length === 0 && !haveReceivedData) setMatrix(data);

  const [{ data: probeData }, refreshProbeData] = useAxios(
    '/v1/probe/statuses',
  );

  if (probeData && matrix.length === 0 && !haveReceivedProbeData) setMatrix(data);

  useEffect(() => {
    if (!haveReceivedData && !disableInitialRequest) {
      refreshAxios();
    }
  }, [haveReceivedData]);

  useEffect(() => {
    if (!haveReceivedProbeData && !disableInitialRequest) {
      refreshProbeData();
    }
  }, [haveReceivedProbeData]);

  const {
    sendJsonMessage,
    lastMessage,
  } = useWebSocket(
    wsuri,
    {
      shouldReconnect: () => true,
      reconnectAttempts: 10,
      reconnectInterval: 1000,
      share: true,
    },
  );

  useEffect(() => {
    if (lastMessage !== null) {
      setHaveReceivedData(true);
      const tempMatrix = { ...matrix };
      const update = JSON.parse(lastMessage.data);
      let found = false;
      switch (update.type) {
        case 'destination_update':
          tempMatrix.destinations.forEach((dst, i) => {
            if (update.data.id === dst.id) {
              tempMatrix.destinations[i] = update.data;
              found = true;
            }
          });
          if (!found) {
            tempMatrix.destinations.push(update.data);
          }
          break;
        case 'source_update':
          tempMatrix.sources.forEach((dst, i) => {
            if (update.data.id === dst.id) {
              tempMatrix.sources[i] = update.data;
              found = true;
            }
          });
          if (!found) {
            tempMatrix.sources.push(update.data);
          }
          break;
        case 'probe_stats':
          setProbeStats(update.data);
          setHaveReceivedProbeData(true);
          break;
        default:
      }

      setMatrix(tempMatrix);
    }
  }, [lastMessage]);

  const route = (destination, source) => {
    sendJsonMessage({
      type: 'route_request',
      data: {
        destination,
        source,
      },
    });
  };

  return {
    matrix, probeStats, loading, error, route,
  };
}

export default useMatrix;
