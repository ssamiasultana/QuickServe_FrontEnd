import { LayoutDashboard, Users } from "lucide-react";
import { use } from "react";
// import { useLocation, useNavigate } from "react-router";
import { AuthContext } from "../Context/AuthContext";
import Sidebar from "../ui/SideBar";

const AdminSideBar = () => {
  // const [isCollapsed, setIsCollapsed] = useState(false);
  // const location = useLocation();
  const { user, logout } = use(AuthContext);
  // const navigate = useNavigate();
  // const [subMenuExpand, setSubMenuExpand] = useState({});

  const menuItems = [
    { id: "dashboard", icon: LayoutDashboard, label: "Dashboard", link: "/" },
    {
      id: "workers",
      icon: Users,
      label: "Workers",
      link: "/workers",
      hasSubmenu: true,
      subMenu: [
        { id: "create-worker", label: "Add Worker", link: "/add" },
        {
          id: "manage-workers",
          label: "Manage Workers",
          link: "/manage",
        },
      ],
    },
    { id: "customers", icon: Users, label: "Customers", link: "/customers" },
    { id: "moderators", icon: Users, label: "Moderators", link: "/moderators" },
  ];

  // const toggleSubMenu = (itemId) => {
  //   setSubMenuExpand((prev) => ({
  //     ...prev,
  //     [itemId]: !prev[itemId],
  //   }));
  // };
  // const handleLogout = () => {
  //   logout();
  //   navigate("/login");
  // };

  return (
    <div className="flex">
      <Sidebar
        user={user}
        menuItems={menuItems}
        onLogout={logout}
        brandName={user.name}
        activeColor="blue"
      />
      {/* Main content */}
    </div>
  );
};

export default AdminSideBar;
