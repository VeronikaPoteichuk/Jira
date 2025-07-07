import React, { useState, useRef, useEffect } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import axiosInstance from "../api/axios";
import { Check, X, Pencil, MoreVertical } from "lucide-react";
import { useDeleteModal } from "../hooks/DeleteModalContext";

const TaskCard = ({ task, onDelete, onClick, onUpdate }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: `task:${task.column}:${task.id}`,
  });

  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [menuOpen, setMenuOpen] = useState(false);
  const inputRef = useRef(null);
  const menuRef = useRef(null);
  const buttonRef = useRef(null);
  const { openModal: openDeleteModal } = useDeleteModal();

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  useEffect(() => {
    const handleClickOutside = e => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target)
      ) {
        setMenuOpen(false);
      }
    };

    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuOpen]);

  useEffect(() => {
    setTitle(task.title);
  }, [task.title]);

  const handleSave = async () => {
    const trimmed = title.trim();
    if (!trimmed) return;

    try {
      const res = await axiosInstance.patch(`/api/tasks/${task.id}/`, { title: trimmed });
      if (onUpdate) onUpdate(res.data);
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
      className="task-card hover-group"
      data-dragging={isDragging}
      onClick={() => onClick(task.id)}
    >
      <div className="task-top-bar" onClick={() => onClick(task)}>
        {!isEditing && (
          <button
            ref={buttonRef}
            className="menu-button"
            onClick={e => {
              e.stopPropagation();
              setMenuOpen(!menuOpen);
            }}
          >
            <MoreVertical size={16} />
          </button>
        )}
        {menuOpen && (
          <div className="task-menu" ref={menuRef}>
            <button
              onClick={e => {
                e.stopPropagation();
                openDeleteModal(
                  task,
                  t => onDelete(t.id),
                  t => `task "${t.title}"`,
                );
              }}
            >
              Delete
            </button>
          </div>
        )}
      </div>

      {isEditing ? (
        <div className="edit-form" onClick={e => e.stopPropagation()}>
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
        <div
          className="task-display"
          onClick={e => {
            e.stopPropagation();
            setIsEditing(true);
          }}
        >
          <div className="task-display-content">
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
        </div>
      )}
      <div className="task-meta">
        <input type="checkbox" defaultChecked onClick={e => e.stopPropagation()} />
        <span className="task-id">
          {task.project_name}-{task.id}
        </span>
      </div>
    </div>
  );
};

export default TaskCard;
