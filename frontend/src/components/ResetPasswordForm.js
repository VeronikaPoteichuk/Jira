import React, { useState } from "react";
import { Form, FormGroup, Label, Input, Button, FormFeedback } from "reactstrap";
import axios from "axios";

const ResetPasswordForm = ({ userId, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: ""
  });
  const [passwordMismatch, setPasswordMismatch] = useState(false);
  const [error, setError] = useState(null);

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (passwordMismatch) setPasswordMismatch(false);
    if (error) setError(null);
  };

  // Функция для получения CSRF токена
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setPasswordMismatch(true);
      return;
    }

    console.log('userId:', userId); // Логируем userId перед запросом

    if (!userId) {
      setError("User ID is missing.");
      return;
    }

    try {
      const csrfToken = getCsrfToken();  // Получаем CSRF токен
      await axios.patch(
        `/users/${userId}/`,
        { password: formData.password },
        { headers: { 'X-CSRFToken': csrfToken } }  // Добавляем CSRF токен в заголовок
      );
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.detail || "Error.");
      console.error("Error:", err.response?.data);
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      <FormGroup>
        <Label for="password">New password:</Label>
        <Input
          type="password"
          name="password"
          value={formData.password}
          onChange={onChange}
          invalid={passwordMismatch}
          required
        />
      </FormGroup>

      <FormGroup>
        <Label for="confirmPassword">Repeat password:</Label>
        <Input
          type="password"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={onChange}
          invalid={passwordMismatch}
          required
        />
        {passwordMismatch && <FormFeedback>Passwords are different</FormFeedback>}
      </FormGroup>

      {error && <div className="text-danger mb-2">{error}</div>}

      <Button color="primary" type="submit">Save</Button>{" "}
      <Button color="secondary" onClick={onCancel}>Cancel</Button>
    </Form>
  );
};

export default ResetPasswordForm;
