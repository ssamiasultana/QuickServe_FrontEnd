import { createBrowserRouter, Navigate } from 'react-router';
import App from '../App.jsx';
import CustomerDashboard from '../components/CustomerDashboard.jsx';
import CustomerLayout from '../components/Layout/CustomerLayout.jsx';
import WorkerLayout from '../components/Layout/WorkerLayout.jsx';

import Dashboard from '../components/Admin/Dashboard.jsx';
import AddWorker from '../components/Admin/Worker/AddWorker.jsx';

import BookingList from '../components/Admin/Booking/BookingList.jsx';
import CustomerList from '../components/Admin/Customer/CustomerList.jsx';
import Services from '../components/Admin/Services/Services.jsx';
import SingleWorker from '../components/Admin/Worker/SingleWorker.jsx';
import WorkerList from '../components/Admin/Worker/WorkerList.jsx';
import ForgotPassword from '../components/auth/ForgotPassword.jsx';
import Login from '../components/auth/Login.jsx';
import Register from '../components/auth/Register.jsx';
import ResetPassword from '../components/auth/ResetPassword.jsx';
import CustomerPage from '../components/Customer/CustomerPage.jsx';
import HirePage from '../components/Customer/HirePage.jsx';
import MyBooking from '../components/Customer/MyBooking.jsx';
import PaymentConfirmationPage from '../components/Customer/PaymentConfirmationPage.jsx';
import Earnings from '../components/Worker/Earnings.jsx';
import Schedule from '../components/Worker/Schedule.jsx';
import WorkerPortal from '../components/Worker/WorkerPortal.jsx';
import ProtectedRoute from './ProtectedRoute.jsx';
import RoleBasedRoute from './RoleBasedRoute.jsx';

const routes = createBrowserRouter([
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <RoleBasedRoute allowedRoles={['Admin', 'Moderator']}>
          <App />
        </RoleBasedRoute>
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to='/dashboard' replace /> },
      { path: 'dashboard', Component: Dashboard },
      { path: '/add', element: <AddWorker isAdminMode={true} /> },
      { path: '/manage', Component: WorkerList },
      { path: '/workers/:id', Component: SingleWorker },
      { path: 'user-signup', Component: Register },
      { path: '/customers', Component: CustomerList },
      { path: '/services', Component: Services },
      { path: '/bookings', Component: BookingList },
    ],
  },
  {
    path: '/login',
    Component: Login,
  },
  {
    path: '/signup',
    Component: Register,
  },
  {
    path: '/forgot-password',
    Component: ForgotPassword,
  },
  {
    path: '/reset-password/:token',
    Component: ResetPassword,
  },

  {
    path: '/worker',
    element: (
      <ProtectedRoute>
        <RoleBasedRoute allowedRoles={'Worker'}>
          <WorkerLayout />
        </RoleBasedRoute>
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to='/worker/jobs' replace />,
      },
      { path: 'jobs', Component: WorkerPortal },
      { path: 'schedule', Component: Schedule },
      { path: 'earnings', Component: Earnings },
      { path: 'info', Component: AddWorker },
    ],
  },

  {
    path: '/customer',
    element: <CustomerLayout />,
    children: [
      { index: true, element: <Navigate to='/customer/dashboard' replace /> },
      { path: 'dashboard', Component: CustomerDashboard },
      { path: 'manage-workers', Component: CustomerPage },
      { path: 'hire-worker/:id', Component: HirePage },
      {
        path: 'payment-confirmation',
        Component: PaymentConfirmationPage,
      },
      {
        path: 'my-booking',
        Component: MyBooking,
      },
      { path: 'service-page', Component: Services },
    ],
  },
]);
export default routes;
