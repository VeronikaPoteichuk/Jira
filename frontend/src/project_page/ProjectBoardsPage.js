import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import axiosInstance from "../api/axios";
import { useProjectBoards } from "../hooks/useProjectBoards";
import { MoreVertical } from "lucide-react";
import { useDeleteModal } from "../hooks/DeleteModalContext";
import { useEntityManager } from "../hooks/useEntityManager";
import { useOutsideClickMenu } from "../hooks/useOutsideClickMenu";
import { useHoveredEntity } from "../hooks/HoveredEntityContext";
import { X, Check, Settings } from "lucide-react";
import "./style.css";
import ProjectSettings from "./ProjectSettings";
import Modal from "./Modal";

const ProjectBoardsPage = () => {
  const { boards, project, loading, error, cleanProjectId, refetch } = useProjectBoards();
  const { creating, createEntity, renameEntity, deleteEntity } = useEntityManager("/api/boards/");
  const { activeId: menuBoardId, toggleMenu, registerRef, closeMenu } = useOutsideClickMenu();
  const { openModal: openDeleteModal } = useDeleteModal();
  const { hoveredEntity } = useHoveredEntity();

  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [editedDescription, setEditedDescription] = useState("");
  const [settingsOpen, setSettingsOpen] = useState(false);

  const toggleSidebar = () => setSidebarVisible(prev => !prev);

  const handleCreateBoard = async () => {
    const name = prompt("Enter board name:");
    if (!name || !name.trim()) return;
    await createEntity({ name: name.trim(), project: cleanProjectId });
    refetch();
  };

  const handleRenameBoard = async id => {
    const newName = prompt("Enter new board name:");
    if (!newName) return;
    await renameEntity(id, newName);
    refetch();
  };

  const handleDeleteBoard = async board => {
    await deleteEntity(board.id);
    refetch();
  };
  const handleSaveDescription = async () => {
    try {
      await axiosInstance.patch(`/api/projects/${cleanProjectId}/`, {
        description: editedDescription,
      });
      setIsEditingDescription(false);
      refetch();
    } catch (err) {
      console.error("Failed to update description:", err);
    }
  };

  if (!cleanProjectId) return <p>Invalid project ID</p>;

  return (
    <div className="project-page">
      <div className="header-project-page">
        <Header onToggleSidebar={toggleSidebar} />
      </div>

      <div className="layout" style={{ display: "flex" }}>
        {sidebarVisible && <Sidebar />}

        <main style={{ padding: 20, flex: 1 }}>
          <div className="project-header">
            <h2>
              Boards for Project
              <button className="add-board-btn" onClick={handleCreateBoard} disabled={creating}>
                <span className="icon">+</span>
                <span className="text">{creating ? "Creating..." : "Create board"}</span>
              </button>
            </h2>
            <button className="settings-project-btn" onClick={() => setSettingsOpen(true)}>
              <Settings />
            </button>
          </div>

          {isEditingDescription ? (
            <div>
              <textarea
                value={editedDescription}
                onChange={e => setEditedDescription(e.target.value)}
                rows={3}
                className="description-textarea"
              />
              <div className="edit-description-actions">
                <button className="action-btn-save" onClick={handleSaveDescription}>
                  <Check />
                </button>
                <button
                  className="action-btn-cancel"
                  onClick={() => setIsEditingDescription(false)}
                >
                  <X />
                </button>
              </div>
            </div>
          ) : (
            <div
              className="project-description"
              onClick={() => {
                setEditedDescription(project?.description || "");
                setIsEditingDescription(true);
              }}
              title="Click to edit"
            >
              {project?.description || <i>Click to add a description...</i>}
            </div>
          )}

          {loading && <p>Loading boards...</p>}
          {error && <p style={{ color: "red" }}>{error}</p>}
          {!loading && !error && boards.length === 0 && <p>No boards found.</p>}

          {!loading && !error && boards.length > 0 && (
            <div className="board-grid">
              {boards.map(board => {
                const isHovered = hoveredEntity.type === "board" && hoveredEntity.id === board.id;

                return (
                  <div
                    key={board.id}
                    className={`board-card ${isHovered ? "hovered-from-sidebar" : ""}`}
                  >
                    <Link
                      to={`/project-page/project-${cleanProjectId}/board-${board.id}`}
                      className="board-content"
                    >
                      <div className="board-name">{board.name}</div>
                      <div className="task-count">{board.task_count ?? 0} tasks</div>
                    </Link>

                    <div className="board-actions" ref={el => registerRef(board.id, el)}>
                      <button
                        className="menu-button"
                        onClick={e => {
                          e.preventDefault();
                          toggleMenu(board.id);
                        }}
                      >
                        <MoreVertical size={16} />
                      </button>

                      {menuBoardId === board.id && (
                        <div className="action-menu">
                          <button onClick={() => handleRenameBoard(board.id)}>Rename</button>
                          <button
                            onClick={() => {
                              openDeleteModal(
                                board,
                                handleDeleteBoard,
                                board => `board "${board.name}"`,
                              );
                              closeMenu();
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>
      <Modal isOpen={settingsOpen} onClose={() => setSettingsOpen(false)}>
        <ProjectSettings projectId={cleanProjectId} />
      </Modal>
    </div>
  );
};

export default ProjectBoardsPage;
