import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import {
  ApolloClient,
  ApolloProvider,
  InMemoryCache,
  gql,
  useQuery,
} from "@apollo/client";
import { createFragmentRegistry } from "@apollo/client/cache";
import Table from "./components/table.jsx";
import { link } from "./link.js";
import "./index.css";

export const UserFragment = gql`
  fragment UserFragment on User {
    name
  }
`;

export const ALL_USERS = gql`
  query AllUsers {
    users {
      id
      ...UserFragment @nonreactive
    }
  }
`;

function App() {
  const { data } = useQuery(ALL_USERS);

  return (
    <main>
      <Table users={data?.users} />
    </main>
  );
}

const client = new ApolloClient({
  link,
  cache: new InMemoryCache({
    fragments: createFragmentRegistry(gql`
      ${UserFragment}
    `),
  }),
});

const container = document.getElementById("root");
const root = createRoot(container);

root.render(
  <ApolloProvider client={client}>
    <App />
  </ApolloProvider>
);
