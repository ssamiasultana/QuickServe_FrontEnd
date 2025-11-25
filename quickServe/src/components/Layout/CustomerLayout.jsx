import { LogOut } from "lucide-react";
import { use } from "react";
import { useNavigate } from "react-router";
import { AuthContext } from "../Context/AuthContext";
function CustomerLayout() {
  const { user, logout, isAuthenticated } = use(AuthContext);
  const navigate = useNavigate();
  const handleLogout = () => {
    logout();
    navigate("/login");
  };
  return (
    <div>
      {isAuthenticated && <h3>{user.name}</h3>}

      <button
        onClick={handleLogout}
        className="w-full mt-3 flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-neutral-100 rounded-lg transition-colors"
      >
        <LogOut className="w-4 h-4" />
        <span>Logout</span>
      </button>
    </div>
  );
}

export default CustomerLayout;
