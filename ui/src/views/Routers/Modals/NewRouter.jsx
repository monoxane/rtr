import React, { useState, useRef } from 'react';
import PropTypes from 'prop-types';

import {
  Button,
  TextInput,
  Stack,
  Dropdown,
  DropdownSkeleton,
  ComposedModal,
  ModalHeader,
  ModalFooter,
  ModalBody,
} from '@carbon/react';

import {
  Add,
} from '@carbon/icons-react';

import { useQuery, useMutation } from '@apollo/client';

import { LIST_PROVIDERS, CREATE_ROUTER } from '../queries.js';

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
  const {
    loading, error: providerError, data,
  } = useQuery(LIST_PROVIDERS);

  const [newRouter, setNewRouter] = useState({
    label: '', provider: 0, ipAddress: '', routerAddress: 0, level: 0, model: '',
  });

  const [error, setErr] = useState();
  const [step, setStep] = useState(0);

  const [createRouter] = useMutation(CREATE_ROUTER);

  return (
    <ComposedModal
      open={open}
      launcherButtonRef={launcherButtonRef}
      onClose={() => {
        setOpen(false);
        setTimeout(() => {
          setNewRouter({
            label: '', provider: 0, ipAddress: '', routerAddress: 0, level: 0, model: '',
          });
        }, 250);
      }}
    >
      <ModalHeader
        label="Routers"
        title={(
          <>
            Create a new Router&nbsp;
            {step > 0 && (
            <em>
              (
              {newRouter.provider.label}
              {' '}
              /
              {' '}
              {newRouter.model.label}
              )
            </em>
            )}
          </>
        )}
      />
      <ModalBody>
        {step === 0
        && (
        <Stack gap={4}>
          {loading && !data && (
          <>
            <DropdownSkeleton />
            <DropdownSkeleton />
          </>
          )}
          {data && (
          <>
            <Dropdown
              id="provider"
              titleText="Router Provider"
              label="Select a Provider"
              helperText={newRouter.provider.helperText}
              items={data.routerProviders}
              selectedItem={newRouter.provider}
              onChange={(e) => setNewRouter({ ...newRouter, provider: e.selectedItem })}
            />
            <Dropdown
              id="model"
              titleText="Router Model"
              label="Select a Model"
              disabled={!newRouter.provider}
              helperText={newRouter.model?.helperText}
              items={newRouter.provider?.models || []}
              selectedItem={newRouter.model}
              onChange={(e) => setNewRouter({ ...newRouter, model: e.selectedItem })}
            />
          </>
          )}
          {providerError && (
          <Dropdown
            id="provider"
            titleText="Router Provider"
            label="Unable to load Providers"
            disabled
          />
          )}
        </Stack>
        )}
        {step === 1
        && (
        <Stack gap={4}>
          <TextInput
            id="label"
            type="text"
            placeholder="Venue Router"
            labelText="Label"
            required
            value={newRouter.label}
            onChange={(e) => setNewRouter({ ...newRouter, label: e.target.value })}
          />
          <TextInput
            id="ip"
            type="text"
            placeholder="IP Address"
            labelText="IP Address"
            required
            value={newRouter.ipAddress}
            onChange={(e) => setNewRouter({ ...newRouter, ipAddress: e.target.value })}
          />
          {/* {newRouter.provider.additionalConfiguration?.map((ac) => {
            if (ac === 'routerAddress') {
              return ( */}
          <TextInput
            // key={ac}
            id="routerAddress"
            type="text"
            placeholder="1"
            labelText="Router Address"
            required
            value={newRouter.routerAddress}
            onChange={(e) => setNewRouter({ ...newRouter, routerAddress: e.target.value })}
          />
          {/* );
            }
            return null;
          })} */}
        </Stack>
        )}
        <GraphQLError error={error || providerError} />
      </ModalBody>
      <ModalFooter
        primaryButtonText={step === 1 ? 'Create' : 'Next'}
        primaryButtonDisabled={!newRouter.provider || !newRouter.model}
        secondaryButtonText="Cancel"
        onRequestSubmit={() => {
          if (step === 1) {
            setErr();
            const payload = {
              variables: {
                router: {
                  label: newRouter.label, providerId: newRouter.provider.id, ipAddress: newRouter.ipAddress, routerAddress: newRouter.routerAddress, level: newRouter.level, modelId: newRouter.model.id,
                },
              },
            };
            createRouter(payload).then(() => {
              refresh();
              setOpen(false);
            }).catch((err) => {
              setErr(err);
            });
          }

          setStep(step + 1);
        }}
        onRequestClose={() => {
          setOpen(false);
          setTimeout(() => {
            setNewRouter({
              label: '', provider: 0, ipAddress: '', routerAddress: 0, level: 0, model: '',
            });
          }, 250);
        }}
      />
    </ComposedModal>
  // <Modal
  //   launcherButtonRef={launcherButtonRef}
  //   modalHeading="Create a new Router"
  //   modalLabel="Routers"
  //   primaryButtonText="Create"
  //   secondaryButtonText="Cancel"
  //   open={open}
  //   onRequestSubmit={() => {
  //     setErr();
  //     const payload = {
  //       variables: {
  //         router: {
  //           label: newRouter.label, provider: newRouter.provider.id, ipAddress: newRouter.ipAddress, routerAddress: newRouter.routerAddress, level: newRouter.level, model: newRouter.model.id,
  //         },
  //       },
  //     };
  //     createRouter(payload).then(() => {
  //       refresh();
  //       setOpen(false);
  //     }).catch((err) => {
  //       setErr(err);
  //     });
  //   }}
  //   onRequestClose={() => {
  //     setOpen(false);
  //     setTimeout(() => {
  //       setNewRouter({
  //         label: '', provider: 0, ipAddress: '', routerAddress: 0, level: 0, model: '',
  //       });
  //     }, 250);
  //   }}
  // >
  //   <Stack gap={4}>
  //     <TextInput
  //       id="label"
  //       type="text"
  //       placeholder="Core Router"
  //       labelText="Name"
  //       required
  //       value={newRouter.label}
  //       onChange={(e) => setNewRouter({ ...newRouter, label: e.target.value })}
  //     />

  //     {loading && !data && (
  //     <>
  //       <DropdownSkeleton />
  //       <DropdownSkeleton />
  //     </>
  //     )}
  //     {data && (
  //       <>
  //         <Dropdown
  //           id="provider"
  //           titleText="Router Provider"
  //           label="Select a Provider"
  //           helperText={newRouter.provider.helperText}
  //           items={data.routerProviders}
  //           selectedItem={newRouter.provider}
  //           onChange={(e) => setNewRouter({ ...newRouter, provider: e.selectedItem })}
  //         />
  //         <Dropdown
  //           id="model"
  //           titleText="Router Model"
  //           label="Select a Model"
  //           disabled={!newRouter.provider}
  //           helperText={newRouter.model?.helperText}
  //           items={newRouter.provider?.models || []}
  //           selectedItem={newRouter.model}
  //           onChange={(e) => setNewRouter({ ...newRouter, model: e.selectedItem })}
  //         />
  //       </>
  //     )}
  //     {providerError && (
  //       <Dropdown
  //         id="provider"
  //         titleText="Router Provider"
  //         label="Unable to load Providers"
  //         disabled
  //       />
  //     )}
  //     <TextInput
  //       id="slug"
  //       type="text"
  //       placeholder="pgm"
  //       labelText="Slug"
  //       helperText="The Slug is used in the Stream ingest URL"
  //       required
  //       value={newRouter.slug}
  //       onChange={(e) => setNewRouter({ ...newRouter, slug: e.target.value })}
  //     />
  //     <GraphQLError error={error || providerError} />
  //   </Stack>
  // </Modal>
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
