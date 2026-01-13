import React, { useContext } from 'react';
import { useGetCustomerBookings } from '../../hooks/useBooking';
import { AuthContext } from '../Context/AuthContext';
import BookingList from '../shared/BookingList';

function MyBooking() {
  const { user } = useContext(AuthContext);
  const customerId = user?.id;

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
