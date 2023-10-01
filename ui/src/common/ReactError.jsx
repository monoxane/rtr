import React from 'react';
import {
  Grid, Row, Column, ToastNotification,
} from '@carbon/react';

function ReactError() {
  return (
    <Grid>
      <Row>
        <Column>
          <ToastNotification
            hideCloseButton
            kind="error"
            lowContrast
            notificationType="toast"
            role="alert"
            style={{
              marginBottom: '.5rem',
              minWidth: '30rem',
            }}
            caption="Please reload the page. If this continues, submit a bug report"
            timeout={0}
            title="rtr has encountered an error"
          />
        </Column>
      </Row>
    </Grid>
  );
}

export default ReactError;
