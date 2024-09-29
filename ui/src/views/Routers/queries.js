import { gql } from '@apollo/client';

const LIST_ROUTERS = gql`query routers {
  routers {
    id
    label
    provider
    ipAddress
    routerAddress
    level
  }
}`;

const LIST_PROVIDERS = gql`query providers {
  routerProviders {
    id
    label
    helperText
    additionalConfiguration
    models {
      id
      label
    }
  }
}`;

const CREATE_ROUTER = gql`mutation createRouter($router: RouterUpdate!) {
  createRouter(router: $router) {
    id
  }
}`;

export {
  LIST_ROUTERS, LIST_PROVIDERS, CREATE_ROUTER,
};
