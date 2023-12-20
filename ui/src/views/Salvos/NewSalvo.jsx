import React, { useState, useRef } from 'react';
import * as ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import axios from 'axios';

import {
  Button,
  Modal,
  TextInput,
} from '@carbon/react';

import {
  Add,
} from '@carbon/icons-react';

function ModalStateManager({
  renderLauncher: LauncherContent,
  children: ModalContent,
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      {!ModalContent || typeof document === 'undefined' ? null : ReactDOM.createPortal(<ModalContent open={open} setOpen={setOpen} />, document.body)}
      {LauncherContent && <LauncherContent open={open} setOpen={setOpen} />}
    </>
  );
}

ModalStateManager.propTypes = {
  renderLauncher: PropTypes.node.isRequired,
  children: PropTypes.node.isRequired,
};

function NewSalvo({ refresh }) {
  const button = useRef();
  const [newSalvo, setNewSalvo] = useState({ destinations: [] });

  return (
    <ModalStateManager renderLauncher={({
      setOpen,
    }) => (
      <Button renderIcon={Add} ref={button} onClick={() => setOpen(true)}>
        New Salvo
      </Button>
    )}
    >
      {({
        open,
        setOpen,
      }) => (
        <Modal
          launcherButtonRef={button}
          modalHeading="Create a Salvo"
          modalLabel="Salvos"
          primaryButtonText="Create"
          secondaryButtonText="Cancel"
          open={open}
          onRequestSubmit={() => {
            axios.post('/v1/salvos', newSalvo)
              .then(() => {
                refresh();
              });
          }}
          onRequestClose={() => setOpen(false)}
        >
          <TextInput
            data-modal-primary-focus
            id="salvo-name"
            labelText="Salvo Name"
            placeholder="e.g. PCR Monitors"
            onChange={(event) => setNewSalvo({ ...newSalvo, label: event.target.value })}
            value={newSalvo.label}
          />
        </Modal>
      )}
    </ModalStateManager>
  );
}

NewSalvo.propTypes = {
  refresh: PropTypes.func.isRequired,
};

export default NewSalvo;
