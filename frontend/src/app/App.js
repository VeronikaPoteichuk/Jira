import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AuthForm from "../sign_in_and_sign_up/SignInAndSignUpForm";
import ListUsers from "../list_users/ListUsers";
import MainPage from "../main_page/MainPage";
import ProjectPage from "../project_page/ProjectPage";
import Board from "../boards/Board";
import Projects from "../project_page/Project";
import ProjectBoardsPage from "../project_page/ProjectBoardsPage";
import { ToastContainer } from "react-toastify";
import "bootstrap/dist/css/bootstrap.min.css";
import { DeleteModalProvider } from "../hooks/DeleteModalContext";
import { HoveredEntityProvider } from "../hooks/HoveredEntityContext";
import GitHubSuccess from "../project_page/GitHubSuccess";

function App() {
  return (
    <BrowserRouter>
      <DeleteModalProvider>
        <HoveredEntityProvider>
          <Routes>
            <Route path="/" element={<MainPage />} />
            <Route path="/users" element={<ListUsers />} />
            <Route path="/auth" element={<AuthForm />} />
            <Route path="/project-page/:projectId/:boardId" element={<ProjectPage />} />
            <Route path="/project-page" element={<Projects />} />
            {/* <Route path="/project-page/:projectId/:boardId" element={<Board />} /> */}
            <Route path="/project-page/:projectId" element={<ProjectBoardsPage />} />
            <Route path="/github-success" element={<GitHubSuccess />} />
          </Routes>
        </HoveredEntityProvider>
      </DeleteModalProvider>
      <ToastContainer position="top-right" autoClose={4000} />
    </BrowserRouter>
  );
}

export default App;
