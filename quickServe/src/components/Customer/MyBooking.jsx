import {
  Calendar,
  ChevronDown,
  ChevronUp,
  Clock,
  Filter,
  MapPin,
  Package,
  X,
} from 'lucide-react';
import React, { useContext, useMemo, useState } from 'react';
import { useGetCustomerBookings } from '../../hooks/useBooking';
import { AuthContext } from '../Context/AuthContext';
import Card from '../ui/Card';

function MyBooking() {
  const { user } = useContext(AuthContext);
  const customerId = user?.id;

  const {
    data: bookingsResponse,
    isLoading,
    isError,
    error,
  } = useGetCustomerBookings(customerId);

  const [statusFilter, setStatusFilter] = useState('all');
  const [expandedBooking, setExpandedBooking] = useState(null);

  // Backend returns either { data: [...] } or a raw array; normalize to array
  const bookings = Array.isArray(bookingsResponse)
    ? bookingsResponse
    : bookingsResponse?.data || [];

  // Filter bookings by status
  const filteredBookings = useMemo(() => {
    if (statusFilter === 'all') return bookings;
    return bookings.filter((booking) => booking.status === statusFilter);
  }, [bookings, statusFilter]);

  // Group bookings by status for summary
  const bookingStats = useMemo(() => {
    return {
      total: bookings.length,
      pending: bookings.filter((b) => b.status === 'pending').length,
      confirmed: bookings.filter((b) => b.status === 'confirmed').length,
      paid: bookings.filter((b) => b.status === 'paid').length,
      cancelled: bookings.filter((b) => b.status === 'cancelled').length,
    };
  }, [bookings]);

  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Format time helper
  const formatTime = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Get status badge styling
  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      confirmed: 'bg-blue-100 text-blue-800 border-blue-200',
      paid: 'bg-green-100 text-green-800 border-green-200',
      cancelled: 'bg-red-100 text-red-800 border-red-200',
    };
    return styles[status] || styles.pending;
  };

  // Toggle expand booking details
  const toggleExpand = (bookingId) => {
    setExpandedBooking(expandedBooking === bookingId ? null : bookingId);
  };

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

  if (isLoading) {
    return (
      <div className='min-h-screen bg-gray-50 p-6 flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto'></div>
          <p className='mt-4 text-gray-600'>Loading your bookings...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className='min-h-screen bg-gray-50 p-6 flex items-center justify-center'>
        <div className='text-center max-w-md'>
          <div className='w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4'>
            <X className='w-8 h-8 text-red-600' />
          </div>
          <p className='text-red-600 font-semibold text-lg mb-2'>
            Failed to load bookings
          </p>
          <p className='text-gray-600'>
            {error?.message || 'Unknown error occurred'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-50 p-6'>
      <div className='max-w-7xl mx-auto'>
        {/* Header */}
        <div className='mb-8'>
          <h1 className='text-3xl font-bold text-gray-900 mb-2'>My Bookings</h1>
          <p className='text-gray-600'>
            View and manage all your service bookings
          </p>
        </div>

        {/* Statistics Cards */}
        {bookings.length > 0 && (
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6'>
            <Card
              title='Total Bookings'
              value={bookingStats.total}
              icon={Package}
              iconColor='text-blue-600'
              iconBgColor='bg-blue-100'
            />
            <Card
              title='Pending'
              value={bookingStats.pending}
              icon={Clock}
              iconColor='text-yellow-600'
              iconBgColor='bg-yellow-100'
            />
            <Card
              title='Confirmed'
              value={bookingStats.confirmed}
              icon={Calendar}
              iconColor='text-blue-600'
              iconBgColor='bg-blue-100'
            />
            <Card
              title='Paid'
              value={bookingStats.paid}
              icon={Package}
              iconColor='text-green-600'
              iconBgColor='bg-green-100'
            />
            <Card
              title='Cancelled'
              value={bookingStats.cancelled}
              icon={X}
              iconColor='text-red-600'
              iconBgColor='bg-red-100'
            />
          </div>
        )}

        {/* Filter Section */}
        {bookings.length > 0 && (
          <div className='bg-white rounded-lg shadow-sm p-4 mb-6'>
            <div className='flex items-center gap-4 flex-wrap'>
              <div className='flex items-center gap-2'>
                <Filter className='w-5 h-5 text-gray-600' />
                <span className='text-sm font-medium text-gray-700'>
                  Filter by:
                </span>
              </div>
              <div className='flex flex-wrap gap-2'>
                {['all', 'pending', 'confirmed', 'paid', 'cancelled'].map(
                  (status) => (
                    <button
                      key={status}
                      onClick={() => setStatusFilter(status)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
                        statusFilter === status
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}>
                      {status === 'all' ? 'All' : status}
                      {status !== 'all' && (
                        <span className='ml-2 text-xs opacity-75'>
                          ({bookings.filter((b) => b.status === status).length})
                        </span>
                      )}
                    </button>
                  )
                )}
              </div>
            </div>
          </div>
        )}

        {/* Bookings List */}
        {filteredBookings.length === 0 ? (
          <div className='bg-white rounded-lg shadow-sm p-12 text-center'>
            {bookings.length === 0 ? (
              <>
                <div className='w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                  <Calendar className='w-10 h-10 text-gray-400' />
                </div>
                <h3 className='text-xl font-semibold text-gray-900 mb-2'>
                  No bookings yet
                </h3>
                <p className='text-gray-600 mb-6'>
                  Start booking services to see them here
                </p>
              </>
            ) : (
              <>
                <div className='w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                  <Filter className='w-10 h-10 text-gray-400' />
                </div>
                <h3 className='text-xl font-semibold text-gray-900 mb-2'>
                  No bookings found
                </h3>
                <p className='text-gray-600 mb-6'>
                  Try selecting a different filter
                </p>
                <button
                  onClick={() => setStatusFilter('all')}
                  className='px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'>
                  Show All Bookings
                </button>
              </>
            )}
          </div>
        ) : (
          <div className='space-y-4'>
            {filteredBookings.map((booking) => {
              const isExpanded = expandedBooking === booking.id;
              return (
                <div
                  key={booking.id}
                  className='bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow'>
                  {/* Main Booking Card */}
                  <div className='p-6'>
                    <div className='flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4'>
                      {/* Left Section */}
                      <div className='flex-1 space-y-3'>
                        <div className='flex items-start justify-between gap-4'>
                          <div className='flex-1'>
                            <div className='flex items-center gap-3 mb-2'>
                              <h3 className='text-lg font-semibold text-gray-900'>
                                {booking.service_subcategory?.name ||
                                  booking.service?.name ||
                                  'Service'}
                              </h3>
                              <span
                                className={`px-3 py-1 text-xs font-semibold rounded-full capitalize border ${getStatusBadge(
                                  booking.status
                                )}`}>
                                {booking.status}
                              </span>
                            </div>
                            {booking.service?.name && (
                              <p className='text-sm text-gray-600 mb-1'>
                                {booking.service.name}
                              </p>
                            )}
                            <p className='text-xs text-gray-500'>
                              Booking ID: #{booking.id}
                            </p>
                          </div>
                        </div>

                        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
                          <div className='flex items-center gap-2 text-sm text-gray-600'>
                            <Calendar className='w-4 h-4 text-gray-400' />
                            <span>
                              <span className='font-medium'>Date:</span>{' '}
                              {formatDate(booking.scheduled_at)}
                            </span>
                          </div>
                          <div className='flex items-center gap-2 text-sm text-gray-600'>
                            <Clock className='w-4 h-4 text-gray-400' />
                            <span>
                              <span className='font-medium'>Time:</span>{' '}
                              {formatTime(booking.scheduled_at)}
                            </span>
                          </div>
                          <div className='flex items-center gap-2 text-sm text-gray-600'>
                            <Package className='w-4 h-4 text-gray-400' />
                            <span>
                              <span className='font-medium'>Quantity:</span>{' '}
                              {booking.quantity}{' '}
                              {booking.service_subcategory?.unit_type && (
                                <span className='text-gray-500'>
                                  ({booking.service_subcategory.unit_type})
                                </span>
                              )}
                            </span>
                          </div>
                          <div className='flex items-center gap-2 text-sm text-gray-600'>
                            <span className='font-medium capitalize'>
                              Shift:
                            </span>{' '}
                            <span className='capitalize'>
                              {booking.shift_type}
                            </span>
                            {booking.shift_charge_percent > 0 && (
                              <span className='text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded'>
                                +{booking.shift_charge_percent}%
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right Section - Price & Actions */}
                      <div className='flex flex-col lg:items-end gap-3'>
                        <div className='text-right'>
                          <p className='text-sm text-gray-600 mb-1'>
                            Unit Price: ৳{Number(booking.unit_price).toFixed(2)}
                          </p>
                          <p className='text-2xl font-bold text-green-600'>
                            ৳{Number(booking.total_amount).toFixed(2)}
                          </p>
                          {booking.shift_charge_percent > 0 && (
                            <p className='text-xs text-gray-500 mt-1'>
                              Subtotal: ৳
                              {Number(booking.subtotal_amount).toFixed(2)} +
                              Shift Charge
                            </p>
                          )}
                        </div>
                        <button
                          onClick={() => toggleExpand(booking.id)}
                          className='flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors'>
                          {isExpanded ? (
                            <>
                              <ChevronUp className='w-4 h-4' />
                              Hide Details
                            </>
                          ) : (
                            <>
                              <ChevronDown className='w-4 h-4' />
                              View Details
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className='border-t border-gray-200 bg-gray-50 p-6'>
                      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                        {/* Customer Information */}
                        <div>
                          <h4 className='text-sm font-semibold text-gray-900 mb-3'>
                            Customer Information
                          </h4>
                          <div className='space-y-2 text-sm'>
                            <div>
                              <span className='text-gray-600'>Name:</span>{' '}
                              <span className='font-medium text-gray-900'>
                                {booking.customer_name || 'N/A'}
                              </span>
                            </div>
                            <div>
                              <span className='text-gray-600'>Email:</span>{' '}
                              <span className='font-medium text-gray-900'>
                                {booking.customer_email || 'N/A'}
                              </span>
                            </div>
                            <div>
                              <span className='text-gray-600'>Phone:</span>{' '}
                              <span className='font-medium text-gray-900'>
                                {booking.customer_phone || 'N/A'}
                              </span>
                            </div>
                            <div className='flex items-start gap-2 mt-3'>
                              <MapPin className='w-4 h-4 text-gray-400 mt-0.5' />
                              <div>
                                <span className='text-gray-600 block mb-1'>
                                  Service Address:
                                </span>
                                <span className='font-medium text-gray-900'>
                                  {booking.service_address || 'N/A'}
                                </span>
                              </div>
                            </div>
                            {booking.special_instructions && (
                              <div className='mt-3'>
                                <span className='text-gray-600 block mb-1'>
                                  Special Instructions:
                                </span>
                                <p className='text-gray-900 bg-white p-2 rounded border border-gray-200'>
                                  {booking.special_instructions}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Booking Details */}
                        <div>
                          <h4 className='text-sm font-semibold text-gray-900 mb-3'>
                            Booking Details
                          </h4>
                          <div className='space-y-2 text-sm'>
                            <div>
                              <span className='text-gray-600'>Service:</span>{' '}
                              <span className='font-medium text-gray-900'>
                                {booking.service?.name || 'N/A'}
                              </span>
                            </div>
                            <div>
                              <span className='text-gray-600'>
                                Subcategory:
                              </span>{' '}
                              <span className='font-medium text-gray-900'>
                                {booking.service_subcategory?.name || 'N/A'}
                              </span>
                            </div>
                            <div>
                              <span className='text-gray-600'>Unit Type:</span>{' '}
                              <span className='font-medium text-gray-900 capitalize'>
                                {booking.service_subcategory?.unit_type ||
                                  'N/A'}
                              </span>
                            </div>
                            <div className='border-t border-gray-200 pt-3 mt-3'>
                              <div className='space-y-2'>
                                <div className='flex justify-between'>
                                  <span className='text-gray-600'>
                                    Subtotal:
                                  </span>
                                  <span className='font-medium text-gray-900'>
                                    ৳
                                    {Number(booking.subtotal_amount).toFixed(2)}
                                  </span>
                                </div>
                                {booking.shift_charge_percent > 0 && (
                                  <div className='flex justify-between'>
                                    <span className='text-gray-600'>
                                      Shift Charge (
                                      {booking.shift_charge_percent}%):
                                    </span>
                                    <span className='font-medium text-gray-900'>
                                      ৳
                                      {(
                                        Number(booking.total_amount) -
                                        Number(booking.subtotal_amount)
                                      ).toFixed(2)}
                                    </span>
                                  </div>
                                )}
                                <div className='flex justify-between pt-2 border-t border-gray-200'>
                                  <span className='font-semibold text-gray-900'>
                                    Total Amount:
                                  </span>
                                  <span className='font-bold text-green-600'>
                                    ৳{Number(booking.total_amount).toFixed(2)}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className='pt-3 border-t border-gray-200 mt-3'>
                              <div className='text-xs text-gray-500 space-y-1'>
                                <p>
                                  Created:{' '}
                                  {new Date(
                                    booking.created_at
                                  ).toLocaleString()}
                                </p>
                                {booking.updated_at !== booking.created_at && (
                                  <p>
                                    Updated:{' '}
                                    {new Date(
                                      booking.updated_at
                                    ).toLocaleString()}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default MyBooking;
