import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "./style.css";
import { useProjectBoards } from "../hooks/useProjectBoards";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useHoveredBoard } from "../hooks/HoveredBoardContext";

const Sidebar = () => {
  const { boards, loading, error, cleanProjectId } = useProjectBoards();
  const [isBoardsOpen, setIsBoardsOpen] = useState(false);
  const location = useLocation();
  const { setHoveredBoardId } = useHoveredBoard();

  if (!cleanProjectId) return <p>Invalid project ID</p>;

  return (
    <aside className="sidebar">
      <nav>
        <dl className="sidebar-nav">
          <dt
            onClick={() => setIsBoardsOpen(prev => !prev)}
            style={{ cursor: "pointer", userSelect: "none" }}
          >
            📋 Board {isBoardsOpen ? <ChevronDown /> : <ChevronRight />}
          </dt>

          {isBoardsOpen &&
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

          <dt>📈 Reports</dt>
          <dt>⚙️ Settings</dt>
        </dl>
      </nav>
    </aside>
  );
};

export default Sidebar;
