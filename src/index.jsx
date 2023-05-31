import React from "react";
import { createRoot } from "react-dom/client";
import {
  ApolloClient,
  ApolloProvider,
  InMemoryCache,
  gql,
  useQuery,
  useFragment,
  useMutation,
} from "@apollo/client";
import { createFragmentRegistry } from "@apollo/client/cache";
import { link } from "./link.js";

export const UserFragment = gql`
  fragment UserFragment on User {
    name
  }
`;

export const ALL_USERS = gql`
  query AllUsers {
    users {
      id
      ...UserFragment
    }
  }
`;

export const ALL_USERS_NONREACTIVE = gql`
  query AllUsers {
    users {
      id
      ...UserFragment @nonreactive
    }
  }
`;

const EDIT_USER = gql`
  mutation EditUser($name: String, $id: ID) {
    editUser(name: $name, id: $id) {
      id
      name
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

function AddUser() {
  const [name, setName] = React.useState("");
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
    <div>
      <div>
        <label htmlFor="name">Name</label>
        <div>
          <input
            type="text"
            name="name"
            id="name"
            placeholder="Sarah Smith"
            onChange={(evt) => setName(evt.target.value)}
            value={name}
          />
        </div>
      </div>
      <button
        type="submit"
        onClick={() => {
          addUser({ variables: { name } });
          setName("");
        }}
      >
        Add user
      </button>
    </div>
  );
}

const UserComponent = function User({ id }) {
  const { data: user } = useFragment({
    fragment: UserFragment,
    from: {
      __typename: "User",
      id,
    },
  });
  const [isEditing, setIsEditing] = React.useState(false);
  const [name, setName] = React.useState(user.name);
  const [editUser] = useMutation(EDIT_USER);
  return (
    <tr>
      <td>
        {isEditing ? (
          <input
            type="text"
            name="name"
            id="name"
            onChange={(e) => {
              setName(e.currentTarget.value);
              editUser({
                variables: { name: e.currentTarget.value, id },
              });
            }}
            value={name}
          />
        ) : (
          <>
            {name} {Math.random()}
          </>
        )}
      </td>
      <td>
        <button
          onClick={() => {
            setIsEditing((prevVal) => !prevVal);
          }}
        >
          {isEditing ? "Done editing" : "Edit"} {name}
        </button>
      </td>
    </tr>
  );
};

function UsersTable({ query }) {
  const { data } = useQuery(query);
  return (
    <main>
      <h1>Users</h1>
      <AddUser />
      <table>
        <thead>
          <tr>
            <th scope="col">Name</th>
            <th scope="col">Edit</th>
          </tr>
        </thead>
        <tbody>
          {data?.users.map((user) => (
            <UserComponent key={user.id} id={user.id} />
          ))}
        </tbody>
      </table>
    </main>
  );
}

function App() {
  const [query, setQuery] = React.useState(ALL_USERS);
  return (
    <>
      <div>
        <label>
          <input
            value="slow"
            type="radio"
            name="queryVersion"
            checked={query === ALL_USERS}
            onChange={() => setQuery(ALL_USERS)}
          />{" "}
          Slow
        </label>
        <label>
          <input
            value="fast"
            type="radio"
            name="queryVersion"
            checked={query === ALL_USERS_NONREACTIVE}
            onChange={() => setQuery(ALL_USERS_NONREACTIVE)}
          />{" "}
          Fast
        </label>
      </div>
      <UsersTable query={query} />
    </>
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
