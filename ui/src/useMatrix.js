import { useState, useEffect } from 'react';
import useAxios from 'axios-hooks'
import useWebSocket from 'react-use-websocket';

function useMatrix() {
  const [matrix, setMatrix] = useState([]);
  const [haveRecievedData, setHaveRecievedData] = useState(false);
  const wsuri = `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.hostname}${window.location.port ? `:${window.location.port}` : ''}/v1/ws`;

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
    lastMessage,
  } = useWebSocket(
    wsuri,
    {
      shouldReconnect: () => true,
      reconnectAttempts: 10,
      reconnectInterval: 1000,
      shared: true,
    },
  );

  useEffect(() => {
    if (lastMessage !== null) {
      setHaveRecievedData(true);
      const tempMatrix = {...matrix};
      const update = JSON.parse(lastMessage.data);
      let found = false;
      tempMatrix.destinations.forEach((dst, i) => {
        if (update.id === dst.id) {
          tempMatrix.destinations[i] = update;
          found = true;
        }
      });
      if (!found) {
        tempMatrix.destinations.push(update);
      }
      setMatrix(tempMatrix);
    }
  }, [lastMessage]);

  useEffect(() => {
    console.log("matrix updated", matrix)
  }, [matrix]);

  return {matrix, loading, error};
}

export default useMatrix;
