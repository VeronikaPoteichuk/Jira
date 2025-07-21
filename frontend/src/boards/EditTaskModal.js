import React, { useState, useEffect } from "react";
import { X, Check, GitBranchPlus } from "lucide-react";
import axiosInstance from "../api/axios";
import CommentEditor from "./CommentEditor";
import DOMPurify from "dompurify";

const EditTaskModal = ({ task, onClose, onSave, githubRepo }) => {
  const [title, setTitle] = useState("");
  const [activeTab, setActiveTab] = useState("Comments");
  const [description, setDescription] = useState("");
  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(true);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [editedDescription, setEditedDescription] = useState("");
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [filter, setFilter] = useState("all");
  const [workLog, setWorkLog] = useState([]);
  const [loadingWorkLog, setLoadingWorkLog] = useState(true);

  useEffect(() => {
    setTitle(task.title || "");
    setDescription(task.description || "");
    setEditedDescription(task.description || "");
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

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await axiosInstance.get(`/api/tasks/${task.id}/history/`);
        setHistory(res.data);
      } catch (error) {
        console.error("Error loading history:", error);
      } finally {
        setLoadingHistory(false);
      }
    };

    if (activeTab === "Git history") {
      fetchHistory();
    }
  }, [task.id, activeTab]);

  useEffect(() => {
    const fetchWorkLog = async () => {
      try {
        const res = await axiosInstance.get(`/api/tasks/${task.id}/worklog/`);
        setWorkLog(res.data);
      } catch (error) {
        console.error("Error loading work log:", error);
      } finally {
        setLoadingWorkLog(false);
      }
    };

    if (activeTab === "Work log") {
      fetchWorkLog();
    }
  }, [task.id, activeTab]);

  const handleSaveDescription = async () => {
    try {
      const res = await axiosInstance.patch(`/api/tasks/${task.id}/`, {
        description: editedDescription.trim(),
      });
      setDescription(res.data.description);
      setEditedDescription(res.data.description);
      setIsEditingDescription(false);
      onSave?.(res.data);
    } catch (error) {
      console.error("Error updating description", error);
    }
  };

  const handleCancelDescription = () => {
    setEditedDescription(description);
    setIsEditingDescription(false);
  };

  const handleDescriptionKeyDown = e => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSaveDescription();
    } else if (e.key === "Escape") {
      handleCancelDescription();
    }
  };

  const handleSave = async () => {
    const trimmed = title.trim();
    if (!trimmed) return;

    const payload = {};
    if (trimmed !== task.title) {
      payload.title = trimmed;
    }
    if (editedDescription.trim() !== (task.description || "").trim()) {
      payload.description = editedDescription.trim();
    }

    if (Object.keys(payload).length === 0) {
      onClose();
      return;
    }

    try {
      const res = await axiosInstance.patch(`/api/tasks/${task.id}/`, payload);
      onSave(res.data);
      onClose();
    } catch (error) {
      console.error("Error updating task", error);
    }
  };

  const isDirty =
    title.trim() !== (task.title || "").trim() ||
    editedDescription.trim() !== (task.description || "").trim();
  const filteredHistory =
    filter === "all" ? history : history.filter(entry => entry.action === filter);
  const TABS = ["Comments", "Git history", "Work log"];

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
              <div className="description-section">
                <h>Description</h>
                {isEditingDescription ? (
                  <div className="edit-description-form">
                    <textarea
                      className="edit-description-textarea"
                      value={editedDescription}
                      onChange={e => setEditedDescription(e.target.value)}
                      rows={4}
                      onKeyDown={handleDescriptionKeyDown}
                      autoFocus
                    />
                    <div className="edit-desc-actions">
                      <button className="action-btn" onClick={handleSaveDescription}>
                        <Check size={18} />
                      </button>
                      <button className="action-btn" onClick={handleCancelDescription}>
                        <X size={18} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    className="description-display"
                    onClick={() => setIsEditingDescription(true)}
                  >
                    <p>
                      {description || (
                        <em className="placeholder">Click to add a description...</em>
                      )}
                    </p>
                  </div>
                )}
              </div>

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
                        <div className="comment-input-section">
                          <CommentEditor
                            onSubmit={async html => {
                              if (!html.trim()) return;
                              try {
                                const res = await axiosInstance.post(
                                  `/api/tasks/${task.id}/comments/`,
                                  { text: html },
                                );
                                setComments(prev => [...prev, res.data]);
                              } catch (error) {
                                console.error("Error adding comment:", error);
                              }
                            }}
                          />
                        </div>
                        <div className="comments-scroll">
                          <div className="comments-list">
                            {comments.length === 0 && <p>There are no comments yet.</p>}
                            {comments.map(c => (
                              <div key={c.id} className="comment-item">
                                <div style={{ display: "flex", justifyContent: "space-between" }}>
                                  <strong>{c.author_username}:</strong>
                                  <small>
                                    {" "}
                                    {new Date(c.created_at).toLocaleDateString("en-EN", {
                                      day: "2-digit",
                                      month: "long",
                                      year: "numeric",
                                    })}{" "}
                                    in{" "}
                                    {new Date(c.created_at).toLocaleTimeString("en-EN", {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                      hour12: false,
                                    })}
                                  </small>
                                </div>
                                <div
                                  className="comment-text"
                                  dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(c.text) }}
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      </>
                    )}
                  </>
                )}

                {activeTab === "Git history" && (
                  <>
                    {loadingHistory ? (
                      <p>Loading history...</p>
                    ) : history.length === 0 ? (
                      <p>No history yet.</p>
                    ) : (
                      <div>
                        <div style={{ marginBottom: "0.5rem" }}>
                          <label htmlFor="filter">Filter</label>{" "}
                          <select
                            id="filter"
                            className="history-filter"
                            value={filter}
                            onChange={e => setFilter(e.target.value)}
                          >
                            <option value="all">All</option>
                            {[...new Set(history.map(h => h.action))].map(action => (
                              <option key={action} value={action}>
                                {action}
                              </option>
                            ))}
                          </select>
                        </div>

                        <ul className="task-history-list">
                          {filteredHistory.map(entry => (
                            <li key={entry.id} className="task-history-item">
                              <div style={{ display: "flex", justifyContent: "space-between" }}>
                                <div
                                  style={{
                                    fontSize: "16px",
                                    color: "#283c60",
                                    fontWeight: "bolder",
                                  }}
                                >
                                  {entry.action}
                                </div>
                                <small>
                                  {" "}
                                  {new Date(entry.created_at).toLocaleDateString("en-EN", {
                                    day: "2-digit",
                                    month: "long",
                                    year: "numeric",
                                  })}{" "}
                                  in{" "}
                                  {new Date(entry.created_at).toLocaleTimeString("en-EN", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    hour12: false,
                                  })}
                                </small>{" "}
                              </div>
                              <div
                                className="history-details"
                                dangerouslySetInnerHTML={{
                                  __html: DOMPurify.sanitize(
                                    entry.details.replace(
                                      /\[([^\]]+)\]\(([^)]+)\)/g,
                                      '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>',
                                    ),
                                  ),
                                }}
                              />
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </>
                )}

                {activeTab === "Work log" && (
                  <>
                    {loadingWorkLog ? (
                      <p>Loading work log...</p>
                    ) : workLog.length === 0 ? (
                      <p>No activity logged yet.</p>
                    ) : (
                      <ul className="task-history-list">
                        {workLog.map(entry => (
                          <li key={entry.id} className="task-history-item">
                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                              <div
                                style={{
                                  fontSize: "16px",
                                  color: "#283c60",
                                }}
                                dangerouslySetInnerHTML={{
                                  __html: DOMPurify.sanitize(entry.action),
                                }}
                              ></div>
                              <small>
                                {new Date(entry.created_at).toLocaleString("en-EN", {
                                  day: "2-digit",
                                  month: "long",
                                  year: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                  hour12: false,
                                })}
                              </small>
                            </div>
                            <div
                              className="history-details"
                              dangerouslySetInnerHTML={{
                                __html: DOMPurify.sanitize(entry.details),
                              }}
                            />
                          </li>
                        ))}
                      </ul>
                    )}
                  </>
                )}
              </div>

              <div className="modal-task-buttons">
                <button
                  className="save-button"
                  onClick={handleSave}
                  disabled={!isDirty}
                  title={!isDirty ? "No changes to save" : "Save changes"}
                >
                  <Check size={18} /> Save
                </button>

                <button className="cancel-task-button" onClick={onClose}>
                  <X size={18} />
                  Cancel
                </button>
              </div>
            </div>

            <aside className="task-sidebar">
              <h4>Details</h4>
              <ul>
                <li>
                  <strong>Owner:</strong> {task.author_username || "—"}
                </li>
                <li>
                  <strong>Marks:</strong> No
                </li>
                <li>
                  <strong>Parent:</strong> No
                </li>
                <li>
                  <strong>Team:</strong> No
                </li>{" "}
                <li>
                  <strong>Development:</strong>
                  <button
                    onClick={async () => {
                      if (!githubRepo) {
                        alert("Repository not set for project.");
                        return;
                      }

                      try {
                        const res = await axiosInstance.post(
                          `/api/tasks/${task.id}/create_github_branch/`,
                          {
                            repo: githubRepo,
                          },
                        );
                        alert(`Branch created:\n${res.data.branch_url}`);
                      } catch (err) {
                        alert("Error creating branch.");
                        console.error(err);
                      }
                    }}
                  >
                    <GitBranchPlus style={{ strokeWidth: "1.5", width: "20" }} /> Create GitHub
                    Branch
                  </button>
                </li>
              </ul>
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditTaskModal;
