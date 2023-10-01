import React, { useState } from 'react';
import useAxios from 'axios-hooks';

import {
  Button,
  ButtonSet,
  Row,
  Loading,
} from '@carbon/react';

import {
  ChooseItem,
} from '@carbon/icons-react';

import {
  blue,
  gray,
} from '@carbon/colors';

import useMatrix from '../../hooks/useMatrix.js';
import JSmpegPlayer from '../../common/JSmpegPlayer.jsx';

function Probe() {
  const [{ data: config, loading: configLoading, error: configError }] = useAxios(
    '/v1/config',
  );

  const {
    matrix, probeStats, loading: matrixLoading, error: matrixError,
  } = useMatrix();
  const [selectedProbe, setSelectedProbe] = useState(0);

  return (
    <>
      {(matrixLoading || configLoading) && <Loading withOverlay />}
      {(matrixError || configError) && JSON.stringify({ matrixError, configError })}
      <ButtonSet>
        { config && config.probe.router_destinations.map((dst, index) => (
          <Button
            key={`probe-${dst}`}
            onClick={() => {
              setSelectedProbe(index);
            }}
            renderIcon={ChooseItem}
            style={{
              minWidth: '10px',
              display: 'table',
              marginBottom: '1px',
              width: '100%',
              maxWidth: '20em',
              background: selectedProbe === index ? blue[60] : gray[70],
            }}
          >
            Probe
            {' '}
            {index + 1}
            {' '}
            (
            {matrix.destinations?.[dst - 1]?.label}
            )
          </Button>
        ))}
      </ButtonSet>
      <br />
      <Row>
        <strong>
          Status:
        </strong>
        {' '}
        {probeStats[selectedProbe]?.active_source ? `Streaming, ${probeStats[selectedProbe]?.clients} viewer${probeStats[selectedProbe]?.clients === 1 ? '' : 's'}` : 'No Transport Stream'}
        <br />
        <br />
        <JSmpegPlayer url={`ws://${document.location.hostname}:${document.location.port}/v1/ws/probe/${selectedProbe}`} active={probeStats[selectedProbe]?.active_source} />
        <br />
        <strong>
          Probe
          {' '}
          Source:
        </strong>
        {' '}
        {matrix.destinations?.[config.probe.router_destinations[selectedProbe] - 1]?.source?.label}
      </Row>
    </>
  );
}

export default Probe;
