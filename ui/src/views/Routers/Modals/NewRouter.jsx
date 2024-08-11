import React, { useState, useRef } from 'react';
import PropTypes from 'prop-types';

import {
  Button,
  Modal,
  TextInput,
  Stack,
} from '@carbon/react';

import {
  Add,
} from '@carbon/icons-react';

import { useMutation } from '@apollo/client';

import { CREATE_ROUTER } from '../queries.js';

import GraphQLError from '../../../components/Errors/GraphQLError.jsx';
import ModalStateManager from '../../../common/ModalStateManager.jsx';

function NewRouter({ refresh }) {
  const button = useRef();

  return (
    <ModalStateManager renderLauncher={({
      setOpen,
    }) => (
      <Button renderIcon={Add} ref={button} onClick={() => setOpen(true)}>
        New Router
      </Button>
    )}
    >
      {({
        open,
        setOpen,
      }) => (
        <NewRouterModal open={open} setOpen={setOpen} launcherButtonRef={button} refresh={refresh} />
      )}
    </ModalStateManager>
  );
}

NewRouter.propTypes = {
  refresh: PropTypes.func.isRequired,
};

function NewRouterModal({
  open, setOpen, launcherButtonRef, refresh,
}) {
  const [newRouter, setNewRouter] = useState({
    label: '', provider: 0, ipAddress: '', routerAddress: 0, level: 0, model: '',
  });

  const [error, setErr] = useState();

  const [createRouter] = useMutation(CREATE_ROUTER);

  return (
    <Modal
      launcherButtonRef={launcherButtonRef}
      modalHeading="Create a new Router"
      modalLabel="Routers"
      primaryButtonText="Create"
      secondaryButtonText="Cancel"
      open={open}
      onRequestSubmit={() => {
        setErr();
        const payload = {
          variables: {
            router: {
              label: newRouter.label, provider: newRouter.provider, ipAddress: newRouter.ipAddress, routerAddress: newRouter.routerAddress, level: newRouter.level, model: newRouter.model,
            },
          },
        };
        createRouter(payload).then(() => {
          refresh();
          setOpen(false);
        }).catch((err) => {
          setErr(err);
        });
      }}
      onRequestClose={() => {
        setOpen(false);
        setTimeout(() => {
          setNewRouter({
            label: '', provider: 0, ipAddress: '', routerAddress: 0, level: 0, model: '',
          });
        }, 250);
      }}
    >
      <Stack gap={4}>
        <TextInput
          id="label"
          type="text"
          placeholder="Core Router"
          labelText="Name"
          required
          value={newRouter.label}
          onChange={(e) => setNewRouter({ ...newRouter, label: e.target.value })}
        />
        <TextInput
          id="slug"
          type="text"
          placeholder="pgm"
          labelText="Slug"
          helperText="The Slug is used in the Stream ingest URL"
          required
          value={newRouter.slug}
          onChange={(e) => setNewRouter({ ...newRouter, slug: e.target.value })}
        />
        <GraphQLError error={error} />
      </Stack>
    </Modal>
  );
}

NewRouterModal.propTypes = {
  open: PropTypes.bool.isRequired,
  setOpen: PropTypes.func.isRequired,
  launcherButtonRef: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.shape({ current: PropTypes.instanceOf(Element) }),
  ]).isRequired,
  refresh: PropTypes.func.isRequired,
};

export default NewRouter;
