import React from "react";
import "./style.css";
import { useNavigate } from "react-router-dom";
import aboutImage from "../assets/pictures/about-jira-service-management.png";

const HomePage = () => {
  const navigate = useNavigate();

  const handleLoginSubmit = async () => {
    navigate("/auth");
  };

  return (
    <div className="homepage-container">
      <div className="homepage-card">
        <header className="homepage-header">
          <div className="logo">Jira-like</div>
          <nav className="nav-links">
            <a href="#">Home</a>
            <a href="#">Features</a>
            <a href="#">Contact</a>
          </nav>
          <div className="auth-buttons">
            <button className="main-login" onClick={handleLoginSubmit}>
              Log in
            </button>
            <button className="main-signup" onClick={handleLoginSubmit}>
              Sign up
            </button>
          </div>
        </header>

        <main className="homepage-main">
          <div className="text-section">
            <h1 className="main-heading">
              Organize your team’s work
              <br />
              with a powerful board.
            </h1>
            <p className="description">
              Create tasks, assign them, track progress and stay focused with a collaborative
              workspace.
            </p>
            <div className="cta-buttons">
              <button className="try-btn" onClick={handleLoginSubmit}>
                Try it!
              </button>
            </div>
          </div>
          <div className="image-section">
            <img src={aboutImage} alt="Project Collaboration" />
          </div>
        </main>

        <footer className="homepage-footer">
          <section className="features-section">
            <h2 className="features-title">Why choose Jira-like?</h2>
            <div className="features-list">
              <div className="feature-card fade-in-up">
                <h3>Visual Kanban Boards</h3>
                <p>Organize work using easy-to-use drag-and-drop boards for teams.</p>
              </div>
              <div className="feature-card fade-in-up">
                <h3>Real-time Collaboration</h3>
                <p>Update tasks live and sync with your team instantly.</p>
              </div>
              <div className="feature-card fade-in-up">
                <h3>Task Prioritization</h3>
                <p>Set priorities, deadlines and stay productive.</p>
              </div>
            </div>
          </section>
        </footer>
      </div>
    </div>
  );
};

export default HomePage;
