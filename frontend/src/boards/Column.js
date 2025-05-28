import React from "react";
import TaskCard from "./TaskCard";
import { useDroppable } from "@dnd-kit/core";

const Column = ({ column }) => {
  const { setNodeRef } = useDroppable({
    id: `${column.id}:placeholder`,
  });

  return (
    <div className="column">
      <h2>
        {column.name}
        <span className="task-count">{column.tasks.length}</span>
      </h2>

      <div className="task-list">
        {column.tasks.length === 0 ? (
          <div
            ref={setNodeRef}
            className="placeholder"
            style={{
              minHeight: 50,
              borderRadius: "4px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "none",
              cursor: "default",
            }}
          >
            Column is empty
          </div>
        ) : (
          column.tasks.map((task) => (
            <TaskCard key={task.id} task={{ ...task, column: column.id }} />
          ))
        )}
      </div>
    </div>
  );
};

export default Column;
