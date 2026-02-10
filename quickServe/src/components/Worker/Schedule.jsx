import { Calendar, ChevronLeft, ChevronRight, Clock, MapPin, Package, User } from 'lucide-react';
import React, { useContext, useMemo, useState } from 'react';
import { useGetWorkerBookings } from '../../hooks/useBooking';
import { useCheckWorkerProfile } from '../../hooks/useWorker';
import { AuthContext } from '../Context/AuthContext';
import Card from '../ui/Card';

export default function Schedule() {
  const { user } = useContext(AuthContext);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [viewFilter, setViewFilter] = useState('upcoming'); // 'all', 'today', 'week', 'month', 'upcoming'

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


  // Normalize bookings data (backend already filters by worker_id)
  // Only include bookings with scheduled_at (actual scheduled appointments)
  const bookings = useMemo(() => {
    if (!bookingsResponse) return [];
    const allBookings = Array.isArray(bookingsResponse)
      ? bookingsResponse
      : bookingsResponse?.data || [];
    // Filter to only show bookings with scheduled_at (scheduled appointments)
    return allBookings.filter((booking) => booking.scheduled_at && booking.status !== 'cancelled');
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

    // Filter out cancelled bookings for upcoming count
    const upcomingBookings = upcomingDates.reduce((acc, date) => {
      const dateBookings = bookingsByDate[date] || [];
      // Only count non-cancelled bookings (pending, confirmed, paid)
      const activeBookings = dateBookings.filter(
        (booking) => booking.status !== 'cancelled'
      );
      return acc + activeBookings.length;
    }, 0);

    // Filter out cancelled bookings for today count
    const todayBookings = bookingsByDate[todayKey] || [];
    const todayActiveBookings = todayBookings.filter(
      (booking) => booking.status !== 'cancelled'
    );

    return {
      total: bookings.length,
      today: todayActiveBookings.length,
      upcoming: upcomingBookings,
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

  // Filter dates based on view filter
  const filteredDates = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayKey = today.toISOString().split('T')[0];

    switch (viewFilter) {
      case 'today':
        return [todayKey].filter((date) => bookingsByDate[date]);
      case 'week': {
        const weekDates = [];
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        for (let i = 0; i < 7; i++) {
          const date = new Date(startOfWeek);
          date.setDate(startOfWeek.getDate() + i);
          const dateKey = date.toISOString().split('T')[0];
          if (bookingsByDate[dateKey]) {
            weekDates.push(dateKey);
          }
        }
        return weekDates;
      }
      case 'month': {
        const monthDates = [];
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        for (let day = 1; day <= daysInMonth; day++) {
          const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          if (bookingsByDate[dateKey]) {
            monthDates.push(dateKey);
          }
        }
        return monthDates;
      }
      case 'upcoming':
        return upcomingDates;
      default:
        return [...upcomingDates, ...pastDates];
    }
  }, [viewFilter, upcomingDates, pastDates, bookingsByDate, currentMonth]);

  // Get selected date bookings for timeline view
  const selectedDateBookings = useMemo(() => {
    return bookingsByDate[selectedDate] || [];
  }, [bookingsByDate, selectedDate]);

  // Calendar helper functions
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek, year, month };
  };

  const navigateMonth = (direction) => {
    setCurrentMonth((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + direction);
      return newDate;
    });
  };

  const getDateKey = (day) => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  const hasBookingsOnDate = (dateKey) => {
    return bookingsByDate[dateKey] && bookingsByDate[dateKey].length > 0;
  };

  const isToday = (dateKey) => {
    const today = new Date().toISOString().split('T')[0];
    return dateKey === today;
  };

  const isSelected = (dateKey) => {
    return dateKey === selectedDate;
  };

  const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentMonth);
  const monthName = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div className='p-4 md:p-6 bg-neutral-50 min-h-screen'>
      <div className='max-w-7xl mx-auto'>
        {/* Header */}
        <div className='mb-6'>
          <h1 className='text-2xl md:text-3xl font-bold text-slate-900 mb-1'>
            Schedule Calendar
          </h1>
          <p className='text-neutral-600 text-sm'>
            View your appointments in a calendar view and timeline
          </p>
        </div>

        {/* Statistics Cards */}
        {bookings.length > 0 && (
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5 mb-6'>
            <Card
              title='Total Appointments'
              value={stats.total}
              icon={Calendar}
              iconColor='text-blue-600'
              iconBgColor='bg-blue-50'
              bgColor='bg-gradient-to-br from-blue-50/50 to-white'
              borderColor='border-blue-100'
            />
            <Card
              title="Today's Jobs"
              value={stats.today}
              icon={Clock}
              iconColor='text-yellow-600'
              iconBgColor='bg-yellow-50'
              bgColor='bg-gradient-to-br from-yellow-50/50 to-white'
              borderColor='border-yellow-100'
            />
            <Card
              title='Upcoming'
              value={stats.upcoming}
              icon={Calendar}
              iconColor='text-emerald-600'
              iconBgColor='bg-emerald-50'
              bgColor='bg-gradient-to-br from-emerald-50/50 to-white'
              borderColor='border-emerald-100'
            />
            <Card
              title='Completed'
              value={stats.completed}
              icon={Package}
              iconColor='text-indigo-600'
              iconBgColor='bg-indigo-50'
              bgColor='bg-gradient-to-br from-indigo-50/50 to-white'
              borderColor='border-indigo-100'
            />
          </div>
        )}

        {/* Filter Buttons */}
        <div className='mb-6 flex flex-wrap gap-2'>
          <button
            onClick={() => setViewFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${viewFilter === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
              }`}>
            All
          </button>
          <button
            onClick={() => setViewFilter('today')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${viewFilter === 'today'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
              }`}>
            Today
          </button>
          <button
            onClick={() => setViewFilter('week')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${viewFilter === 'week'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
              }`}>
            This Week
          </button>
          <button
            onClick={() => setViewFilter('month')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${viewFilter === 'month'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
              }`}>
            This Month
          </button>
          <button
            onClick={() => setViewFilter('upcoming')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${viewFilter === 'upcoming'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
              }`}>
            Upcoming
          </button>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
          {/* Calendar View */}
          <div className='lg:col-span-2'>
            <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6'>
              <div className='flex items-center justify-between mb-6'>
                <h2 className='text-xl font-semibold text-gray-900'>{monthName}</h2>
                <div className='flex items-center gap-2'>
                  <button
                    onClick={() => navigateMonth(-1)}
                    className='p-2 hover:bg-gray-100 rounded-lg transition-colors'>
                    <ChevronLeft className='w-5 h-5 text-gray-600' />
                  </button>
                  <button
                    onClick={() => setCurrentMonth(new Date())}
                    className='px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors'>
                    Today
                  </button>
                  <button
                    onClick={() => navigateMonth(1)}
                    className='p-2 hover:bg-gray-100 rounded-lg transition-colors'>
                    <ChevronRight className='w-5 h-5 text-gray-600' />
                  </button>
                </div>
              </div>

              {/* Calendar Grid */}
              <div className='grid grid-cols-7 gap-2'>
                {/* Day Headers */}
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                  <div key={day} className='text-center text-sm font-semibold text-gray-600 py-2'>
                    {day}
                  </div>
                ))}

                {/* Empty cells for days before month starts */}
                {Array.from({ length: startingDayOfWeek }).map((_, index) => (
                  <div key={`empty-${index}`} className='aspect-square' />
                ))}

                {/* Calendar Days */}
                {Array.from({ length: daysInMonth }).map((_, index) => {
                  const day = index + 1;
                  const dateKey = getDateKey(day);
                  const hasBookings = hasBookingsOnDate(dateKey);
                  const isTodayDate = isToday(dateKey);
                  const isSelectedDate = isSelected(dateKey);

                  return (
                    <button
                      key={day}
                      onClick={() => setSelectedDate(dateKey)}
                      className={`aspect-square p-2 rounded-lg border-2 transition-all ${isSelectedDate
                        ? 'border-blue-600 bg-blue-50'
                        : isTodayDate
                          ? 'border-blue-300 bg-blue-50/50'
                          : hasBookings
                            ? 'border-emerald-200 bg-emerald-50/50 hover:bg-emerald-100'
                            : 'border-gray-200 hover:bg-gray-50'
                        }`}>
                      <div className='flex flex-col items-center justify-center h-full'>
                        <span
                          className={`text-sm font-medium ${isSelectedDate
                            ? 'text-blue-700'
                            : isTodayDate
                              ? 'text-blue-600'
                              : hasBookings
                                ? 'text-emerald-700'
                                : 'text-gray-700'
                            }`}>
                          {day}
                        </span>
                        {hasBookings && (
                          <span className='text-xs text-gray-600 mt-1'>
                            {bookingsByDate[dateKey]?.length || 0}
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Timeline View for Selected Date */}
          <div className='lg:col-span-1'>
            <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6'>
              <h3 className='text-lg font-semibold text-gray-900 mb-4'>
                {selectedDateBookings.length > 0 ? formatDate(selectedDate) : 'Select a Date'}
              </h3>
              {selectedDateBookings.length === 0 ? (
                <div className='text-center py-8'>
                  <Calendar className='w-12 h-12 text-gray-400 mx-auto mb-3' />
                  <p className='text-gray-600 text-sm'>
                    {selectedDate === new Date().toISOString().split('T')[0]
                      ? "No appointments scheduled for today"
                      : "No appointments on this date"}
                  </p>
                </div>
              ) : (
                <div className='space-y-4'>
                  {selectedDateBookings
                    .sort((a, b) => new Date(a.scheduled_at) - new Date(b.scheduled_at))
                    .map((booking) => (
                      <div
                        key={booking.id}
                        className='p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors'>
                        <div className='flex items-center gap-2 mb-2'>
                          <Clock className='w-4 h-4 text-blue-600' />
                          <span className='text-sm font-semibold text-gray-900'>
                            {formatTime(booking.scheduled_at)}
                          </span>
                          <span
                            className={`ml-auto px-2 py-1 rounded text-xs font-medium capitalize ${getStatusBadge(
                              booking.status
                            )}`}>
                            {booking.status}
                          </span>
                        </div>
                        <h4 className='text-sm font-semibold text-gray-900 mb-1'>
                          {booking.service_subcategory?.name ||
                            booking.service?.name ||
                            'Service'}
                        </h4>
                        <div className='space-y-1 text-xs text-gray-600'>
                          <div className='flex items-center gap-1'>
                            <User className='w-3 h-3' />
                            <span>{booking.customer_name || booking.customer?.name || 'N/A'}</span>
                          </div>
                          <div className='flex items-center gap-1'>
                            <MapPin className='w-3 h-3' />
                            <span className='truncate'>{booking.service_address || 'N/A'}</span>
                          </div>
                          <div className='flex items-center gap-1'>
                            <Package className='w-3 h-3' />
                            <span>৳{parseFloat(booking.total_amount || 0).toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
