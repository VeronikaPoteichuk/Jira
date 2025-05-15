import React, { useRef, useState } from 'react';
import axios from '../api/axios';
import './style.css';

const AuthForm = () => {
  const sliderRef = useRef(null);
  const formSectionRef = useRef(null);

  const [signupData, setSignupData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
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

  const handleSignupChange = (e) => {
    setSignupData({ ...signupData, [e.target.name]: e.target.value });
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    if (signupData.password !== signupData.confirmPassword) {
      setSignupError("Passwords do not match");
      return;
    }
    try {
      await axios.post("/users/", {
        username: signupData.username,
        email: signupData.email,
        password: signupData.password
      });
      setSignupError(null);
      alert("User created!");
    } catch (error) {
      console.error(error);
      setSignupError("Registration failed");
    }
  };

  return (
    <div>
      <header>
        <h1 className="heading">Jira-like system</h1>
      </header>

      <div className="container">
        <div className="slider" ref={sliderRef}></div>
        <div className="btn">
          <button className="login" onClick={handleLoginClick}>Login</button>
          <button className="signup" onClick={handleSignupClick}>Signup</button>
        </div>

        <div className="form-section" ref={formSectionRef}>
          <div className="login-box">
            <input type="email" className="email ele" placeholder="youremail@email.com" />
            <input type="password" className="password ele" placeholder="password" />
            <button className="clkbtn">Login</button>
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
            {signupError && <p style={{ color: 'red' }}>{signupError}</p>}
            <button type="submit" className="clkbtn">Signup</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AuthForm;
