import { Briefcase, UserPen, User } from "lucide-react";
import { use } from "react";
import { AuthContext } from "../Context/AuthContext";
import Sidebar from "../ui/SideBar";

// Taka Sign Icon Component
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
      id: "earnings",
      icon: TakaSignIcon,
      label: "Earnings",
      link: "/worker/earnings",
    },
    {
      id: "submit-payment",
      icon: TakaSignIcon,
      label: "Submit Payment",
      link: "/worker/submit-payment",
    },
    {
      id: "profile",
      icon: User,
      label: "Profile",
      link: "/worker/profile",
    },
    {
      id: "info",
      icon: UserPen,
      label: "Information",
      link: "/worker/info",
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
    </div>
  );
};

export default WorkerSidebar;
