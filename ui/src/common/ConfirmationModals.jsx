import React, { useState } from 'react';
import PropTypes from 'prop-types';

import {
  Modal,
} from '@carbon/react';

function DeletionModal({
  onDelete, resourceType, resourceName, kind, warningMessage, launcher: Launcher, closeMenu,
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Launcher closeMenu={closeMenu} onClick={() => setOpen(true)} />
      <Modal
        open={open}
        onRequestClose={() => {
          setOpen(false);
        }}
        onRequestSubmit={() => {
          onDelete();
          setOpen(false);
        }}
        danger
        modalHeading={(
          <>
            Are you sure you want to delete
            {' '}
            {resourceName}
            ?
          </>
          )}
        modalLabel={resourceType}
        primaryButtonText="Delete"
        secondaryButtonText="Cancel"
      >
        {warningMessage}
      </Modal>
    </>
  );
}

// eslint-disable-next-line import/prefer-default-export
export { DeletionModal };
