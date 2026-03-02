import { LogOut, Menu, User, X } from 'lucide-react';
import React, { useEffect, useMemo, useState, use } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import logo from '../../assets/logo.png';
import { AuthContext } from '../Context/AuthContext';
import colors from '../ui/color';

const CustomerNavbar = () => {
  const { user, logout, isAuthenticated } = use(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = useMemo(
    () => [
      { id: 'workers', label: 'Find Workers', path: '/customer/manage-workers' },
      { id: 'services', label: 'All Services', path: '/customer/service-page' },
      { id: 'bookings', label: 'My Bookings', path: '/customer/my-booking' },
    ],
    []
  );

  const isActivePath = (path) => {
    return location.pathname.startsWith(path);
  };

  useEffect(() => {
    // Close menus on navigation
    setMobileOpen(false);
    setUserMenuOpen(false);
  }, [location.pathname]);

  return (
    <nav className='sticky top-0 z-50  bg-white/80 backdrop-blur-md shadow-sm'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='h-16 flex items-center justify-between gap-4'>
          {/* Brand */}
          <div className='flex items-center gap-3 min-w-0'>
            <button
              type='button'
              onClick={() => navigate('/customer/dashboard')}
              className='flex items-center gap-3 group min-w-0'>
              <div
                className='w-10 h-10 rounded-xl flex items-center justify-center shadow-sm ring-1 ring-black/5 group-hover:shadow transition'
                style={{ backgroundColor: colors.accent[600] }}>
                <img src={logo} alt='Quick Serve' className='w-7 h-7 object-contain' />
              </div>
              <div className='min-w-0 text-left hidden sm:block'>
                <div className='text-base font-extrabold text-slate-900 truncate'>
                  Quick Serve
                </div>
                <div className='text-xs text-slate-500 -mt-0.5'>ServicePro</div>
              </div>
            </button>
          </div>

          {/* Desktop nav */}
          <div className='hidden md:flex items-center gap-1'>
            {navItems.map((item) => {
              const active = isActivePath(item.path);
              return (
                <Link
                  key={item.id}
                  to={item.path}
                  className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                    active
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}>
                  {item.label}
                </Link>
              );
            })}
          </div>

          {/* Right side */}
          <div className='flex items-center gap-2'>
            {!isAuthenticated ? (
              <div className='hidden sm:flex items-center gap-2'>
                <Link
                  to='/login'
                  className='px-4 py-2 rounded-lg text-sm font-semibold border border-slate-200 text-slate-700 hover:bg-slate-50 transition'>
                  Login
                </Link>
                <Link
                  to='/signup'
                  className='px-4 py-2 rounded-lg text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 transition shadow-sm'>
                  Sign Up
                </Link>
              </div>
            ) : (
              <div className='relative'>
                <button
                  type='button'
                  onClick={() => setUserMenuOpen((v) => !v)}
                  className='flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-slate-100 transition'
                  aria-haspopup='menu'
                  aria-expanded={userMenuOpen}>
                  <div className='w-9 h-9 rounded-xl bg-slate-100 ring-1 ring-black/5 flex items-center justify-center overflow-hidden'>
                    <User size={18} className='text-slate-700' />
                  </div>
                  <div className='hidden lg:block text-left'>
                    <div className='text-sm font-bold text-slate-900 leading-4 max-w-[180px] truncate'>
                      {user?.name || user?.email}
                    </div>
                    <div className='text-xs text-slate-500 leading-4'>Customer</div>
                  </div>
                </button>

                {userMenuOpen && (
                  <div
                    role='menu'
                    className='absolute right-0 mt-2 w-52 rounded-xl border border-slate-200 bg-white shadow-lg overflow-hidden'>
                    <button
                      type='button'
                      onClick={() => navigate('/customer/profile')}
                      className='w-full px-4 py-2.5 text-left text-sm font-semibold text-slate-700 hover:bg-slate-50 transition flex items-center gap-2'>
                      <User size={16} />
                      Profile
                    </button>
                    <button
                      type='button'
                      onClick={handleLogout}
                      className='w-full px-4 py-2.5 text-left text-sm font-semibold text-rose-600 hover:bg-rose-50 transition flex items-center gap-2'>
                      <LogOut size={16} />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Mobile menu button */}
            <button
              type='button'
              className='md:hidden p-2 rounded-xl hover:bg-slate-100 transition'
              onClick={() => setMobileOpen((v) => !v)}
              aria-label='Toggle menu'>
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className='md:hidden pb-4'>
            <div className='pt-2 border-t border-slate-200'>
              <div className='grid grid-cols-1 gap-2 mt-3'>
                {navItems.map((item) => {
                  const active = isActivePath(item.path);
                  return (
                    <Link
                      key={item.id}
                      to={item.path}
                      className={`px-3 py-2.5 rounded-lg text-sm font-semibold transition ${
                        active
                          ? 'bg-blue-600 text-white'
                          : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
                      }`}>
                      {item.label}
                    </Link>
                  );
                })}
              </div>

              {!isAuthenticated ? (
                <div className='mt-3 grid grid-cols-2 gap-2'>
                  <Link
                    to='/login'
                    className='px-4 py-2.5 rounded-lg text-sm font-semibold border border-slate-200 text-slate-700 hover:bg-slate-50 transition text-center'>
                    Login
                  </Link>
                  <Link
                    to='/signup'
                    className='px-4 py-2.5 rounded-lg text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 transition shadow-sm text-center'>
                    Sign Up
                  </Link>
                </div>
              ) : (
                <div className='mt-3 grid grid-cols-1 gap-2'>
                  <Link
                    to='/customer/profile'
                    className={`px-4 py-2.5 rounded-lg text-sm font-semibold border transition flex items-center gap-2 ${
                      isActivePath('/customer/profile')
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}>
                    <User size={16} />
                    Profile
                  </Link>
                  <button
                    type='button'
                    onClick={handleLogout}
                    className='px-4 py-2.5 rounded-lg text-sm font-semibold text-rose-600 border border-rose-200 hover:bg-rose-50 transition flex items-center gap-2'>
                    <LogOut size={16} />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default CustomerNavbar;
