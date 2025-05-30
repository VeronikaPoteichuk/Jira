import React, { useState } from "react";
import AddTaskForm from "./AddNewTask";

const AddTaskToggle = ({ columnId, onAddTask }) => {
  const [showForm, setShowForm] = useState(false);

  const handleAddTask = async (columnId, title) => {
    await onAddTask(columnId, title);
    setShowForm(false);
  };

  return (
    <div style={{ padding: "0 0.5rem 0.5rem" }}>
      {showForm ? (
        <AddTaskForm columnId={columnId} onAddTask={handleAddTask} />
      ) : (
        <div className="add-task-container">
          <button className="add-task-button" onClick={() => setShowForm(true)}>
            + Add new task
          </button>
        </div>
      )}
    </div>
  );
};

export default AddTaskToggle;
