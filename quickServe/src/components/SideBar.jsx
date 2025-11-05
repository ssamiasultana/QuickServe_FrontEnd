import {
  ChevronLeft,
  LayoutDashboard,
  LogOut,
  Menu,
  Users,
} from 'lucide-react';
import  { use, useState } from 'react';
import { Link, useLocation } from 'react-router';

const SideBar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();
  console.log(location.pathname);

  

  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard', link: '/' },
    { id: 'workers', icon: Users, label: 'Workers', link: '/create-worker' },
    { id: 'customers', icon: Users, label: 'Customers', link: '/customers' },
    { id: 'moderators', icon: Users, label: 'Moderators', link: '/moderators' },
  ];


  return (
    <div
      className={`bg-white shadow-lg transition-all duration-300 flex flex-col ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}>
      <div className='flex items-center justify-between p-4 border-b border-neutral-200'>
        {!isCollapsed && (
          <div className='flex items-center gap-2'>
            <div className='w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center'>
              <span className='text-white font-bold text-sm'>A</span>
            </div>
            <span className='font-bold text-slate-900 text-lg'>Admin</span>
          </div>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className='p-2 rounded-lg hover:bg-neutral-100 transition-colors'>
          {isCollapsed ? (
            <Menu className='w-5 h-5 text-neutral-600' />
          ) : (
            <ChevronLeft className='w-5 h-5 text-neutral-600' />
          )}
        </button>
      </div>

      <nav className='flex-1 p-4 space-y-1 overflow-y-auto'>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.link;

          return (
            <Link
              key={item.id}
              to={item.link}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                isActive
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-slate-700 hover:bg-neutral-100'
              }`}>
              {Icon && (
                <Icon
                  className={`w-5 h-5 shrink-0 ${
                    isActive ? 'text-blue-600' : 'text-neutral-600'
                  }`}
                />
              )}
              {!isCollapsed && (
                <span className='flex-1 text-left font-medium text-sm'>
                  {item.label}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className='border-t border-neutral-200 p-4'>
        <div
          className={`flex items-center gap-3 ${
            isCollapsed ? 'justify-center' : ''
          }`}>
          {!isCollapsed && (
            <div className='flex-1'>
              <p className='text-sm font-medium text-slate-900'>Admin Name</p>
              <p className='text-xs text-neutral-500'>Admin</p>
            </div>
          )}
        </div>
        {!isCollapsed && (
          <button className='w-full mt-3 flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-neutral-100 rounded-lg transition-colors'>
            <LogOut className='w-4 h-4' />
            <span>Logout</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default SideBar;
