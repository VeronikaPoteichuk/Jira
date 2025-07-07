import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useProjectBoards } from "../hooks/useProjectBoards";
import { useProjects } from "../hooks/useProjects";
import { useHoveredEntity } from "../hooks/HoveredEntityContext";
import {
  ChevronDown,
  ChevronRight,
  ClipboardList,
  ChartBarBig,
  ChartNoAxesCombined,
} from "lucide-react";
import "./style.css";

const Sidebar = () => {
  const { boards, cleanProjectId } = useProjectBoards();
  const { projects } = useProjects();
  const { setHoveredProjectId, setHoveredBoardId } = useHoveredEntity();
  const location = useLocation();

  const [isBoardsOpen, setIsBoardsOpen] = useState(() => {
    const stored = localStorage.getItem("isBoardsOpen");
    return stored === null ? false : stored === "true";
  });

  const [isProjectsOpen, setIsProjectsOpen] = useState(() => {
    const stored = localStorage.getItem("isProjectsOpen");
    return stored === null ? true : stored === "true";
  });

  return (
    <aside className="sidebar">
      <nav>
        <dl className="sidebar-nav">
          {/* Projects */}
          <dt
            onClick={() => {
              setIsProjectsOpen(prev => {
                localStorage.setItem("isProjectsOpen", String(!prev));
                return !prev;
              });
            }}
            style={{ cursor: "pointer", userSelect: "none" }}
          >
            <ClipboardList /> Projects {isProjectsOpen ? <ChevronDown /> : <ChevronRight />}
          </dt>

          {isProjectsOpen &&
            projects.map(project => {
              const match = location.pathname.match(/project-(\d+)/);
              const activeProjectId = match ? Number(match[1]) : null;
              const isActive = project.id === activeProjectId;

              return (
                <dd
                  key={project.id}
                  className={isActive ? "active" : ""}
                  onMouseEnter={() => setHoveredProjectId(project.id)}
                  onMouseLeave={() => setHoveredProjectId(null)}
                >
                  <Link
                    to={`/project-page/project-${project.id}`}
                    className={isActive ? "active-link" : ""}
                  >
                    {project.name}
                  </Link>
                </dd>
              );
            })}

          {/* Boards */}
          <dt
            onClick={() => {
              setIsBoardsOpen(prev => {
                localStorage.setItem("isBoardsOpen", String(!prev));
                return !prev;
              });
            }}
            style={{ cursor: "pointer", userSelect: "none" }}
          >
            <ChartBarBig /> Boards {isBoardsOpen ? <ChevronDown /> : <ChevronRight />}
          </dt>

          {isBoardsOpen && !cleanProjectId && (
            <dd style={{ paddingLeft: "1rem", color: "#888" }}>Сначала выберите проект</dd>
          )}

          {isBoardsOpen &&
            cleanProjectId &&
            boards.map(board => {
              const path = `/project-page/project-${cleanProjectId}/board-${board.id}`;
              const isActive = location.pathname === path;

              return (
                <dd
                  key={board.id}
                  className={isActive ? "active" : ""}
                  onMouseEnter={() => setHoveredBoardId(board.id)}
                  onMouseLeave={() => setHoveredBoardId(null)}
                >
                  <Link to={path} className={isActive ? "active-link" : ""}>
                    {board.name}
                  </Link>
                </dd>
              );
            })}

          {/* Other */}
          <dt>
            <ChartNoAxesCombined /> Reports
          </dt>
          {/* <dt>⚙️ Settings</dt> */}
        </dl>
      </nav>
    </aside>
  );
};

export default Sidebar;
