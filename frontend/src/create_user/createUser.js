import React from "react";
import { Button, Form, FormGroup, Input, Label } from "reactstrap";
import axios from "axios";

class CreateUser extends React.Component {
  state = {
    username: "",
    email: "",
    password: "",
  };

  componentDidMount() {
    if (this.props.user) {
      const { username, email, password } = this.props.user;
      this.setState({ username, email, password });
    }
  }

  onChange = (e) => {
    this.setState({ [e.target.name]: e.target.value });
  };

  createUser = (e) => {
    e.preventDefault();
    axios
      .post("/users/", this.state)
      .then(() => {
        if (this.props.resetState) this.props.resetState();
        if (this.props.toggle) this.props.toggle();
      })
      .catch((err) => {
        console.error("Error!:", err);
      });
  };

  render() {
    return (
      <Form onSubmit={this.createUser}>
        <FormGroup>
          <Label for="username">Name:</Label>
          <Input
            type="text"
            name="username"
            onChange={this.onChange}
            value={this.state.username}
            required
          />
        </FormGroup>
        <FormGroup>
          <Label for="email">Email:</Label>
          <Input
            type="email"
            name="email"
            onChange={this.onChange}
            value={this.state.email}
            required
          />
        </FormGroup>
        <FormGroup>
          <Label for="password">Password:</Label>
          <Input
            type="password"
            name="password"
            onChange={this.onChange}
            value={this.state.password}
            required
          />
        </FormGroup>
        <Button type="submit">Send</Button>
      </Form>
    );
  }
}

export default CreateUser;
