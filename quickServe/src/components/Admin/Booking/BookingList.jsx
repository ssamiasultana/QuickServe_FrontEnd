import React from 'react';
import { useGetAllBookings } from '../../../hooks/useBooking';

function BookingList() {
  const { data } = useGetAllBookings;
  console.log(data);
  return <div>Booking</div>;
}

export default BookingList;
