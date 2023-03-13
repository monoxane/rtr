import { useState, useEffect } from 'react';
import useAxios from 'axios-hooks'
import useWebSocket from 'react-use-websocket';

function useMatrix() {
  const [matrix, setMatrix] = useState([]);
  const [haveRecievedData, setHaveRecievedData] = useState(false);
  const wsuri = `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.hostname}${window.location.port ? `:${window.location.port}` : ''}/v1/ws/matrix`;

  const [{ data, loading, error }, refreshAxios] = useAxios(
    '/v1/matrix'
  )

  if (data && matrix.length === 0 && !haveRecievedData) setMatrix(data);

  useEffect(() => {
    if (!haveRecievedData) {
      refreshAxios();
    }
  }, [haveRecievedData]);

  const {
    sendJsonMessage,
    lastMessage,
  } = useWebSocket(
    wsuri,
    {
      shouldReconnect: () => true,
      reconnectAttempts: 10,
      reconnectInterval: 1000,
    },
  );

  useEffect(() => {
    if (lastMessage !== null) {
      setHaveRecievedData(true);
      const tempMatrix = {...matrix};
      const update = JSON.parse(lastMessage.data);
      console.log("received Matrix Update", update)
      switch (update.type) {
        case "destination_update":
          let found = false;
          tempMatrix.destinations.forEach((dst, i) => {
            if (update.data.id === dst.id) {
              tempMatrix.destinations[i] = update.data;
              found = true;
            }
          });
          if (!found) {
            tempMatrix.destinations.push(update.data);
          }
      }

      setMatrix(tempMatrix);
    }
  }, [lastMessage]);

  const route = (destination, source) => {
    sendJsonMessage({
      type: "route_request",
      data: {
        destination: destination,
        source: source
      }
    })
  }

  return {matrix, loading, error, route};
}

export default useMatrix;
