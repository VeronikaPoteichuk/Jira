import React, { useState } from "react";
import { Link } from "react-router-dom";
import Header from "./Header";
import Sidebar from "./Sidebar";
import { MoreVertical } from "lucide-react";
import { useDeleteModal } from "../hooks/DeleteModalContext";
import { useEntityManager } from "../hooks/useEntityManager";
import { useOutsideClickMenu } from "../hooks/useOutsideClickMenu";
import { useHoveredEntity } from "../hooks/HoveredEntityContext";
import "./style.css";

const Projects = () => {
  const { openModal: openDeleteModal } = useDeleteModal();
  const {
    entities: projects,
    loading,
    creating,
    error,
    createEntity,
    renameEntity,
    deleteEntity,
  } = useEntityManager("/api/projects/");
  const { activeId: menuProjectId, toggleMenu, registerRef, closeMenu } = useOutsideClickMenu();
  const { hoveredEntity } = useHoveredEntity();
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const toggleSidebar = () => setSidebarVisible(prev => !prev);

  const handleCreateProject = async () => {
    const name = prompt("Enter project name:");
    if (!name || !name.trim()) return;
    await createEntity({ name: name.trim(), description: "" });
  };

  const handleRenameProject = async id => {
    const newName = prompt("Enter new project name:");
    if (!newName) return;
    await renameEntity(id, newName);
  };

  const handleDeleteProject = async project => {
    await deleteEntity(project.id);
  };

  return (
    <div className="project-page">
      <div className="header-project-page">
        {/* <Header /> */}
        <Header onToggleSidebar={toggleSidebar} />
      </div>

      <div className="layout" style={{ display: "flex" }}>
        {sidebarVisible && <Sidebar />}

        <main style={{ padding: 20, flex: 1 }}>
          <h2 style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
            Projects
            <button className="add-board-btn" onClick={handleCreateProject} disabled={creating}>
              <span className="icon">+</span>
              <span className="text">{creating ? "Creating..." : "Create project"}</span>
            </button>
          </h2>

          {loading && <p>Loading projects...</p>}
          {error && <p style={{ color: "red" }}>{error}</p>}

          {!loading && !error && projects.length === 0 && <p>No projects found.</p>}

          {!loading && !error && projects.length > 0 && (
            <div className="project-grid">
              {/* {projects.map(project => ( */}
              {projects.map(project => {
                const isHovered =
                  hoveredEntity.type === "project" && hoveredEntity.id === project.id;

                return (
                  <div
                    key={project.id}
                    className={`project-card ${isHovered ? "hovered-from-sidebar" : ""}`}
                  >
                    <Link to={`/project-page/project-${project.id}`} className="project-content">
                      <div className="project-name">{project.name}</div>
                      <div className="board-count">{project.board_count ?? 0} boards</div>
                    </Link>

                    <div className="project-actions" ref={el => registerRef(project.id, el)}>
                      <button
                        className="menu-button"
                        onClick={e => {
                          e.preventDefault();
                          toggleMenu(project.id);
                        }}
                      >
                        <MoreVertical size={16} />
                      </button>

                      {menuProjectId === project.id && (
                        <div className="action-menu">
                          <button onClick={() => handleRenameProject(project.id)}>Rename</button>
                          <button
                            onClick={() => {
                              openDeleteModal(
                                project,
                                handleDeleteProject,
                                project => `project "${project.name}"`,
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

export default Projects;
