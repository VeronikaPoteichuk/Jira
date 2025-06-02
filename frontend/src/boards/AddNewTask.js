import React, { useState } from "react";

const AddTaskForm = ({ columnId, onAddTask }) => {
  const [newTaskTitle, setNewTaskTitle] = useState("");

  const handleSubmit = async () => {
    if (!newTaskTitle.trim()) return;
    await onAddTask(columnId, newTaskTitle.trim());
    setNewTaskTitle("");
  };

  const handleKeyDown = e => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="add-task-form">
      <input
        type="text"
        placeholder="Enter the task name..."
        value={newTaskTitle}
        onChange={e => setNewTaskTitle(e.target.value)}
        onKeyDown={handleKeyDown}
        className="task-input"
        autoFocus
      />

      <button onClick={handleSubmit} className="submit-task-button">
        + Add task
      </button>
    </div>
  );
};

export default AddTaskForm;
