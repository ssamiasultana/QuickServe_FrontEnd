import { createBrowserRouter } from "react-router";
import App from "./App.jsx";
import AddWorker from "./components/Worker/AddWorker.jsx";

import Dashboard from "./components/Dashboard.jsx";
import WorkerList from "./components/Worker/WorkerList.jsx";
import Login from "./components/auth/Login.jsx";
import Register from "./components/auth/Register.jsx";

const routes = createBrowserRouter([
  {
    path: "/",
    Component: App,
    children: [
      {
        path: "/",
        Component: Dashboard,
      },
      {
        path: "/add",
        Component: AddWorker,
      },
      { path: "/manage", Component: WorkerList },
      {
        path: "/login",
        Component: Login,
      },
      {
        path: "/signup",
        Component: Register,
      },
    ],
  },
]);
export default routes;
