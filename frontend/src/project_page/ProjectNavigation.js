import React from "react";
import "./style.css";

const tabs = ["Board", "Tasks", "Files", "Settings"];

const ProjectNavigation = ({ activeTab, onTabChange }) => {
  return (
    <nav className="project-navigation">
      <ul className="project-nav-tabs">
        {tabs.map(tab => (
          <li
            key={tab}
            className={`project-nav-tab ${activeTab === tab ? "active" : ""}`}
            onClick={() => onTabChange(tab)}
          >
            {tab}
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default ProjectNavigation;
