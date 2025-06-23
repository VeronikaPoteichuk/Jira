import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AuthForm from "../sign_in_and_sign_up/SignInAndSignUpForm";
import ListUsers from "../list_users/ListUsers";
import MainPage from "../main_page/MainPage";
import ProjectPage from "../project_page/ProjectPage";
import Board from "../boards/Board";
import { ToastContainer } from "react-toastify";
import "bootstrap/dist/css/bootstrap.min.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/users" element={<ListUsers />} />
        <Route path="/auth" element={<AuthForm />} />
        <Route path="/project-page" element={<ProjectPage />} />
        <Route path="/board" element={<Board />} />
      </Routes>
      <ToastContainer position="top-right" autoClose={4000} />
    </BrowserRouter>
  );
}

export default App;
