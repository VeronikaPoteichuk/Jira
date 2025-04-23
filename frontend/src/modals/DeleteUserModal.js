import React from "react";
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from "reactstrap";

const DeleteUserModal = ({ isOpen, toggle, user, onDelete }) => {
  if (!user) return null;

  return (
    <Modal isOpen={isOpen} toggle={toggle}>
      <ModalHeader toggle={toggle}>Confirm Delete</ModalHeader>
      <ModalBody>
        Are you sure you want to delete user <strong>{user.username}</strong>?
      </ModalBody>
      <ModalFooter>
        <Button color="danger" onClick={onDelete}>
          Yes, Delete
        </Button>
        <Button color="secondary" onClick={toggle}>
          Cancel
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default DeleteUserModal;
