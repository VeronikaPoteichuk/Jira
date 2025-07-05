import React, { useState } from "react";
import { Link } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { useProjectBoards } from "../hooks/useProjectBoards";
import { MoreVertical } from "lucide-react";
import { useDeleteModal } from "../hooks/DeleteModalContext";
import "./style.css";
import { useEntityManager } from "../hooks/useEntityManager";
import { useOutsideClickMenu } from "../hooks/useOutsideClickMenu";
import { useHoveredBoard } from "../hooks/HoveredBoardContext"; // импортируем контекст

const ProjectBoardsPage = () => {
  const { boards, loading, error, cleanProjectId, refetch } = useProjectBoards();
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const { hoveredBoardId } = useHoveredBoard(); // получаем hoveredBoardId

  const { creating, createEntity, renameEntity, deleteEntity } = useEntityManager("/api/boards/");
  const { activeId: menuBoardId, toggleMenu, registerRef, closeMenu } = useOutsideClickMenu();
  const { openModal: openDeleteModal } = useDeleteModal();

  const toggleSidebar = () => setSidebarVisible(prev => !prev);

  const handleCreateBoard = async () => {
    const name = prompt("Enter project name:");
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

  if (!cleanProjectId) return <p>Invalid project ID</p>;

  return (
    <div className="project-page">
      <div className="header-project-page">
        <Header onToggleSidebar={toggleSidebar} />
      </div>

      <div className="layout" style={{ display: "flex" }}>
        {sidebarVisible && <Sidebar />}

        <main style={{ padding: 20, flex: 1 }}>
          <h2 style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
            Boards for Project
            <button className="add-board-btn" onClick={handleCreateBoard} disabled={creating}>
              <span className="icon">+</span>
              <span className="text">{creating ? "Creating..." : "Create board"}</span>
            </button>
          </h2>

          {loading && <p>Loading boards...</p>}
          {error && <p style={{ color: "red" }}>{error}</p>}
          {!loading && !error && boards.length === 0 && <p>No boards found.</p>}

          {!loading && !error && boards.length > 0 && (
            <div className="board-grid">
              {boards.map(board => {
                const isHovered = board.id === hoveredBoardId;
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
    </div>
  );
};

export default ProjectBoardsPage;
