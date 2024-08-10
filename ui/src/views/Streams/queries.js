import { gql } from '@apollo/client';

const LIST_STREAMS = gql`query streams {
  streams {
    id
    label
    slug
    isRoutable
    destination {
      id
    }
    clients
    isActive
  }
}`;

const GET_STREAM = gql`query stream($id: ID, $slug: String) {
  stream(id:$id, slug:$slug) {
    id
    label
    slug
    isRoutable
    destination {
      id
    }
    clients
    isActive
  }
}`;

const CREATE_STREAM = gql`mutation createStream($stream: StreamUpdate!) {
  createStream(stream:$stream) {
    id
  }
}`;

export { LIST_STREAMS, GET_STREAM, CREATE_STREAM };
