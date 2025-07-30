import React, { useEffect, useState } from "react";
import axiosInstance from "../api/axios";
import { useParams, useNavigate } from "react-router-dom";
import "./style.css";
import { LogOut } from "lucide-react";

const Header = ({ onToggleSidebar }) => {
  const { projectId } = useParams();
  const [projectName, setProjectName] = useState("");
  const navigate = useNavigate();

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

  const handleLogout = async e => {
    if (e && e.preventDefault) e.preventDefault();
    const refresh = localStorage.getItem("refresh");
    try {
      if (refresh) {
        await axiosInstance.post("/api/auth/logout/", { refresh });
      } else {
        console.warn("No refresh in localStorage");
      }
    } catch (err) {
      alert("Logout error: " + (err?.response?.data?.detail || err.message));
      console.error("Logout error:", err);
    }
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    navigate("/auth");
  };

  return (
    <header className="header">
      <button className="menu-button" onClick={onToggleSidebar}>
        ☰
      </button>
      <a href="/project-page" className="header-title">
        {projectName || "Jira-like system"}
      </a>
      <button className="logout-button" type="button" onClick={handleLogout}>
        <LogOut className="lr-logout-btn" /> Logout
      </button>
    </header>
  );
};

export default Header;
