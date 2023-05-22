import React from "react";
import { gql } from "@apollo/client";
import {
  useFragment_experimental as useFragment,
  useMutation,
} from "@apollo/client";
import { UserFragment } from "../index.jsx";

const EDIT_USER = gql`
  mutation EditUser($name: String, $id: ID) {
    editUser(name: $name, id: $id) {
      id
      name
    }
  }
`;

export default function Example({ users }) {
  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-base font-semibold leading-6 text-gray-900">
            Users
          </h1>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <button
            type="button"
            className="block rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            Add user
          </button>
        </div>
      </div>
      <div className="mt-8 flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <table className="min-w-full divide-y divide-gray-300">
              <thead>
                <tr>
                  <th
                    scope="col"
                    className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-3"
                  >
                    Name
                  </th>
                  <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-3">
                    <span className="sr-only">Edit</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {users?.map((user, i) => (
                  <User key={user.id} id={user.id} index={i} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function User({ id, index }) {
  const { data: user } = useFragment({
    fragment: UserFragment,
    from: {
      __typename: "User",
      id,
    },
  });
  const [isEditing, setIsEditing] = React.useState(false);
  const [name, setName] = React.useState(user.name);
  const [isLoading, setIsLoading] = React.useState(false);
  const [editUser] = useMutation(EDIT_USER, {
    update: (cache, { data: { editUser: editUserData } }) => {
      setIsLoading(false);
    },
  });

  React.useEffect(() => {
    if (name !== user.name) {
      editUser({
        variables: { name, id },
      });
    }
  }, [name]);

  return (
    <tr className="even:bg-gray-50">
      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-3">
        {isEditing ? (
          <div>
            <label htmlFor="email" className="sr-only">
              Email
            </label>
            <div className="mt-2">
              <input
                type="email"
                name="email"
                id="email"
                onChange={(e) => {
                  setIsLoading(true);
                  setName(e.currentTarget.value);
                }}
                value={name}
                className="block w-full rounded-md border-0 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              />
            </div>
          </div>
        ) : (
          <div>
            {name}{" "}
            <span
              style={{
                backgroundColor: `rgba(0, 0, 0, ${
                  (index * Math.random()) / 100
                })`,
              }}
            >
              {Math.random()}
            </span>
          </div>
        )}
      </td>
      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-3">
        <button
          onClick={() => {
            setIsEditing((prevVal) => !prevVal);
          }}
          className="text-indigo-600 hover:text-indigo-900"
        >
          {isEditing ? "Done" : "Edit"}
          <span className="sr-only">, {name}</span>
        </button>
      </td>
    </tr>
  );
}
