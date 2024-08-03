import { RouterProvider } from 'react-router-dom';
import Favicon from 'react-favicon';
import React from 'react';

import {
  ErrorBoundary,
} from '@carbon/react';

import { setContext } from '@apollo/client/link/context';
import {
  ApolloClient, createHttpLink, ApolloProvider, InMemoryCache,
} from '@apollo/client';

import { AuthProvider } from './context/AuthProvider';

import Routes from './common/Routes.jsx';
import ReactError from './common/ReactError.jsx';
import imgs from './common/imgs.js';

const httpLink = createHttpLink({
  uri: '/v3/graphql',
});

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

const client = new ApolloClient({
  link: authLink.concat(httpLink),
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
