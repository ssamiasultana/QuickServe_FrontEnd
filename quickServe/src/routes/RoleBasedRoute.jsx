import { use } from "react";
import { Navigate } from "react-router";
import { AuthContext } from "../components/Context/AuthContext";

const RoleBasedRoute = ({ children, allowedRoles }) => {
  const getRoleDefaultPath = (role) => {
    switch (role?.toLowerCase()) {
      case "admin":
      case "moderator":
        return "/dashboard";
      case "worker":
        return "/worker";
      case "customer":
        return "/customer";
      default:
        return "/login";
    }
  };
  const { isAuthenticated, user, loading } = use(AuthContext);
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user?.role)) {
    return <Navigate to={getRoleDefaultPath(user?.role)} replace />;
  }

  return children;
};

export default RoleBasedRoute;
