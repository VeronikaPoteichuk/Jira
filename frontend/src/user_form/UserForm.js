import React, { useState, useEffect } from "react";
import { Button, Form, FormGroup, Input, Label } from "reactstrap";

const UserForm = ({ user, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || "",
        email: user.email || "",
        password: "",
      });
    }
  }, [user]);

  const onChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = e => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Form onSubmit={handleSubmit}>
      <FormGroup>
        <Label for="username">Name:</Label>
        <Input type="text" name="username" onChange={onChange} value={formData.username} required />
      </FormGroup>
      <FormGroup>
        <Label for="email">Email:</Label>
        <Input type="email" name="email" onChange={onChange} value={formData.email} required />
      </FormGroup>
      {!user ? (
        <FormGroup>
          <Label for="password">Password:</Label>
          <Input
            type="password"
            name="password"
            onChange={onChange}
            value={formData.password}
            required
          />
        </FormGroup>
      ) : (
        <FormGroup>
          <Label for="password">New Password (optional):</Label>
          <Input
            type="password"
            name="password"
            onChange={onChange}
            value={formData.password}
            placeholder="Leave blank to keep current password"
          />
        </FormGroup>
      )}
      <Button color="primary" type="submit">
        Save
      </Button>
      <Button color="secondary" onClick={onCancel}>
        Cancel
      </Button>
    </Form>
  );
};

export default UserForm;
