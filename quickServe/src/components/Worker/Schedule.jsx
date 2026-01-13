import { Calendar, Clock, MapPin, Package, User } from 'lucide-react';
import React, { useContext, useMemo, useState } from 'react';
import { useGetWorkerBookings } from '../../hooks/useBooking';
import { useCheckWorkerProfile } from '../../hooks/useWorker';
import { AuthContext } from '../Context/AuthContext';
import Card from '../ui/Card';

export default function Schedule() {
  const { user } = useContext(AuthContext);
  const {
    data: profileData,
    isLoading: profileLoading,
    isError: profileError,
  } = useCheckWorkerProfile();

  const {
    data: bookingsResponse,
    isLoading: bookingsLoading,
    isError: bookingsError,
    error: bookingsErrorData,
  } = useGetWorkerBookings(user?.id);

  const [selectedDate, setSelectedDate] = useState(null);

  // Normalize bookings data (backend already filters by worker_id)
  const bookings = useMemo(() => {
    if (!bookingsResponse) return [];
    return Array.isArray(bookingsResponse)
      ? bookingsResponse
      : bookingsResponse?.data || [];
  }, [bookingsResponse]);

  // Group bookings by date
  const bookingsByDate = useMemo(() => {
    const grouped = {};
    bookings.forEach((booking) => {
      if (booking.scheduled_at) {
        const date = new Date(booking.scheduled_at);
        const dateKey = date.toISOString().split('T')[0]; // YYYY-MM-DD
        if (!grouped[dateKey]) {
          grouped[dateKey] = [];
        }
        grouped[dateKey].push(booking);
      }
    });
    // Sort bookings within each date by time
    Object.keys(grouped).forEach((date) => {
      grouped[date].sort((a, b) => {
        return new Date(a.scheduled_at) - new Date(b.scheduled_at);
      });
    });
    return grouped;
  }, [bookings]);

  // Get upcoming dates (next 30 days)
  const upcomingDates = useMemo(() => {
    const dates = Object.keys(bookingsByDate).filter((date) => {
      const bookingDate = new Date(date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return bookingDate >= today;
    });
    return dates.sort();
  }, [bookingsByDate]);

  // Get past dates
  const pastDates = useMemo(() => {
    const dates = Object.keys(bookingsByDate).filter((date) => {
      const bookingDate = new Date(date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return bookingDate < today;
    });
    return dates.sort().reverse();
  }, [bookingsByDate]);

  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
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

  // Statistics
  const stats = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayKey = today.toISOString().split('T')[0];

    return {
      total: bookings.length,
      today: bookingsByDate[todayKey]?.length || 0,
      upcoming: upcomingDates.reduce(
        (sum, date) => sum + bookingsByDate[date].length,
        0
      ),
      completed: pastDates.reduce(
        (sum, date) => sum + bookingsByDate[date].length,
        0
      ),
    };
  }, [bookings, bookingsByDate, upcomingDates, pastDates]);

  if (profileLoading || bookingsLoading) {
    return (
      <div className='flex justify-center items-center py-12'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto'></div>
          <p className='mt-4 text-gray-600'>Loading schedule...</p>
        </div>
      </div>
    );
  }

  if (profileError || !profileData?.isComplete) {
    return (
      <div className='text-center py-12'>
        <h1 className='text-2xl font-bold text-gray-900 mb-2'>
          {profileData?.message || 'Complete your info to view schedule'}
        </h1>
        <p className='text-gray-600'>
          Please complete your profile to view your schedule
        </p>
      </div>
    );
  }

  if (bookingsError) {
    return (
      <div className='text-center py-12'>
        <div className='w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4'>
          <Calendar className='w-8 h-8 text-red-600' />
        </div>
        <p className='text-red-600 font-semibold text-lg mb-2'>
          Failed to load schedule
        </p>
        <p className='text-gray-600'>
          {bookingsErrorData?.message || 'Unknown error occurred'}
        </p>
      </div>
    );
  }

  const allDates = [...upcomingDates, ...pastDates];
  const displayDates = selectedDate
    ? [selectedDate]
    : allDates.length > 0
    ? allDates
    : [];

  return (
    <div className='min-h-screen bg-gray-50 p-6'>
      <div className='max-w-7xl mx-auto'>
        {/* Header */}
        <div className='mb-8'>
          <h1 className='text-3xl font-bold text-gray-900 mb-2'>My Schedule</h1>
          <p className='text-gray-600'>
            View and manage your scheduled job appointments
          </p>
        </div>

        {/* Statistics Cards */}
        {bookings.length > 0 && (
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6'>
            <Card
              title='Total Appointments'
              value={stats.total}
              icon={Calendar}
              iconColor='text-blue-600'
              iconBgColor='bg-blue-100'
            />
            <Card
              title="Today's Jobs"
              value={stats.today}
              icon={Clock}
              iconColor='text-yellow-600'
              iconBgColor='bg-yellow-100'
            />
            <Card
              title='Upcoming'
              value={stats.upcoming}
              icon={Calendar}
              iconColor='text-green-600'
              iconBgColor='bg-green-100'
            />
            <Card
              title='Completed'
              value={stats.completed}
              icon={Package}
              iconColor='text-gray-600'
              iconBgColor='bg-gray-100'
            />
          </div>
        )}

        {/* Schedule List */}
        {displayDates.length === 0 ? (
          <div className='bg-white rounded-lg shadow-sm p-12 text-center'>
            <div className='w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4'>
              <Calendar className='w-10 h-10 text-gray-400' />
            </div>
            <h3 className='text-xl font-semibold text-gray-900 mb-2'>
              No scheduled appointments
            </h3>
            <p className='text-gray-600'>
              Your scheduled appointments will appear here
            </p>
          </div>
        ) : (
          <div className='space-y-6'>
            {displayDates.map((dateKey) => {
              const dateBookings = bookingsByDate[dateKey];
              const bookingDate = new Date(dateKey);
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              const isPast = bookingDate < today;
              const isToday =
                bookingDate.toISOString().split('T')[0] ===
                today.toISOString().split('T')[0];

              return (
                <div
                  key={dateKey}
                  className='bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden'>
                  {/* Date Header */}
                  <div
                    className={`p-4 border-b border-gray-200 ${
                      isToday
                        ? 'bg-blue-50 border-blue-200'
                        : isPast
                        ? 'bg-gray-50'
                        : 'bg-green-50 border-green-200'
                    }`}>
                    <div className='flex items-center justify-between'>
                      <div className='flex items-center gap-3'>
                        <Calendar
                          className={`w-5 h-5 ${
                            isToday
                              ? 'text-blue-600'
                              : isPast
                              ? 'text-gray-600'
                              : 'text-green-600'
                          }`}
                        />
                        <h2 className='text-lg font-semibold text-gray-900'>
                          {formatDate(dateKey)}
                        </h2>
                        {isToday && (
                          <span className='px-2 py-1 text-xs font-medium bg-blue-600 text-white rounded'>
                            Today
                          </span>
                        )}
                      </div>
                      <span className='text-sm text-gray-600'>
                        {dateBookings.length} appointment
                        {dateBookings.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>

                  {/* Bookings for this date */}
                  <div className='divide-y divide-gray-200'>
                    {dateBookings.map((booking) => (
                      <div
                        key={booking.id}
                        className='p-6 hover:bg-gray-50 transition-colors'>
                        <div className='flex items-start justify-between gap-4'>
                          <div className='flex-1'>
                            <div className='flex items-center gap-3 mb-2'>
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-semibold border capitalize ${getStatusBadge(
                                  booking.status
                                )}`}>
                                {booking.status}
                              </span>
                              <span className='text-sm text-gray-500'>
                                Booking ID: #{booking.id}
                              </span>
                            </div>

                            <h3 className='text-lg font-semibold text-gray-900 mb-2'>
                              {booking.service_subcategory?.name ||
                                booking.service?.name ||
                                'Service'}
                            </h3>

                            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4'>
                              <div className='flex items-center gap-2 text-sm text-gray-600'>
                                <Clock className='w-4 h-4 text-gray-400' />
                                <span>
                                  <span className='font-medium'>Time:</span>{' '}
                                  {formatTime(booking.scheduled_at)}
                                </span>
                              </div>
                              <div className='flex items-center gap-2 text-sm text-gray-600'>
                                <User className='w-4 h-4 text-gray-400' />
                                <span>
                                  <span className='font-medium'>Customer:</span>{' '}
                                  {booking.customer_name ||
                                    booking.customer?.name ||
                                    'N/A'}
                                </span>
                              </div>
                              <div className='flex items-center gap-2 text-sm text-gray-600'>
                                <MapPin className='w-4 h-4 text-gray-400' />
                                <span>
                                  <span className='font-medium'>Location:</span>{' '}
                                  {booking.service_address || 'N/A'}
                                </span>
                              </div>
                              <div className='flex items-center gap-2 text-sm text-gray-600'>
                                <Package className='w-4 h-4 text-gray-400' />
                                <span>
                                  <span className='font-medium'>Amount:</span> ৳
                                  {parseFloat(
                                    booking.total_amount || 0
                                  ).toFixed(2)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
