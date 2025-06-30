import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axiosInstance from "../api/axios";
import Sidebar from "./Sidebar";
import Header from "./Header";
import "./style.css";

const ProjectBoardsPage = () => {
  const { projectId } = useParams();
  const [boards, setBoards] = useState([]);
  const [projectName, setProjectName] = useState("");
  const [loading, setLoading] = useState(true);
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [error, setError] = useState(null);

  const cleanProjectId = projectId?.match(/^project-(\d+)$/)?.[1] || "";

  if (!cleanProjectId) {
    return <p>Invalid project ID</p>;
  }

  const toggleSidebar = () => {
    setSidebarVisible(prev => !prev);
  };

  useEffect(() => {
    const fetchProjectBoards = async () => {
      if (!cleanProjectId) {
        console.error("Invalid project ID");
        return;
      }

      try {
        console.log("Fetching boards for project:", cleanProjectId);

        const boardsRes = await axiosInstance.get(`/api/projects/${cleanProjectId}/boards/`);

        setBoards(boardsRes.data);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError("Failed to load project boards.");
        setLoading(false);
      }
    };

    fetchProjectBoards();
  }, [cleanProjectId]);

  return (
    <div className="project-page">
      <div className="header-project-page">
        <Header onToggleSidebar={toggleSidebar} />
      </div>

      <div className="layout" style={{ display: "flex" }}>
        {sidebarVisible && <Sidebar />}

        <main style={{ padding: 20, flex: 1 }}>
          <h1>Boards for Project: {projectName}</h1>

          {loading && <p>Loading boards...</p>}
          {error && <p style={{ color: "red" }}>{error}</p>}

          {!loading && !error && boards.length === 0 && <p>No boards found for this project.</p>}

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
