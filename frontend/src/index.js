import React, { Fragment } from "react";
import ReactDOM from "react-dom/client";
// import ListUsers from "./list_users/ListUsers";
// import UserRegister from "./register/UserRegister";
// import 'bootstrap/dist/css/bootstrap.min.css';
import AuthForm from "./sign_in_and_sign_up/SignInAndSignUpForm";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
<Fragment>
  {/* <ListUsers /> */}
  <AuthForm />
</Fragment>
);
