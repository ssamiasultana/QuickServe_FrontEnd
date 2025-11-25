import { use } from "react";
import { Navigate } from "react-router";
import { AuthContext } from "../components/Context/AuthContext";
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = use(AuthContext);

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

  return children;
};

export default ProtectedRoute;
