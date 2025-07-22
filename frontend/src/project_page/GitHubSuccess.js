import React, { useEffect } from "react";

const GitHubSuccess = () => {
  useEffect(() => {
    alert("Authorization via GitHub was successful!");
  }, []);

  return (
    <div style={{ padding: "100px", textAlign: "center" }}>
      <h2>Authorization with GitHub was successful.</h2>
      <p>You can close this page and return to your project.</p>
    </div>
  );
};

export default GitHubSuccess;
