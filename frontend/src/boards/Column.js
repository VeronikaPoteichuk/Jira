import React, { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const Column = ({ column, isDragging, onUpdateName, onDelete }) => {
  const [isEditing, setIsEditing] = useState(column.isNew || false);
  const [editedName, setEditedName] = useState(column.name || "");
  const [showDeleteModal, setShowDeleteModal] = useState(false);

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
              <button
                className="delete-column-btn"
                onClick={() => setShowDeleteModal(true)}
              >
                🗑
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

      {showDeleteModal && (
  <div
    className="modal-overlay"
    style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'rgba(0, 0, 0, 0.4)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      animation: 'fadeIn 0.3s ease',
    }}
  >
    <div
      className="modal-content"
      style={{
        background: '#fff',
        padding: '2rem',
        borderRadius: '12px',
        width: '400px',
        maxWidth: '90%',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)',
        zIndex: 1001,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        animation: 'slideInUp 0.3s ease',
      }}
    >
      <h style={{ marginBottom: '1rem', fontSize: '1.25rem', textAlign: 'center' }}>
        Delete Column?
      </h>
      <p style={{ textAlign: 'center', color: '#666', marginBottom: '2rem' }}>
        Are you sure you want to delete this column? This action cannot be undone.
      </p>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', width: '100%' }}>
        <button
          className="cancel-button"
          onClick={() => setShowDeleteModal(false)}
        >
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
