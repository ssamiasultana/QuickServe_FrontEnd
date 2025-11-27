import { LogOut } from "lucide-react";
import { use } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import logo from "../../assets/logo.png";
import { AuthContext } from "../Context/AuthContext";
import colors from "../ui/color";

const CustomerNavbar = () => {
  const { user, logout, isAuthenticated } = use(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navItems = [
    { id: "workers", label: "Find Workers", path: "/workers" },
    { id: "bookings", label: "My Bookings", path: "/bookings" },
  ];

  const isActivePath = (path) => {
    return location.pathname.startsWith(path);
  };

  return (
    <nav
      className="shadow-lg  backdrop-blur-sm"
      style={{
        backgroundColor: colors.primary[50],
        borderColor: colors.primary[200],
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div
            className="flex items-center cursor-pointer group"
            onClick={() => navigate("/dashboard")}
          >
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300 group-hover:shadow-md"
              style={{
                backgroundColor: colors.accent[600],
                color: colors.white,
              }}
            >
              <img src={logo} alt="sp" />
            </div>
            <div className="ml-3">
              <h1
                className="text-xl font-bold transition-colors group-hover:text-accent-600"
                style={{ color: colors.primary[900] }}
              >
                Quick Serve
              </h1>
              <p
                className="text-xs transition-colors group-hover:text-accent-500"
                style={{ color: colors.primary[500] }}
              >
                ServicePro
              </p>
            </div>
          </div>
          {isAuthenticated ? (
            <div className="flex items-center gap-4">
              <span
                className="font-medium"
                style={{ color: colors.primary[700] }}
              >
                Welcome, {user?.name || user?.email}
              </span>
              <button
                className="px-4 py-2 font-medium rounded-lg transition-colors flex items-center gap-2"
                style={{ color: colors.error[500], border: "none" }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = colors.error[50];
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = "transparent";
                }}
                onClick={handleLogout}
              >
                <LogOut size={18} />
                Logout
              </button>
            </div>
          ) : (
            <div className="flex gap-3">
              <Link
                to="/login"
                className="px-5 py-2.5 font-medium rounded-lg transition-colors"
                style={{
                  color: colors.accent[600],
                  border: `1px solid ${colors.accent[200]}`,
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = colors.accent[50];
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = "transparent";
                }}
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="px-5 py-2.5 font-medium rounded-lg transition-colors"
                style={{
                  backgroundColor: colors.accent[600],
                  color: colors.white,
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = colors.accent[500];
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = colors.accent[600];
                }}
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>

        <div
          className="md:hidden flex space-x-2 pb-4 pt-2"
          style={{ borderTop: `1px solid ${colors.primary[200]}` }}
        >
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 flex-1 text-center ${
                isActivePath(item.path) ? "shadow-sm" : "hover:shadow-md"
              }`}
              style={{
                backgroundColor: isActivePath(item.path)
                  ? colors.accent[500]
                  : colors.white,
                color: isActivePath(item.path)
                  ? colors.white
                  : colors.primary[700],
                border: `1px solid ${
                  isActivePath(item.path)
                    ? colors.accent[500]
                    : colors.primary[200]
                }`,
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default CustomerNavbar;
