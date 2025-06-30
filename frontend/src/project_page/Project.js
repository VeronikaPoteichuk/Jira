import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import axiosInstance from "../api/axios";
import "./style.css";

const Projects = () => {
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const toggleSidebar = () => {
    setSidebarVisible(prev => !prev);
  };

  useEffect(() => {
    axiosInstance
      .get("/api/projects/")
      .then(res => {
        setProjects(res.data);
        setLoading(false);
      })
      .catch(err => {
        setError("Failed to load projects");
        setLoading(false);
      });
  }, []);

  return (
    <div className="project-page">
      <div className="header-project-page">
        <Header onToggleSidebar={toggleSidebar} />
      </div>

      <div className="layout" style={{ display: "flex" }}>
        {sidebarVisible && <Sidebar />}

        <main style={{ padding: 20, flex: 1 }}>
          <h1>Projects</h1>

          {loading && <p>Loading projects...</p>}
          {error && <p style={{ color: "red" }}>{error}</p>}

          {!loading && !error && projects.length === 0 && <p>No projects found.</p>}

          {!loading && !error && projects.length > 0 && (
            <ul>
              {projects.map(project => (
                <li key={project.id} style={{ marginBottom: 8 }}>
                  <Link to={`/project-page/project-${project.id}`}>{project.name}</Link>
                </li>
              ))}
            </ul>
          )}
        </main>
      </div>
    </div>
  );
};

export default Projects;
