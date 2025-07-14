import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import axiosInstance from "../api/axios";
import "./style.css";

const extractUserRepo = url => {
  const match = url.match(/^https:\/\/github\.com\/([^/]+)\/([^/]+)(\.git)?$/i);
  if (!match) return null;
  return `${match[1]}/${match[2].replace(/\.git$/, "")}`;
};

const ProjectSettings = ({ projectId }) => {
  const [repoUrl, setRepoUrl] = useState("");
  const [initialRepoUrl, setInitialRepoUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState("");

  const [isGitHubAuthorized, setIsGitHubAuthorized] = useState(false);
  const [githubUsername, setGitHubUsername] = useState("");

  const [members, setMembers] = useState([]);
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [addMemberError, setAddMemberError] = useState("");
  const [addMemberSuccess, setAddMemberSuccess] = useState("");
  const [isAddingMember, setIsAddingMember] = useState(false);

  const handleAddMember = async e => {
    e.preventDefault();
    setAddMemberError("");
    setAddMemberSuccess("");
    setIsAddingMember(true);
    try {
      const res = await axiosInstance.post(`/api/projects/${projectId}/add-member/`, {
        email: newMemberEmail,
      });
      setAddMemberSuccess(res.data.detail || "User added!");
      setNewMemberEmail("");
      const projectRes = await axiosInstance.get(`/api/projects/${projectId}/`);
      setMembers(projectRes.data.members || []);
    } catch (err) {
      setAddMemberError(
        err.response?.data?.detail ||
          "Failed to add user. Make sure the email is correct and you are the project creator.",
      );
    } finally {
      setIsAddingMember(false);
    }
  };

  const handleRemoveMember = async email => {
    if (!window.confirm(`Remove ${email} from project members?`)) return;
    try {
      await axiosInstance.post(`/api/projects/${projectId}/remove-member/`, { email });
      setMembers(members.filter(m => m !== email));
    } catch (err) {
      alert(
        err.response?.data?.detail || "Failed to remove user. Only the creator can remove members.",
      );
    }
  };

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const res = await axiosInstance.get(`/api/projects/${projectId}/`);
        const savedRepo = res.data.github_repo || "";
        setRepoUrl(savedRepo ? `https://github.com/${savedRepo}` : "");
        setInitialRepoUrl(res.data.github_repo || "");
        setMembers(res.data.members || []);
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
      if (!token) throw new Error("Missing GitHub token. Please sign in.");

      const userRepo = extractUserRepo(repoUrl);
      if (!userRepo) throw new Error("Invalid GitHub URL format.");

      const res = await axiosInstance.post("/api/github/validate_repo_access/", {
        repo: userRepo,
        token,
      });

      if (!res.data.valid) {
        throw new Error("The repository cannot be accessed or does not exist.");
      }

      return true;
    } catch (err) {
      console.error("Validation error:", err);
      setValidationError(err.message || "Validation failed.");
      return false;
    } finally {
      setIsValidating(false);
    }
  };

  const handleSave = async () => {
    const isValid = await validateRepoAccess();
    if (!isValid) return;

    try {
      const userRepo = extractUserRepo(repoUrl);
      await axiosInstance.patch(`/api/projects/${projectId}/`, {
        github_repo: userRepo,
      });
      alert("The repository was saved successfully!");
      setInitialRepoUrl(userRepo);
    } catch (err) {
      alert("Error saving repository.");
      console.error(err);
    }
  };

  if (loading) return <div>Loading settings...</div>;

  return (
    <div className="project-settings">
      <h2>Project settings</h2>
      <table className="settings-table">
        <tbody>
          <tr>
            <td>GitHub</td>
            <td colSpan={2}>
              {isGitHubAuthorized ? (
                <span className="github-status authorized">
                  ✅ Signed in as <strong>{githubUsername}</strong>
                </span>
              ) : (
                <span className="github-status not-authorized">
                  ❌ Not signed in{" "}
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
            </td>
          </tr>

          <tr>
            <td>GitHub repository URL</td>
            <td>
              <input
                type="text"
                value={repoUrl}
                onChange={e => setRepoUrl(e.target.value)}
                placeholder="https://github.com/user/repo.git"
                disabled={!isGitHubAuthorized}
              />
              {!isGitHubAuthorized && (
                <p className="disabled-hint">Please sign in to GitHub to link a repository.</p>
              )}
              {validationError && <div className="error-message">{validationError}</div>}
            </td>
            <td>
              <button
                onClick={handleSave}
                disabled={
                  extractUserRepo(repoUrl) === initialRepoUrl || isValidating || !isGitHubAuthorized
                }
              >
                {isValidating ? "Access check..." : "Save"}
              </button>
            </td>
          </tr>

          <tr>
            <td>Project members</td>
            <td colSpan={2}>
              <form
                className="add-member-form"
                onSubmit={handleAddMember}
                style={{ display: "flex", gap: 12 }}
              >
                <input
                  type="email"
                  placeholder="Add member by email"
                  value={newMemberEmail}
                  onChange={e => setNewMemberEmail(e.target.value)}
                  required
                  disabled={isAddingMember}
                  style={{ width: "400px", marginRight: "0.5rem" }}
                />
                <button type="submit" disabled={isAddingMember || !newMemberEmail}>
                  {isAddingMember ? "Adding..." : "Add"}
                </button>
              </form>
              {addMemberError && <div className="error-message">{addMemberError}</div>}
              {addMemberSuccess && <div className="success-message">{addMemberSuccess}</div>}
            </td>
          </tr>

          <tr>
            <td>Current members</td>
            <td colSpan={2}>
              <ul className="members-list">
                {members.length === 0 ? (
                  <li>No members yet.</li>
                ) : (
                  members.map(email => (
                    <li
                      key={email}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <span>{email}</span>
                      <button
                        type="button"
                        className="remove-member-btn"
                        onClick={() => handleRemoveMember(email)}
                      >
                        Remove
                      </button>
                    </li>
                  ))
                )}
              </ul>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default ProjectSettings;
