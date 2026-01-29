import React, { useMemo } from 'react';
import { useGetAllBookings } from '../../../hooks/useBooking';
import BookingListComponent from '../../shared/BookingList';

function BookingList() {
  const { data: bookingsData, isLoading, isError, error } = useGetAllBookings();

  // Normalize bookings data to ensure all bookings are shown
  const normalizedBookings = useMemo(() => {
    if (!bookingsData) return [];
    return Array.isArray(bookingsData) ? bookingsData : bookingsData?.data || [];
  }, [bookingsData]);

  return (
    <BookingListComponent
      bookings={normalizedBookings}
      isLoading={isLoading}
      isError={isError}
      error={error}
      title='All Bookings'
      description='View and manage all bookings in the system. You can reactivate cancelled bookings or change their status.'
      emptyTitle='No bookings found'
      emptyMessage='There are no bookings in the system yet'
      emptyActionText='Refresh'
      totalLabel='Total Bookings'
      viewType='admin'
    />
  );
}

export default BookingList;
