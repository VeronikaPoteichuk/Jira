import React, { useState, useEffect } from "react";
import axiosInstance from "../api/axios";
import "./style.css";

const ProjectSettings = ({ projectId }) => {
  const [githubRepo, setGithubRepo] = useState("");
  const [initialRepo, setInitialRepo] = useState("");
  const [loading, setLoading] = useState(true);
  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState("");

  const [isGitHubAuthorized, setIsGitHubAuthorized] = useState(false);
  const [githubUsername, setGitHubUsername] = useState("");

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const res = await axiosInstance.get(`/api/projects/${projectId}/`);
        setGithubRepo(res.data.github_repo || "");
        setInitialRepo(res.data.github_repo || "");
      } catch (err) {
        console.error("Project loading error:", err);
      } finally {
        setLoading(false);
      }
    };

    const checkGitHubAuth = async () => {
      const token = localStorage.getItem("github_token");
      if (!token) {
        setIsGitHubAuthorized(false);
        return;
      }

      try {
        const res = await axiosInstance.get(`/api/github/user-info/?token=${token}`);
        if (res.data.login) {
          setGitHubUsername(res.data.login);
          setIsGitHubAuthorized(true);
        } else {
          setIsGitHubAuthorized(false);
        }
      } catch (err) {
        console.error("Failed to fetch GitHub user:", err);
        setIsGitHubAuthorized(false);
      }
    };

    fetchProject();
    checkGitHubAuth();
  }, [projectId]);

  const validateRepoAccess = async () => {
    setIsValidating(true);
    setValidationError("");

    try {
      const token = localStorage.getItem("github_token");

      if (!token) {
        throw new Error("Missing GitHub token. Please sign in.");
      }

      const res = await axiosInstance.post("/api/github/validate_repo_access/", {
        repo: githubRepo,
        token,
      });

      if (!res.data.valid) {
        throw new Error("The repository cannot be accessed or does not exist.");
      }

      return true;
    } catch (err) {
      console.error("Validation error:", err);
      setValidationError("Unable to access repository. Make sure it exists and you are logged in.");
      return false;
    } finally {
      setIsValidating(false);
    }
  };

  const handleSave = async () => {
    const isValid = await validateRepoAccess();
    if (!isValid) return;

    try {
      await axiosInstance.patch(`/api/projects/${projectId}/`, {
        github_repo: githubRepo,
      });
      alert("The repository was saved successfully!");
      setInitialRepo(githubRepo);
    } catch (err) {
      alert("Error saving repository.");
      console.error(err);
    }
  };

  if (loading) return <div>Loading settings...</div>;

  return (
    <div className="project-settings">
      <h2>Project settings</h2>

      <div className="github-login-block">
        <div
        // href="http://localhost:8000/api/github/login/"
        // target="_blank"
        // rel="noopener noreferrer"
        // className="github-login-link"
        >
          GitHub
        </div>
        <div style={{ marginTop: "0.5rem" }}>
          {isGitHubAuthorized ? (
            <span className="github-status authorized">
              ✅ Signed in as <strong>{githubUsername}</strong>
            </span>
          ) : (
            <span className="github-status not-authorized">
              ❌ Not signed in
              <a
                href="http://localhost:8000/api/github/login/"
                target="_blank"
                rel="noopener noreferrer"
                className="github-login-link"
              >
                Add GitHub
              </a>
            </span>
          )}
        </div>
      </div>

      <div className="repo-input-block">
        <label>GitHub repository (user/repo):</label>
        <input
          type="text"
          value={githubRepo}
          onChange={e => setGithubRepo(e.target.value)}
          placeholder="for example, VeronikaPoteichuk/Blog"
          disabled={!isGitHubAuthorized}
        />
        {!isGitHubAuthorized && (
          <p className="disabled-hint">Please sign in to GitHub to link a repository.</p>
        )}
      </div>

      {validationError && <div className="error-message">{validationError}</div>}

      <button
        onClick={handleSave}
        disabled={githubRepo === initialRepo || isValidating || !isGitHubAuthorized}
        className="save-button"
      >
        {isValidating ? "Access check..." : "Save"}
      </button>
    </div>
  );
};

export default ProjectSettings;
