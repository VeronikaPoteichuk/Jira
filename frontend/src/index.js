import React, { Fragment } from "react";
import ReactDOM from "react-dom/client";
// import ListUsers from "./list_users/ListUsers";
import UserRegister from "./register/UserRegister";
import 'bootstrap/dist/css/bootstrap.min.css';

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
<Fragment>
  {/* <ListUsers /> */}
  <UserRegister />
</Fragment>
);
