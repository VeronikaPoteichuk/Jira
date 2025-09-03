import React, { useEffect, useState } from "react";
import axiosInstance from "../api/axios";
import { useParams, useNavigate } from "react-router-dom";
import "./style.css";
import { LogOut, User } from "lucide-react";
import UserAvatar from "../components/UserAvatar";

const Header = ({ onToggleSidebar }) => {
  const { projectId } = useParams();
  const [projectName, setProjectName] = useState("");
  const [userData, setUserData] = useState(null);
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

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axiosInstance.get("/api/users/me/");
        setUserData(response.data);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, []);

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
      <a href="/profile" type="button" style={{ textDecoration: "none" }}>
        {userData ? (
          <UserAvatar user={userData} size="small" />
        ) : (
          <User className="lr-user-account-btn" />
        )}
      </a>
    </header>
  );
};

export default Header;
