import React, { useState } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';

import {
  Modal,
  FileUploader,
} from '@carbon/react';

function ImportLabelsModal({
  open, setOpen, routerId, refresh,
}) {
  const [file, setFile] = useState();
  const [isLoading, setIsLoading] = useState(false);

  const submit = () => {
    setIsLoading(true);

    const formData = new FormData();
    formData.append('labels.lbl', file, 'labels.lbl');

    axios.post(`/v1/api/labels?filename=labels.lbl&format=rossDashboard&router=${routerId}`, formData, {
      headers: {
        // 'Content-Type': 'multipart/form-data',
      },
    })
      .then(() => {
        setOpen(false);
        setIsLoading(false);
        setFile(null);
        refresh();
      });
  };

  return (
    <Modal
      modalHeading="Import Router Labels"
      primaryButtonText="Upload"
      secondaryButtonText="Cancel"
      primaryButtonDisabled={isLoading}
      open={open}
      onRequestClose={() => setOpen(false)}
      onRequestSubmit={submit}
    >
      <FileUploader
        labelTitle="Upload file"
        labelDescription="Max file size is 10kb. Only Ross Dashboard .lbl files are supported."
        buttonLabel="Select file"
        buttonKind="primary"
        size="md"
        filenameStatus={isLoading ? 'uploading' : 'edit'}
        accept={['.lbl']}
        disabled={isLoading}
        iconDescription="Delete file"
        name=""
        onChange={(e) => { setFile(e.target.files[0]); }}
      />
    </Modal>
  );
}

ImportLabelsModal.propTypes = {
  open: PropTypes.bool.isRequired,
  setOpen: PropTypes.func.isRequired,
  routerId: PropTypes.number.isRequired,
  refresh: PropTypes.func.isRequired,
};

export default ImportLabelsModal;
