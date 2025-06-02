import React, { useEffect, useRef, useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const Column = ({ column, isDragging, onUpdateName, onDelete }) => {
  const [isEditing, setIsEditing] = useState(column.isNew || false);
  const [editedName, setEditedName] = useState(column.name || "");
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: `column:${column.id}`,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const editRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = e => {
      if (isEditing && editRef.current && !editRef.current.contains(e.target)) {
        if (column.isNew) {
          onDelete(column.id);
        } else {
          setIsEditing(false);
          setEditedName(column.name);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isEditing, column, onDelete]);

  const handleSave = async () => {
    const success = await onUpdateName(column.id, editedName);
    if (success) {
      column.isNew = false;
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
          <div ref={editRef} className="edit-column-name">
            <input
              type="text"
              value={editedName}
              onChange={e => setEditedName(e.target.value)}
              autoFocus
            />
            <div className="edit-buttons">
              {column.isNew ? (
                <>
                  <button onClick={handleSave} className="edit-btn confirm-btn">
                    Create
                  </button>
                  <button onClick={() => onDelete(column.id)} className="edit-btn cancel-btn">
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <button onClick={handleSave} className="edit-btn confirm-btn">
                    &#10004;
                  </button>
                  <button onClick={handleCancel} className="edit-btn cancel-btn">
                    &#10008;
                  </button>
                  <button className="delete-column-btn" onClick={() => setShowDeleteModal(true)}>
                    &#128465;
                  </button>
                </>
              )}
            </div>
          </div>
        ) : (
          <h2 onClick={() => setIsEditing(true)}>
            {column.name}
            <span className="task-count">{column.tasks.length}</span>
          </h2>
        )}
      </div>

      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal-contentt">
            <p4 className="modal-title-text">Delete Column?</p4>
            <p className="modal-description">
              Are you sure you want to delete this column? This action cannot be undone.
            </p>
            <div className="modal-buttons">
              <button className="cancel-button" onClick={() => setShowDeleteModal(false)}>
                Cancel
              </button>
              <button
                className="delete-button"
                onClick={() => {
                  setShowDeleteModal(false);
                  onDelete(column.id);
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Column;
