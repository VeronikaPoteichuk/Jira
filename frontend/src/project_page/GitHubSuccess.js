import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const GitHubSuccess = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (token) {
      localStorage.setItem("github_token", token);
      alert("Authorization via GitHub was successful!");
    } else {
      alert("Authorization error via GitHub");
    }

    navigate(-1);
  }, [navigate]);

  return <div>Completing authorization via GitHub...</div>;
};

export default GitHubSuccess;
