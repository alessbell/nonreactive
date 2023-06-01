import React, { useState } from "react";
import { gql, useMutation } from "@apollo/client";
import { ALL_USERS } from ".";

const ADD_USER = gql`
  mutation AddUser($name: String) {
    addUser(name: $name) {
      id
      name
    }
  }
`;

export function AddUser() {
  const [name, setName] = useState("");
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
