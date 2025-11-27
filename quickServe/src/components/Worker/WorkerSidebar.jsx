import { Briefcase, Calendar } from "lucide-react";
import { use } from "react";
import { AuthContext } from "../Context/AuthContext";
import Sidebar from "../ui/SideBar";

// Create a components/TakaSignIcon.jsx file
const TakaSignIcon = ({ size = 24, color = "currentColor", ...props }) => {
  return (
    <div
      style={{
        width: size,
        height: size,
        color: color,
        fontSize: 28,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: "bold",
      }}
      {...props}
    >
      ৳
    </div>
  );
};

const WorkerSidebar = () => {
  const { user, logout } = use(AuthContext);

  const workerMenuItems = [
    { id: "jobs", icon: Briefcase, label: "My Jobs", link: "/worker/jobs" },
    {
      id: "schedule",
      icon: Calendar,
      label: "Schedule",
      link: "/worker/schedule",
    },
    {
      id: "earnings",
      icon: TakaSignIcon,
      label: "Earnings",
      link: "/worker/earnings",
    },
  ];

  return (
    <div className="flex">
      <Sidebar
        user={user}
        menuItems={workerMenuItems}
        onLogout={logout}
        brandName="Worker Portal"
        activeColor="purple"
        logo="W"
      />
      {/* Main content */}
    </div>
  );
};

export default WorkerSidebar;
