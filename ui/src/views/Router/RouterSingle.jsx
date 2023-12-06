import React from 'react';
import useAxios from 'axios-hooks';
import { useParams } from 'react-router-dom';

import {
  gray,
  purple,
} from '@carbon/colors';

import {
  Button,
  Column,
  Grid,
  Loading,
} from '@carbon/react';

import useMatrix from '../../hooks/useMatrix.js';

function Router() {
  const [{ data: config, loading: configLoading, error: configError }] = useAxios(
    '/v1/config',
  );

  const {
    matrix, loading: matrixLoading, error: matrixError, route,
  } = useMatrix();

  const { destination } = useParams();

  return (
    <>
      {(matrixLoading || configLoading) && <Loading withOverlay />}
      {(matrixError || configError) && JSON.stringify({ matrixError, configError })}
      {config && matrix
      && (
        <Grid>
          <Column sm={4} md={8} lg={16} className="sources">
            <Grid condensed>
              <Column sm={4} lg={8}>
                <h1>
                  {matrix.destinations?.[destination - 1]?.label}
                </h1>
              </Column>
            </Grid>
            <br />
            <Grid
              condensed
              className="iolist"
            >
              { matrix.sources && matrix.sources.map((button) => (
                <Column sm={2} lg={2} key={button.id}>
                  <Button
                    onClick={() => { route(Number(destination), button.id); }}
                    style={{
                      minWidth: '10px',
                      padding: '10px',
                      width: '100%',
                      height: '4em',
                      display: 'table',
                      marginBottom: '1px',
                      background: button.id === matrix.destinations[destination - 1]?.source?.id ? purple[60] : gray[70],
                    }}
                  >
                    <>
                      <strong>{button.label}</strong>
                      <br />
                      {button.source?.label}
                    </>
                  </Button>
                </Column>
              ))}
            </Grid>
          </Column>
        </Grid>
      )}
    </>
  );
}

export default Router;
