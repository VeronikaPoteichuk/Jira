import React, { useState, useRef } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import axiosInstance from "../api/axios";
import { Check, X, Pencil, MoreVertical } from "lucide-react";

const TaskCard = ({ task, onDelete }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: `task:${task.column}:${task.id}`,
  });

  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const inputRef = useRef(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleSave = async () => {
    const trimmed = title.trim();
    if (!trimmed) return;

    try {
      await axiosInstance.patch(`/api/tasks/${task.id}/`, { title: trimmed });
    } catch (error) {
      console.error("Update failed", error);
    }

    setIsEditing(false);
  };

  const handleCancel = () => {
    setTitle(task.title);
    setIsEditing(false);
  };

  const handleKeyDown = e => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    } else if (e.key === "Escape") {
      handleCancel();
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...(isEditing ? {} : listeners)}
      className="task-card"
      data-dragging={isDragging}
    >
      <div className="task-top-bar">
        {!isEditing && (
          <button className="menu-button" onClick={() => setMenuOpen(!menuOpen)}>
            <MoreVertical size={16} />
          </button>
        )}
        {menuOpen && (
          <div className="task-menu">
            <button onClick={() => setShowDeleteModal(true)}>Удалить</button>
          </div>
        )}
      </div>

      {isEditing ? (
        <div className="edit-form">
          <textarea
            ref={inputRef}
            className="edit-input"
            value={title}
            onChange={e => setTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
            rows={2}
          />
          <div className="edit-actions">
            <button className="action-btn" onClick={handleSave}>
              <Check size={18} />
            </button>
            <button className="action-btn" onClick={handleCancel}>
              <X size={18} />
            </button>
          </div>
        </div>
      ) : (
        <div className="task-display" onClick={() => setIsEditing(true)}>
          <span>{title}</span>
          <button
            className="edit-button"
            onClick={e => {
              e.stopPropagation();
              setIsEditing(true);
            }}
          >
            <Pencil size={16} />
          </button>
        </div>
      )}

      <div className="task-meta">
        <input type="checkbox" defaultChecked />
        <span className="task-id">board_name-{task.id}</span>
      </div>
      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal-contentt">
            <p4 className="modal-title-text">Delete task?</p4>
            <p className="modal-description">
              Are you sure you want to delete this task? This action cannot be undone.
            </p>
            <div className="modal-buttons">
              <button className="cancel-button" onClick={() => setShowDeleteModal(true)}>
                Cancel
              </button>
              <button
                className="delete-button"
                onClick={() => {
                  setShowDeleteModal(false);
                  onDelete(task.id);
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

export default TaskCard;
