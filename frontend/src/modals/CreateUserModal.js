import React, { useState } from "react";
import axios from "../api/axios";
import { Modal, ModalHeader, ModalBody } from "reactstrap";
import CreateUser from "../user_form/CreateUser";

const CreateUserModal = ({ isOpen, toggle, refresh }) => {
  const [error, setError] = useState(null);

  const handleSave = async formData => {
    try {
      await axios.post("/users/", formData);
      setError(null);
      refresh();
      toggle();
    } catch (error) {
      if (error.response?.data) {
        setError(error.response.data);
      } else {
        setError({ non_field_errors: ["Unknown error occurred"] });
      }
    }
  };

  return (
    <Modal isOpen={isOpen} toggle={toggle}>
      <ModalHeader toggle={toggle}>Create New User</ModalHeader>
      <ModalBody>
        <CreateUser onSave={handleSave} onCancel={toggle} error={error} />
      </ModalBody>
    </Modal>
  );
};

export default CreateUserModal;
