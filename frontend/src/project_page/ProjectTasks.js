import React, { useEffect, useState } from "react";
import axiosInstance from "../api/axios";

const ProjectTasks = ({ projectId }) => {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    axiosInstance
      .get(`/api/tasks/`)
      .then(res => setTasks(res.data))
      .catch(err => console.error("Error loading tasks:", err));
  }, [projectId]);

  return (
    <div>
      <h2>Project tasks</h2>
      <ul>
        {tasks.map(task => (
          <li key={task.id}>
            <strong>{task.title}</strong> — {task.description}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ProjectTasks;
