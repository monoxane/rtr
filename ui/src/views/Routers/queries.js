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
    isConnected
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

const GET_ROUTER = gql`query router($id: ID!) {
  router(id: $id) {
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
    isConnected
    destinations {
      id
      index
      label
      description
      tallyGreen
      tallyRed
      routedSource {
        id
        index
        label
      }
    }
    sources {
      id
      index
      label
      description
    }
  }
}`;

const ROUTER_DESTINATIONS_SUBSCRIPTION = gql`subscription routerDestinations($routerId: ID!) {
  destinationUpdate(routerId: $routerId) {
    id
    index
    label
    description
    routedSource {
      id
      index
      label
    }
  }
}`;

const ROUTE = gql`mutation route($routerId: ID!, $destination: Int!, $source: Int!) {
  route(routerId: $routerId, destination: $destination, source: $source) 
}`;

const UPDATE_DESTINATION = gql`mutation updateDestination($destination: DestinationUpdate!) {
  updateDestination(destination: $destination) {
    id
  }
}`;

const UPDATE_SOURCE = gql`mutation updateSource($source: SourceUpdate!) {
  updateSource(source: $source) {
    id
  }
}`;

export {
  LIST_ROUTERS,
  LIST_PROVIDERS,

  CREATE_ROUTER,
  DELETE_ROUTER,
  GET_ROUTER,

  ROUTER_DESTINATIONS_SUBSCRIPTION,

  ROUTE,

  UPDATE_DESTINATION,
  UPDATE_SOURCE,
};
