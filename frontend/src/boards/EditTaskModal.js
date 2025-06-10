import React, { useState, useEffect } from "react";
import { X, Check } from "lucide-react";
import axiosInstance from "../api/axios";

const EditTaskModal = ({ task, onClose, onSave }) => {
  const [title, setTitle] = useState("");
  const [activeTab, setActiveTab] = useState("Комментарии");

  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loadingComments, setLoadingComments] = useState(true);

  useEffect(() => {
    setTitle(task.title || "");
  }, [task]);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const res = await axiosInstance.get(`/api/tasks/${task.id}/comments/`);
        setComments(res.data);
      } catch (error) {
        console.error("Ошибка при загрузке комментариев:", error);
      } finally {
        setLoadingComments(false);
      }
    };

    if (activeTab === "Комментарии") {
      fetchComments();
    }
  }, [task.id, activeTab]);

  const handleSave = async () => {
    const trimmed = title.trim();
    if (!trimmed) return;

    try {
      const res = await axiosInstance.patch(`/api/tasks/${task.id}/`, {
        title: trimmed,
      });
      onSave(res.data);
      onClose();
    } catch (error) {
      console.error("Ошибка при обновлении задачи", error);
    }
  };

  const handleAddComment = async () => {
    const trimmed = newComment.trim();
    if (!trimmed) return;

    try {
      const res = await axiosInstance.post(`/api/tasks/${task.id}/comments/`, {
        text: trimmed,
      });
      setComments(prev => [...prev, res.data]);
      setNewComment("");
    } catch (error) {
      console.error("Ошибка при добавлении комментария:", error);
    }
  };

  const TABS = ["Комментарии", "История", "Журнал работ"];

  return (
    <div className="modal-overlay-task">
      <div className="edit-task-modal">
        <div className="modal-task-content">
          <div className="modal-header">
            <h3 className="modal-title">Редактирование задачи</h3>
            <button className="modal-close" onClick={onClose}>
              <X size={20} />
            </button>
          </div>

          <textarea
            className="edit-task-textarea"
            value={title}
            onChange={e => setTitle(e.target.value)}
            rows={3}
          />

          <div className="tabs">
            {TABS.map(tab => (
              <button
                key={tab}
                className={activeTab === tab ? "active" : ""}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="tab-content">
            {activeTab === "Комментарии" && (
              <>
                {loadingComments ? (
                  <p>Загрузка комментариев...</p>
                ) : (
                  <>
                    <div className="comments-list">
                      {comments.length === 0 && <p>Комментариев пока нет.</p>}
                      {comments.map(c => (
                        <div key={c.id} className="comment-item">
                          <strong>{c.author_username}:</strong> {c.text}
                        </div>
                      ))}
                    </div>
                    <div className="comment-input-section">
                      <textarea
                        className="comment-textarea"
                        placeholder="Добавить комментарий..."
                        value={newComment}
                        onChange={e => setNewComment(e.target.value)}
                        rows={2}
                      />
                      <button
                        className="save-button"
                        onClick={handleAddComment}
                        disabled={!newComment.trim()}
                      >
                        Добавить
                      </button>
                    </div>
                  </>
                )}
              </>
            )}

            {activeTab === "История" && <p>История изменений будет здесь.</p>}
            {activeTab === "Журнал работ" && <p>Журнал работы будет здесь.</p>}
          </div>

          <div className="modal-task-buttons">
            <button className="save-button" onClick={handleSave}>
              <Check size={18} /> Сохранить
            </button>
            <button className="cancel-task-button" onClick={onClose}>
              Отмена
            </button>
          </div>
        </div>

        <aside className="task-sidebar">
          <h4>Сведения</h4>
          <ul>
            <li>
              <strong>Исполнитель:</strong> author
            </li>
            <li>
              <strong>Метки:</strong> Нет
            </li>
            <li>
              <strong>Родитель:</strong> Нет
            </li>
            <li>
              <strong>Team:</strong> Нет
            </li>
          </ul>
        </aside>
      </div>
    </div>
  );
};

export default EditTaskModal;
