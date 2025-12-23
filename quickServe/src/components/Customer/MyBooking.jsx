import React, { useContext } from 'react';
import { useGetCustomerBookings } from '../../hooks/useBooking';
import { AuthContext } from '../Context/AuthContext';

function MyBooking() {
  const { user } = useContext(AuthContext);
  const customerId = user?.id;

  const {
    data: bookingsResponse,
    isLoading,
    isError,
    error,
  } = useGetCustomerBookings(customerId);
  console.log(bookingsResponse);

  if (!customerId) {
    return <div className='p-4'>Please log in to view your bookings.</div>;
  }

  if (isLoading) {
    return <div className='p-4'>Loading your bookings...</div>;
  }

  if (isError) {
    return (
      <div className='p-4 text-red-600'>
        Failed to load bookings: {error?.message || 'Unknown error'}
      </div>
    );
  }

  // Backend returns either { data: [...] } or a raw array; normalize to array
  const bookings = Array.isArray(bookingsResponse)
    ? bookingsResponse
    : bookingsResponse?.data || [];

  return (
    <div className='p-4'>
      <h1 className='text-xl font-semibold mb-4'>My Bookings</h1>
      {bookings.length === 0 ? (
        <p className='text-gray-600'>You have no bookings yet.</p>
      ) : (
        <ul className='space-y-3'>
          {bookings.map((booking) => (
            <li
              key={booking.id}
              className='border border-gray-200 rounded-lg p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3'>
              <div className='space-y-1'>
                <p className='font-semibold text-gray-900'>
                  {booking.service?.name || 'Service'} -{' '}
                  {booking.service_subcategory?.name || 'Subcategory'}
                </p>
                <p className='text-sm text-gray-600'>
                  Booking #{booking.id} • {booking.shift_type} shift
                </p>
                <p className='text-sm text-gray-600'>
                  Scheduled at:{' '}
                  {new Date(booking.scheduled_at).toLocaleString()}
                </p>
                <p className='text-sm text-gray-600'>
                  Quantity: {booking.quantity}{' '}
                  {booking.service_subcategory?.unit_type
                    ? `(${booking.service_subcategory.unit_type})`
                    : ''}
                </p>
              </div>
              <div className='flex flex-col items-end gap-1'>
                <p className='text-sm font-semibold text-gray-900'>
                  Unit: ৳{Number(booking.unit_price).toFixed(2)}
                </p>
                <p className='text-sm font-semibold text-green-700'>
                  Total: ৳{Number(booking.total_amount).toFixed(2)}
                </p>
                <span
                  className={`px-2 py-1 text-xs font-semibold rounded-full capitalize ${
                    booking.status === 'pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : booking.status === 'confirmed'
                      ? 'bg-blue-100 text-blue-800'
                      : booking.status === 'paid'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                  {booking.status}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default MyBooking;
