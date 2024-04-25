import React from 'react';

const configContext = React.createContext({
  config: {},
  refreshConfig: () => {},
});

export default configContext;
