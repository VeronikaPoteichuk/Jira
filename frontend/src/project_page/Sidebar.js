import React from "react";
import "./style.css";

const Sidebar = () => {
  return (
    <aside className="sidebar">
      <nav>
        <ul className="sidebar-nav">
          <li>📋 Board</li>
          <li>📈 Reports</li>
          <li>⚙️ Settings</li>
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
