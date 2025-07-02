import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { useProjectBoards } from "../hooks/useProjectBoards";
import axiosInstance from "../api/axios";
import { MoreVertical } from "lucide-react";
import { useDeleteModal } from "../hooks/DeleteModalContext";
import "./style.css";

const ProjectBoardsPage = () => {
  const { boards, loading, error, cleanProjectId, refetch } = useProjectBoards();
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [creating, setCreating] = useState(false);
  const [menuBoardId, setMenuBoardId] = useState(null);
  const menuRefs = useRef({});

  const { openModal: openDeleteModal } = useDeleteModal();

  const toggleSidebar = () => setSidebarVisible(prev => !prev);

  const handleCreateBoard = async () => {
    const name = prompt("Enter board name:");
    if (!name || !name.trim()) return;

    try {
      setCreating(true);
      await axiosInstance.post("/api/boards/", {
        name: name.trim(),
        project: cleanProjectId,
      });
      await refetch();
    } catch (error) {
      console.error(error);
      alert("Failed to create board");
    } finally {
      setCreating(false);
    }
  };

  const handleRenameBoard = async id => {
    const newName = prompt("Enter new board name:");
    if (!newName) return;

    try {
      await axiosInstance.patch(`/api/boards/${id}/`, { name: newName });
      await refetch();
    } catch (err) {
      console.error(err);
      alert("Rename failed");
    }
  };

  const handleDeleteBoard = async board => {
    try {
      await axiosInstance.delete(`/api/boards/${board.id}/`);
      await refetch();
    } catch (err) {
      console.error(err);
      alert("Delete failed");
    }
  };

  useEffect(() => {
    const handleClickOutside = e => {
      if (
        menuBoardId &&
        menuRefs.current[menuBoardId] &&
        !menuRefs.current[menuBoardId].contains(e.target)
      ) {
        setMenuBoardId(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuBoardId]);

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
              {boards.map(board => (
                <div key={board.id} className="board-card">
                  <Link
                    to={`/project-page/project-${cleanProjectId}/board-${board.id}`}
                    className="board-content"
                  >
                    <div className="board-name">{board.name}</div>
                    <div className="task-count">{board.task_count ?? 0} tasks</div>
                  </Link>

                  <div className="board-actions" ref={el => (menuRefs.current[board.id] = el)}>
                    <button
                      className="menu-button"
                      onClick={e => {
                        e.preventDefault();
                        setMenuBoardId(prev => (prev === board.id ? null : board.id));
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
                            setMenuBoardId(null);
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default ProjectBoardsPage;
