import { ChevronDown, ChevronLeft, LogOut, Menu } from "lucide-react";
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";

// Reusable Sidebar Component
const Sidebar = ({
  user,
  menuItems = [],
  onLogout,
  logo = "A",
  brandName = "Admin Panel",
  collapsedWidth = "w-20",
  expandedWidth = "w-64",
  activeColor = "blue",
  className = "",
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [subMenuExpand, setSubMenuExpand] = useState({});
  const location = useLocation();
  const navigate = useNavigate();

  const toggleSubMenu = (itemId) => {
    setSubMenuExpand((prev) => ({
      ...prev,
      [itemId]: !prev[itemId],
    }));
  };

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    }
    navigate("/login");
  };

  const getColorClasses = (color) => {
    const colorMap = {
      blue: {
        bg: "bg-blue-50",
        text: "text-blue-600",
        icon: "text-blue-600",
      },
      green: {
        bg: "bg-green-50",
        text: "text-green-600",
        icon: "text-green-600",
      },
      purple: {
        bg: "bg-purple-50",
        text: "text-purple-600",
        icon: "text-purple-600",
      },
      red: {
        bg: "bg-red-50",
        text: "text-red-600",
        icon: "text-red-600",
      },
      indigo: {
        bg: "bg-indigo-50",
        text: "text-indigo-600",
        icon: "text-indigo-600",
      },
    };
    return colorMap[color] || colorMap.blue;
  };

  const colors = getColorClasses(activeColor);

  return (
    <div
      className={`bg-white shadow-lg transition-all duration-300 flex flex-col h-screen ${
        isCollapsed ? collapsedWidth : expandedWidth
      } ${className}`}
    >
      {/* Header */}
      <div
        className={`flex items-center ${
          isCollapsed ? "justify-center" : "justify-between"
        } p-4 border-b border-neutral-200`}
      >
        {!isCollapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">{logo}</span>
            </div>
            <span className="font-bold text-slate-900 text-lg">
              {brandName}
            </span>
          </div>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 rounded-lg hover:bg-neutral-100 transition-colors"
        >
          {isCollapsed ? (
            <Menu className="w-5 h-5 text-neutral-600" />
          ) : (
            <ChevronLeft className="w-5 h-5 text-neutral-600" />
          )}
        </button>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;

          const isActive =
            location.pathname === item.link ||
            (item.subMenu &&
              item.subMenu.some((sub) => location.pathname === sub.link));
          const isSubMenuExpanded = subMenuExpand[item.id];

          return (
            <div key={item.id} className="space-y-1">
              {item.hasSubmenu ? (
                <>
                  <button
                    onClick={() => toggleSubMenu(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                      isCollapsed ? "justify-center" : ""
                    } ${
                      isActive
                        ? `${colors.bg} ${colors.text}`
                        : "text-slate-700 hover:bg-neutral-100"
                    }`}
                  >
                    {Icon && (
                      <Icon
                        className={`shrink-0 w-5 h-5 ${
                          isActive ? colors.icon : "text-neutral-600"
                        }`}
                      />
                    )}
                    {!isCollapsed && (
                      <>
                        <span className="flex-1 text-left font-medium text-sm">
                          {item.label}
                        </span>
                        <ChevronDown
                          className={`w-4 h-4 transition-transform ${
                            isSubMenuExpanded ? "rotate-180" : ""
                          }`}
                        />
                      </>
                    )}
                  </button>
                  {!isCollapsed && isSubMenuExpanded && item.subMenu && (
                    <div className="ml-4 space-y-1">
                      {item.subMenu.map((subItem) => {
                        const isSubActive = location.pathname === subItem.link;
                        return (
                          <Link
                            key={subItem.id}
                            to={subItem.link}
                            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${
                              isSubActive
                                ? `${colors.bg} ${colors.text}`
                                : "text-slate-600 hover:bg-neutral-50"
                            }`}
                          >
                            <span className="text-sm font-medium">
                              {subItem.label}
                            </span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </>
              ) : (
                <Link
                  to={item.link}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                    isCollapsed ? "justify-center" : ""
                  } ${
                    isActive
                      ? `${colors.bg} ${colors.text}`
                      : "text-slate-700 hover:bg-neutral-100"
                  }`}
                >
                  {Icon && (
                    <Icon
                      className={`w-5 h-5 shrink-0 ${
                        isActive ? colors.icon : "text-neutral-600"
                      }`}
                    />
                  )}
                  {!isCollapsed && (
                    <span className="flex-1 text-left font-medium text-sm">
                      {item.label}
                    </span>
                  )}
                </Link>
              )}
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-neutral-200 p-4">
        {!isCollapsed && user && (
          <div className="flex items-center gap-3 mb-3 p-2 rounded-lg bg-neutral-50">
            <div className="w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">
                {user.name?.charAt(0) || "U"}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 truncate">
                {user.name}
              </p>
              <p className="text-xs text-slate-500 truncate">{user.email}</p>
            </div>
          </div>
        )}

        {!isCollapsed && (
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
