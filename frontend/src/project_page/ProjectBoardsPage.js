import React from "react";
import { Link } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import "./style.css";
import { useProjectBoards } from "../hooks/useProjectBoards";

const ProjectBoardsPage = () => {
  const { boards, loading, error, cleanProjectId } = useProjectBoards();

  const [sidebarVisible, setSidebarVisible] = React.useState(true);

  const toggleSidebar = () => {
    setSidebarVisible(prev => !prev);
  };

  if (!cleanProjectId) {
    return <p>Invalid project ID</p>;
  }

  return (
    <div className="project-page">
      <div className="header-project-page">
        <Header onToggleSidebar={toggleSidebar} />
      </div>

      <div className="layout" style={{ display: "flex" }}>
        {sidebarVisible && <Sidebar />}

        <main style={{ padding: 20, flex: 1 }}>
          <h1>Boards for Project</h1>

          {loading && <p>Loading boards...</p>}
          {error && <p style={{ color: "red" }}>{error}</p>}
          {!loading && !error && boards.length === 0 && <p>No boards found.</p>}

          {!loading && !error && boards.length > 0 && (
            <ul>
              {boards.map(board => (
                <li key={board.id} style={{ marginBottom: 8 }}>
                  <Link to={`/project-page/project-${cleanProjectId}/board-${board.id}`}>
                    {board.name}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </main>
      </div>
    </div>
  );
};

export default ProjectBoardsPage;
