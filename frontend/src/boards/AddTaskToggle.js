import React, { useEffect, useRef, useState } from "react";
import AddTaskForm from "./AddNewTask";

const AddTaskToggle = ({ columnId, onAddTask }) => {
  const [showForm, setShowForm] = useState(false);
  const formRef = useRef(null);

  const handleAddTask = async (columnId, title) => {
    await onAddTask(columnId, title);
    setShowForm(false);
  };

  useEffect(() => {
    const handleClickOutside = e => {
      if (showForm && formRef.current && !formRef.current.contains(e.target)) {
        setShowForm(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showForm]);

  return (
    <div style={{ padding: "0 0.5rem 0.5rem" }}>
      {showForm ? (
        <div ref={formRef}>
          <AddTaskForm columnId={columnId} onAddTask={handleAddTask} />
        </div>
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
