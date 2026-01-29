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

const AdminSideBar = () => {
  // const [isCollapsed, setIsCollapsed] = useState(false);
  // const location = useLocation();
  const { user, logout } = use(AuthContext);
  // const navigate = useNavigate();
  // const [subMenuExpand, setSubMenuExpand] = useState({});

  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard', link: '/' },
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
    },
    {
      id: 'customers',
      icon: UserCircle,
      label: 'Customers',
      link: '/customers',
    },
    {
      id: 'moderators',
      icon: Shield,
      label: 'Moderators',
      link: '/moderators',
    },
    {
      id: 'user-signup',
      icon: UserPlus,
      label: 'Create Worker/Moderator',
      link: '/user-signup',
    },
    {
      id: 'Services',
      icon: Wrench,
      label: 'Services',
      link: '/services',
    },
    {
      id: 'bookings',
      icon: CalendarClock, // or CalendarCheck, CalendarClock
      label: 'Bookings',
      link: '/bookings',
    },
    {
      id: 'profile',
      icon: User,
      label: 'Profile',
      link: '/profile',
    },
  ];

  return (
    <div className='flex'>
      <Sidebar
        user={user}
        menuItems={menuItems}
        onLogout={logout}
        brandName={user.name}
        activeColor='blue'
      />
    </div>
  );
};

export default AdminSideBar;
