import React, { useContext, useEffect, useRef } from 'react';
import { toast } from 'react-hot-toast';
import { useLocation } from 'react-router';
import { useGetCustomerBookings } from '../../hooks/useBooking';
import { AuthContext } from '../Context/AuthContext';
import BookingList from '../shared/BookingList';

function MyBooking() {
  const { user } = useContext(AuthContext);
  const location = useLocation();
  const customerId = user?.id;
  const toastShownRef = useRef(false);

  // Handle payment callback status
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const status = searchParams.get('status');
    const message = searchParams.get('message');
    const transactionId = searchParams.get('transaction_id');

    // Reset ref when search params are cleared
    if (!location.search) {
      toastShownRef.current = false;
      return;
    }

    // Only process if there's a status and we haven't shown toast for this status yet
    if (!status || toastShownRef.current === status) {
      return;
    }

    // Set ref immediately to prevent duplicate toasts
    toastShownRef.current = status;

    if (status === 'success') {
      toast.success('Payment completed successfully!');
      // Refresh bookings by removing query params
      window.history.replaceState({}, '', location.pathname);
    } else if (status === 'failed') {
      toast.error(message || 'Payment failed');
      window.history.replaceState({}, '', location.pathname);
    } else if (status === 'cancelled') {
      toast.error('Payment was cancelled');
      window.history.replaceState({}, '', location.pathname);
    } else if (status === 'error') {
      toast.error(message || 'An error occurred during payment');
      window.history.replaceState({}, '', location.pathname);
    }
  }, [location.search, location.pathname]);

  const {
    data: bookingsResponse,
    isLoading,
    isError,
    error,
  } = useGetCustomerBookings(customerId);

  if (!customerId) {
    return (
      <div className='min-h-screen bg-gray-50 p-6 flex items-center justify-center'>
        <div className='text-center'>
          <p className='text-gray-600 text-lg'>
            Please log in to view your bookings.
          </p>
        </div>
      </div>
    );
  }

  return (
    <BookingList
      bookings={bookingsResponse}
      isLoading={isLoading}
      isError={isError}
      error={error}
      title='My Bookings'
      description='View and manage all your service bookings'
      emptyTitle='No bookings yet'
      emptyMessage='Start booking services to see them here'
      emptyActionText='Show All Bookings'
      totalLabel='Total Bookings'
      viewType='customer'
    />
  );
}

export default MyBooking;
