import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import {
  ApolloClient,
  ApolloProvider,
  InMemoryCache,
  gql,
  useQuery,
  useMutation,
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

const ALL_USERS = gql`
  query AllUsers {
    users {
      id
      ...UserFragment @nonreactive
    }
  }
`;

const ADD_USER = gql`
  mutation AddUser($name: String) {
    addUser(name: $name) {
      id
      name
    }
  }
`;

function App() {
  const [name, setName] = useState("");
  const { data } = useQuery(ALL_USERS);

  const [addUser] = useMutation(ADD_USER, {
    update: (cache, { data: { addUser: addUserData } }) => {
      const usersResult = cache.readQuery({ query: ALL_USERS });

      cache.writeQuery({
        query: ALL_USERS,
        data: {
          ...usersResult,
          users: [...usersResult.users, addUserData],
        },
      });
    },
  });

  return (
    <main>
      <div className="add-user">
        <input
          type="text"
          name="name"
          value={name}
          onChange={(evt) => setName(evt.target.value)}
        />
        <button
          onClick={() => {
            addUser({ variables: { name } });
            setName("");
          }}
        >
          Add user
        </button>
      </div>
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
