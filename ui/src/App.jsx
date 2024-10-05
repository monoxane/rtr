import { RouterProvider } from 'react-router-dom';
import Favicon from 'react-favicon';
import React from 'react';
import { createClient } from 'graphql-ws';

import {
  ErrorBoundary,
} from '@carbon/react';

import { getMainDefinition } from '@apollo/client/utilities';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { onError } from '@apollo/client/link/error';
import { setContext } from '@apollo/client/link/context';

import {
  ApolloClient, createHttpLink, ApolloProvider, InMemoryCache, from, split,
} from '@apollo/client';

import { AuthProvider } from './context/AuthProvider';

import Routes from './common/Routes.jsx';
import ReactError from './common/ReactError.jsx';
import imgs from './common/imgs.js';

const httpLink = createHttpLink({
  uri: '/v3/graphql',
});

const wsLink = new GraphQLWsLink(
  createClient({
    url: `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.hostname}:${window.location.port}/v3/graphql`,
  }),
);

const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return definition.kind === 'OperationDefinition' && definition.operation === 'subscription';
  },
  wsLink,
  httpLink,
);

const authLink = setContext((_, { headers }) => {
  // get the authentication token from local storage if it exists
  const auth = JSON.parse(localStorage.getItem('auth'));
  // return the headers to the context so httpLink can read them
  return {
    headers: {
      ...headers,
      authorization: auth ? `Bearer ${auth.accessToken}` : '',
    },
  };
});

const errorLink = onError(({
  graphQLErrors, operation, forward,
}) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(((err) => {
      if (err.extensions?.code === 'AUTH_ERROR') {
        localStorage.removeItem('auth');
        window.location.replace('/login');
        return null;
      }
      return forward(operation);
    }));
  }

  return forward(operation);
});

const client = new ApolloClient({
  link: from([errorLink, authLink, splitLink]),
  uri: '/v3/graphql',
  cache: new InMemoryCache(),
});

function App() {
  return (
    <ErrorBoundary fallback={<ReactError />}>
      <ApolloProvider client={client}>
        <AuthProvider>
          <Favicon url={imgs.favicon} />
          <RouterProvider router={Routes} />
        </AuthProvider>
      </ApolloProvider>
    </ErrorBoundary>
  );
}

export default App;
