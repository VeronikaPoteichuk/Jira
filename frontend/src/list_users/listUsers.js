import React from "react";
import axios from "axios";
import { Button, Modal, ModalHeader, ModalBody } from "reactstrap";
import CreateUser from "../create_user/createUser";

class ListUsers extends React.Component {
  state = {
    users: [],
    modal: false,
  };

  componentDidMount() {
    this.getUsers();
  }

  getUsers = () => {
    axios.get("/users/").then((res) => this.setState({ users: res.data }));
  };

  toggleModal = () => {
    this.setState((prevState) => ({
      modal: !prevState.modal,
    }));
  };

  render() {
    return (
      <div className="container mt-4">
        <h3>Users list</h3>
        <ul>
          {this.state.users.map((user, index) => (
            <li key={user.id}>
              <strong>{index + 1}. {user.username}</strong> — {user.email}
            </li>
          ))}
        </ul>

        <Button color="primary" onClick={this.toggleModal}>
          Add User
        </Button>

        <Modal isOpen={this.state.modal} toggle={this.toggleModal}>
          <ModalHeader toggle={this.toggleModal}>Create New User</ModalHeader>
          <ModalBody>
            <CreateUser resetState={this.getUsers} toggle={this.toggleModal} />
          </ModalBody>
        </Modal>
      </div>
    );
  }
}

export default ListUsers;
