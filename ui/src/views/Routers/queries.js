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

const CREATE_ROUTER = gql`mutation createRouter($router: RouterUpdate!) {
  createRouter(router: $router) {
    id
  }
}`;

export {
  LIST_ROUTERS, CREATE_ROUTER,
};
