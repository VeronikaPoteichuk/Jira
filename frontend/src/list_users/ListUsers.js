import React, { useEffect, useState } from "react";
import axios from "../api/axios";
import { Button } from "reactstrap";
import CreateUserModal from "../modals/CreateUserModal";
import EditUserModal from "../modals/EditUserModal";
import DeleteUserModal from "../modals/DeleteUserModal";

const ListUsers = () => {
  const [users, setUsers] = useState([]);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const fetchUsers = () => {
    axios.get("/users/").then((res) => setUsers(res.data));
  };

  useEffect(() => {
    axios.get("/csrf/"); // вызовет view, выставляющий csrf куку

    fetchUsers();
  }, []);

  const toggleCreateModal = () => setCreateModalOpen(!createModalOpen);

  const toggleEditModal = (user = null) => {
    setSelectedUser(user);
    setEditModalOpen((prev) => !prev);
  };

  const toggleDeleteModal = (user = null) => {
    setSelectedUser(user);
    setDeleteModalOpen((prev) => !prev);
  };

  const deleteUser = () => {
    if (!selectedUser) return;
    axios
      .delete(`/users/${selectedUser.id}/`)
      .then(() => {
        toggleDeleteModal();
        fetchUsers();
      })
      .catch((err) => console.error("Error deleting user:", err));
  };

  return (
    <div className="container mt-4">
      <h3>Users list</h3>
      <ul>
        {users.map((user, index) => (
          <li key={user.id} className="mb-2">
            <strong>{index + 1}. {user.username}</strong> — {user.email}
            <Button
              color="secondary"
              size="sm"
              className="ms-3"
              onClick={() => toggleEditModal(user)}
            >
              Edit
            </Button>
            <Button
              color="danger"
              size="sm"
              className="ms-2"
              onClick={() => toggleDeleteModal(user)}
            >
              Delete
            </Button>
          </li>
        ))}
      </ul>

      <Button color="primary" onClick={toggleCreateModal}>
        Add User
      </Button>

      <CreateUserModal
        isOpen={createModalOpen}
        toggle={toggleCreateModal}
        refresh={fetchUsers}
      />

      <EditUserModal
        isOpen={editModalOpen}
        toggle={() => toggleEditModal(null)}
        user={selectedUser}
        refresh={fetchUsers}
      />

      <DeleteUserModal
        isOpen={deleteModalOpen}
        toggle={() => toggleDeleteModal(null)}
        user={selectedUser}
        onDelete={deleteUser}
      />
    </div>
  );
};

export default ListUsers;
