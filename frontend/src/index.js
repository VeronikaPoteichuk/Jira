import React, { Fragment } from "react";
import ReactDOM from "react-dom/client";
import ListUsers from "./list_users/listUsers";

import 'bootstrap/dist/css/bootstrap.min.css';

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
<Fragment>
  <ListUsers />
</Fragment>
);
