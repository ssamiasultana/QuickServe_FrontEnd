import {
  Briefcase,
  CalendarClock,
  LayoutDashboard,
  Shield,
  User,
  UserCircle,
  UserPlus,
  Wrench,
} from 'lucide-react';
import { use } from 'react';
// import { useLocation, useNavigate } from "react-router";
import { AuthContext } from '../Context/AuthContext';
import Sidebar from '../ui/SideBar';

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

const AdminSideBar = () => {
  // const [isCollapsed, setIsCollapsed] = useState(false);
  // const location = useLocation();
  const { user, logout } = use(AuthContext);
  // const navigate = useNavigate();
  // const [subMenuExpand, setSubMenuExpand] = useState({});

  const isModerator = user?.role === 'Moderator';

  // All menu items with role restrictions
  const allMenuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard', link: '/', roles: ['Admin'] },
    {
      id: 'workers',
      icon: Briefcase,
      label: 'Workers',
      link: '/workers',
      hasSubmenu: true,
      subMenu: [
        { id: 'create-worker', label: 'Add Worker', link: '/add' },
        {
          id: 'manage-workers',
          label: 'Manage Workers',
          link: '/manage',
        },
      ],
      roles: ['Admin', 'Moderator'],
    },
    {
      id: 'customers',
      icon: UserCircle,
      label: 'Customers',
      link: '/customers',
      roles: ['Admin'],
    },
    {
      id: 'moderators',
      icon: Shield,
      label: 'Moderators',
      link: '/moderators',
      roles: ['Admin'],
    },
    {
      id: 'user-signup',
      icon: UserPlus,
      label: isModerator ? 'Create Worker' : 'Create Worker/Moderator',
      link: '/user-signup',
      roles: ['Admin', 'Moderator'],
    },
    {
      id: 'Services',
      icon: Wrench,
      label: 'Services',
      link: '/services',
      roles: ['Admin'],
    },
    {
      id: 'bookings',
      icon: CalendarClock,
      label: 'Bookings',
      link: '/bookings',
      roles: ['Admin', 'Moderator'],
    },
    {
      id: 'payments',
      icon: TakaSignIcon,
      label: 'Payments',
      link: '/payments',
      roles: ['Admin'],
    },
    {
      id: 'profile',
      icon: User,
      label: 'Profile',
      link: '/profile',
      roles: ['Admin', 'Moderator'],
    },
  ];

  // Filter menu items based on user role
  const menuItems = allMenuItems.filter(
    (item) => !item.roles || item.roles.includes(user?.role)
  );

  return (
    <div className='flex'>
      <Sidebar
        user={user}
        menuItems={menuItems}
        onLogout={logout}
        brandName={isModerator ? 'Moderator Panel' : user.name}
        activeColor={isModerator ? 'purple' : 'blue'}
        logo={isModerator ? 'M' : 'A'}
      />
    </div>
  );
};

export default AdminSideBar;
