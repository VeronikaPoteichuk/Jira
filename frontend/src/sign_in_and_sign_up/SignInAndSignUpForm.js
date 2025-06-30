import React, { useRef, useState } from "react";
import axiosInstance from "../api/axios";
import "./style.css";
import { GoogleOAuthProvider, useGoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";

const AuthFormContent = () => {
  const sliderRef = useRef(null);
  const formSectionRef = useRef(null);
  const navigate = useNavigate();

  const [loginData, setLoginData] = useState({ username: "", password: "" });
  const [signupData, setSignupData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [signupError, setSignupError] = useState(null);

  const handleSignupClick = () => {
    sliderRef.current.classList.add("moveslider");
    formSectionRef.current.classList.add("form-section-move");
  };

  const handleLoginClick = () => {
    sliderRef.current.classList.remove("moveslider");
    formSectionRef.current.classList.remove("form-section-move");
  };

  const handleLoginChange = e => {
    setLoginData({ ...loginData, [e.target.name]: e.target.value });
  };

  const handleSignupChange = e => {
    setSignupData({ ...signupData, [e.target.name]: e.target.value });
  };

  const handleSignupSubmit = async e => {
    e.preventDefault();
    if (signupData.password !== signupData.confirmPassword) {
      setSignupError("Passwords do not match");
      return;
    }
    try {
      await axiosInstance.post("/users/", {
        username: signupData.username,
        email: signupData.email,
        password: signupData.password,
      });
      setSignupError(null);
      handleLoginClick();
    } catch (error) {
      console.error(error);
      setSignupError("Registration failed");
      alert("Registration failed");
    }
  };

  const handleLoginSubmit = async () => {
    try {
      const res = await axiosInstance.post("/api/auth/login/", {
        username: loginData.username,
        password: loginData.password,
      });

      localStorage.setItem("access", res.data.access);
      localStorage.setItem("refresh", res.data.refresh);

      const projectId = "1";
      const boardId = "1";

      navigate(`/project-page`);
      // navigate(`/project-page/project-${projectId}/board-${boardId}`);
    } catch (error) {
      console.error(error);
      alert("Login failed");
    }
  };

  const loginWithGoogle = useGoogleLogin({
    flow: "implicit",
    onSuccess: async tokenResponse => {
      console.log("Google login success:", tokenResponse);
      const res = await fetch("http://localhost:8000/api/auth/google/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          access_token: tokenResponse.access_token,
        }),
      });

      if (!res.ok) {
        console.error("Error logging into server:", await res.text());
      } else {
        const data = await res.json();
        localStorage.setItem("access", data.access);
        localStorage.setItem("refresh", data.refresh);

        const projectsRes = await axiosInstance.get("/api/projects/");
        const firstProjectId = projectsRes.data[0]?.id;

        if (firstProjectId) {
          navigate(`/project-page/${firstProjectId}`);
        } else {
          alert("No projects found for this user.");
          navigate("/");
        }
      }
    },
    onError: () => console.error("Google login error"),
  });

  return (
    <div className="auth-body">
      <header>
        <h1 className="heading">Jira-like system</h1>
      </header>

      <div className="auth-container">
        <div className="slider" ref={sliderRef}></div>
        <div className="auth-btn">
          <button className="login" onClick={handleLoginClick}>
            Sign in
          </button>
          <button className="signup" onClick={handleSignupClick}>
            Sign up
          </button>
        </div>

        <div className="form-section" ref={formSectionRef}>
          <div className="login-box">
            <input
              type="username"
              name="username"
              className="username elein"
              placeholder="Enter your username"
              value={loginData.username}
              onChange={handleLoginChange}
              required
            />
            <input
              type="password"
              name="password"
              className="password elein"
              placeholder="password"
              value={loginData.password}
              onChange={handleLoginChange}
              required
            />
            <button className="clkbtn" onClick={handleLoginSubmit}>
              Sign in
            </button>

            <div className="login-with">
              <div className="line" style={{ marginBottom: "20px" }}>
                {" "}
                OR{" "}
              </div>

              <button
                onClick={() => loginWithGoogle()}
                style={{
                  width: "60px",
                  height: "60px",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                <img
                  src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQcbdcygTuiOxXn4wxD2L82CI-VDHzX4edm1w&s"
                  alt="Google"
                  style={{ width: "60px", height: "60px" }}
                />
              </button>
            </div>
          </div>

          <form className="signup-box" onSubmit={handleSignupSubmit}>
            <input
              type="text"
              name="username"
              className="name ele"
              placeholder="Enter your name"
              value={signupData.username}
              onChange={handleSignupChange}
              required
            />
            <input
              type="email"
              name="email"
              className="email ele"
              placeholder="youremail@email.com"
              value={signupData.email}
              onChange={handleSignupChange}
              required
            />
            <input
              type="password"
              name="password"
              className="password ele"
              placeholder="password"
              value={signupData.password}
              onChange={handleSignupChange}
              required
            />
            <input
              type="password"
              name="confirmPassword"
              className="password ele"
              placeholder="Confirm password"
              value={signupData.confirmPassword}
              onChange={handleSignupChange}
              required
            />
            {signupError && <p style={{ color: "red" }}>{signupError}</p>}
            <button type="submit" className="clkbtn">
              Sign up
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

const AuthForm = () => (
  <GoogleOAuthProvider clientId="1078199504624-vq0dqgmkqmsvt2ivpnp7mbcrcko0gfqa.apps.googleusercontent.com">
    <AuthFormContent />
  </GoogleOAuthProvider>
);

export default AuthForm;
