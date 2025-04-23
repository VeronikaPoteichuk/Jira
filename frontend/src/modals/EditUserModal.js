import React, { useState } from "react";
import { Modal, ModalHeader, ModalBody, Button } from "reactstrap";
import axios from "../api/axios";
import EditUser from "../user_form/EditUser";

const EditUserModal = ({ isOpen, toggle, user, refresh }) => {
  if (!user) {
    return null;
  }

  const handleSave = async (formData) => {
    try {
      await axios.put(`/users/${user.id}/`, formData);
      refresh();
      toggle();
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };

  return (
    <Modal isOpen={isOpen} toggle={toggle}>
      <ModalHeader toggle={toggle}>Edit User</ModalHeader>
      <ModalBody>
        {user && (
          <>
            <EditUser user={user} onSave={handleSave} onCancel={toggle} />
          </>
        )}
      </ModalBody>
    </Modal>
  );
};

export default EditUserModal;
