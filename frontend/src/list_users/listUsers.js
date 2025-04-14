import React, { useEffect, useState } from "react";
import axios from "axios";

const App = () => {
  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState("Load...");

  useEffect(() => {
    axios.get("/users/")
      .then((response) => {
        setUsers(response.data);
        setMessage("Data loaded.");
      })
      .catch((error) => {
        console.error("Error while receiving data:", error);
        setMessage("Error loading data.");
      });
  }, []);

  return (
    <div>
      <h1>Users list</h1>
      <p>{message}</p>
        {users.map(user => (
          <a key={user.id}>
            {user.id}.<strong> {user.username}</strong> — {user.email || "not email"}
          </a>
        ))}
    </div>
  );
};

export default App;
