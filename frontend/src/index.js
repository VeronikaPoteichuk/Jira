// import React from "react";
// import { createRoot } from "react-dom/client";

// const App = () => <h1>Hello World from React!</h1>;

// const root = createRoot(document.getElementById("root"));
// root.render(<App />);


import React, { useEffect, useState } from "react";
import axios from "axios";

const App = () => {
  const [message, setMessage] = useState("Loading...");
  const [users, setUsers] = useState([]);

  useEffect(() => {
    axios.get("/users/")
      .then((res) => {
        console.log(res.data);
        setUsers(res.data);
        setMessage("Data loaded!");
      })
      .catch((err) => {
        console.error("Ошибка при получении данных:", err);
        setMessage("Ошибка загрузки");
      });
  }, []);

  return (
    <div>
      <h1>React + Django</h1>
      <p>{message}</p>
      <ul>
        {users.map((user) => (
          <li key={user.id}>{user.username}</li>
        ))}
      </ul>
    </div>
  );
};

export default App;
