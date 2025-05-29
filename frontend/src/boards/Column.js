import React, { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const Column = ({ column, isDragging, onUpdateName }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(column.name);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({
    id: `column:${column.id}`,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleSave = async () => {
    const success = await onUpdateName(column.id, editedName);
    if (success) {
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditedName(column.name);
    setIsEditing(false);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...(isEditing ? {} : { ...attributes, ...listeners })}
      className="column"
      data-dragging={isDragging}
    >
      <div className="column-header">
        {isEditing ? (
          <div className="edit-column-name">
            <input
              type="text"
              value={editedName}
              onChange={(e) => setEditedName(e.target.value)}
              autoFocus
            />
            <div className="edit-buttons">
              <button onClick={handleSave} className="edit-btn confirm-btn">
              &#10004;
              </button>
              <button onClick={handleCancel} className="edit-btn cancel-btn">
              &#10008;
              </button>
            </div>
          </div>
        ) : (
          <h2 onClick={() => setIsEditing(true)}>
            {column.name}
            <span className="task-count">{column.tasks.length}</span>
          </h2>
        )}
      </div>
    </div>
  );
};

export default Column;
