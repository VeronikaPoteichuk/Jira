import React, { useState } from "react";
import { useParams } from "react-router-dom";
import Board from "../boards/Board";
import Sidebar from "./Sidebar";
import Header from "./Header";
import ProjectNavigation from "./ProjectNavigation";
import ProjectTasks from "./ProjectTasks";
import ProjectSettings from "./ProjectSettings";
import "./style.css";

const ProjectPage = () => {
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [activeTab, setActiveTab] = useState("Board");
  const { projectId } = useParams();
  const cleanProjectId = projectId.replace(/^project-/, "");

  const toggleSidebar = () => {
    setSidebarVisible(prev => !prev);
  };

  const renderContent = () => {
    switch (activeTab) {
      case "Board":
        return <Board projectId={cleanProjectId} />;
      case "Tasks":
        return <ProjectTasks projectId={cleanProjectId} />;
      case "Settings":
        return <ProjectSettings projectId={cleanProjectId} />;
      default:
        return <div>Section under development...</div>;
    }
  };

  return (
    <div className="project-page">
      <div className="header-project-page">
        <Header onToggleSidebar={toggleSidebar} />
      </div>
      <div className="layout">
        {sidebarVisible && <Sidebar />}
        <main className="main-content">
          <ProjectNavigation activeTab={activeTab} onTabChange={setActiveTab} />
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default ProjectPage;
