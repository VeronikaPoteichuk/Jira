import React, { useEffect, useState } from "react";
import axiosInstance from "../api/axios";
import "./style.css";

const Header = ({ projectId, onToggleSidebar }) => {
  const [projectName, setProjectName] = useState("...");

  useEffect(() => {
    axiosInstance
      .get(`/api/projects/1/`)
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
      <h1 className="header-title">{projectName}</h1>
    </header>
  );
};

export default Header;
