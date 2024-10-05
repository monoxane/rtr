import { gql } from '@apollo/client';

const LIST_ROUTERS = gql`query routers {
  routers {
    id
    label
    provider {
      id
      label
    }
    model {
      id
      label
    }
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

const DELETE_ROUTER = gql`mutation deleteRouter($id:ID!) {
  deleteRouter(id:$id)
}`;

export {
  LIST_ROUTERS, LIST_PROVIDERS, CREATE_ROUTER, DELETE_ROUTER,
};
