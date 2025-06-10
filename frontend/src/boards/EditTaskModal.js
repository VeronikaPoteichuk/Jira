import React, { useState, useEffect } from "react";
import { X, Check } from "lucide-react";
import axiosInstance from "../api/axios";
import CommentEditor from "./CommentEditor";

const EditTaskModal = ({ task, onClose, onSave }) => {
  const [title, setTitle] = useState("");
  const [activeTab, setActiveTab] = useState("Comments");

  const [comments, setComments] = useState([]);
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
        console.error("Error loading comments:", error);
      } finally {
        setLoadingComments(false);
      }
    };

    if (activeTab === "Comments") {
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
      console.error("Error updating task", error);
    }
  };

  const TABS = ["Comments", "History", "Work log"];

  return (
    <div className="modal-overlay-task">
    <div className="edit-task-modal">
      <div className="modal-task-content">
        <div className="modal-header">
          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body-with-sidebar">
          <div className="modal-main-content">
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
              {activeTab === "Comments" && (
                <>
                  {loadingComments ? (
                    <p>Loading comments...</p>
                  ) : (
                    <>
                      <div className="comments-list">
                        {comments.length === 0 && <p>There are no comments yet.</p>}
                        {comments.map(c => (
                          <div key={c.id} className="comment-item">
                            <strong>{c.author_username}:</strong> {c.text}
                          </div>
                        ))}
                      </div>
                      <div className="comment-input-section">
                        <CommentEditor
                          onSubmit={async html => {
                            if (!html.trim()) return;
                            try {
                              const res = await axiosInstance.post(
                                `/api/tasks/${task.id}/comments/`,
                                { text: html }
                              );
                              setComments(prev => [...prev, res.data]);
                            } catch (error) {
                              console.error("Error adding comment:", error);
                            }
                          }}
                        />
                      </div>
                    </>
                  )}
                </>
              )}

              {activeTab === "History" && <p>The change history will be here.</p>}
              {activeTab === "Work log" && <p>The change history will be here.</p>}
            </div>

            <div className="modal-task-buttons">
              <button className="save-button" onClick={handleSave}>
                <Check size={18} /> Save
              </button>
              <button className="cancel-task-button" onClick={onClose}>
                <X size={18} />Cancel

              </button>
            </div>
          </div>

          <aside className="task-sidebar">
            <h4>Details</h4>
            <ul>
              <li><strong>Executor:</strong> author</li>
              <li><strong>Marks:</strong> No</li>
              <li><strong>Parent:</strong> No</li>
              <li><strong>Team:</strong> No</li>
            </ul>
          </aside>
        </div>
      </div>
    </div>
  </div>

  );
};

export default EditTaskModal;
