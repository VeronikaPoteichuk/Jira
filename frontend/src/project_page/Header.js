import React, { useEffect, useState } from "react";
import axiosInstance from "../api/axios";
import { useParams } from "react-router-dom";
import "./style.css";

const Header = ({ onToggleSidebar }) => {
  const { projectId } = useParams();
  const [projectName, setProjectName] = useState("");

  useEffect(() => {
    if (!projectId) return;
    const cleanProjectId = projectId.replace(/^project-/, "");

    axiosInstance
      .get(`/api/projects/${cleanProjectId}/`)
      .then(res => setProjectName(res.data.name))
      .catch(err => {
        console.error("Failed to fetch project", err);
        setProjectName("Project");
      });
  }, [projectId]);

  return (
    <header className="header">
      <button className="menu-button" onClick={onToggleSidebar}>
        ☰
      </button>
      <a href="/project-page" className="header-title">
        {projectName || "Jira-like system"}
      </a>
    </header>
  );
};

export default Header;
