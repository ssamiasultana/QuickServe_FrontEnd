import { createBrowserRouter, Navigate } from "react-router";
import App from "../App.jsx";
import Dashboard from "../components/Dashboard.jsx";
import CustomerLayout from "../components/Layout/CustomerLayout.jsx";
import WorkerLayout from "../components/Layout/WorkerLayout.jsx";
import AddWorker from "../components/Worker/AddWorker.jsx";
import WorkerList from "../components/Worker/WorkerList.jsx";
import Login from "../components/auth/Login.jsx";
import Register from "../components/auth/Register.jsx";
import ProtectedRoute from "./ProtectedRoute.jsx";
import RoleBasedRoute from "./RoleBasedRoute.jsx";

const routes = createBrowserRouter([
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <RoleBasedRoute allowedRoles={["Admin", "Moderator"]}>
          <App />
        </RoleBasedRoute>
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: "dashboard", Component: Dashboard },
      { path: "/add", Component: AddWorker },
      { path: "/manage", Component: WorkerList },
    ],
  },
  {
    path: "/login",
    Component: Login,
  },
  {
    path: "/signup",
    Component: Register,
  },
  {
    path: "/worker",
    element: (
      <ProtectedRoute>
        <RoleBasedRoute allowedRoles={"Worker"}>
          <WorkerLayout />
        </RoleBasedRoute>
      </ProtectedRoute>
    ),
  },

  {
    path: "/customer",
    element: (
      <ProtectedRoute>
        <RoleBasedRoute allowedRoles={"Customer"}>
          <CustomerLayout />
        </RoleBasedRoute>
      </ProtectedRoute>
    ),
  },
]);
export default routes;
