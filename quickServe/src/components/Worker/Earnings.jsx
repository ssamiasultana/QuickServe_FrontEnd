import { Calendar, DollarSign, Package, TrendingUp } from 'lucide-react';
import React, { useContext, useMemo } from 'react';
import { useGetWorkerBookings } from '../../hooks/useBooking';
import { useCheckWorkerProfile } from '../../hooks/useWorker';
import { AuthContext } from '../Context/AuthContext';
import Card from '../ui/Card';

export default function Earnings() {
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

  // Normalize bookings data (backend already filters by worker_id)
  const bookings = useMemo(() => {
    if (!bookingsResponse) return [];
    return Array.isArray(bookingsResponse)
      ? bookingsResponse
      : bookingsResponse?.data || [];
  }, [bookingsResponse]);

  // Calculate earnings statistics
  const earningsStats = useMemo(() => {
    const paidBookings = bookings.filter((b) => b.status === 'paid');
    const confirmedBookings = bookings.filter((b) => b.status === 'confirmed');

    // Calculate total earnings from paid bookings
    const totalEarnings = paidBookings.reduce((sum, booking) => {
      return sum + parseFloat(booking.total_amount || 0);
    }, 0);

    // Calculate pending earnings from confirmed bookings
    const pendingEarnings = confirmedBookings.reduce((sum, booking) => {
      return sum + parseFloat(booking.total_amount || 0);
    }, 0);

    // Calculate monthly earnings (current month)
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const monthlyEarnings = paidBookings
      .filter((booking) => {
        if (!booking.scheduled_at) return false;
        const bookingDate = new Date(booking.scheduled_at);
        return (
          bookingDate.getMonth() === currentMonth &&
          bookingDate.getFullYear() === currentYear
        );
      })
      .reduce((sum, booking) => {
        return sum + parseFloat(booking.total_amount || 0);
      }, 0);

    // Calculate average per booking
    const averageEarning =
      paidBookings.length > 0 ? totalEarnings / paidBookings.length : 0;

    // Get earnings by month (last 6 months)
    const monthlyBreakdown = {};
    paidBookings.forEach((booking) => {
      if (booking.scheduled_at) {
        const date = new Date(booking.scheduled_at);
        const monthKey = `${date.getFullYear()}-${String(
          date.getMonth() + 1
        ).padStart(2, '0')}`;
        if (!monthlyBreakdown[monthKey]) {
          monthlyBreakdown[monthKey] = 0;
        }
        monthlyBreakdown[monthKey] += parseFloat(booking.total_amount || 0);
      }
    });

    return {
      totalEarnings,
      pendingEarnings,
      monthlyEarnings,
      averageEarning,
      totalPaidJobs: paidBookings.length,
      totalPendingJobs: confirmedBookings.length,
      monthlyBreakdown: Object.entries(monthlyBreakdown)
        .sort((a, b) => b[0].localeCompare(a[0]))
        .slice(0, 6),
    };
  }, [bookings]);

  // Format currency
  const formatCurrency = (amount) => {
    return `৳${parseFloat(amount || 0).toFixed(2)}`;
  };

  // Format month name
  const formatMonth = (monthKey) => {
    const [year, month] = monthKey.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  if (profileLoading || bookingsLoading) {
    return (
      <div className='flex justify-center items-center py-12'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto'></div>
          <p className='mt-4 text-gray-600'>Loading earnings...</p>
        </div>
      </div>
    );
  }

  if (profileError || !profileData?.isComplete) {
    return (
      <div className='text-center py-12'>
        <h1 className='text-2xl font-bold text-gray-900 mb-2'>
          {profileData?.message || 'Complete your info to view earnings'}
        </h1>
        <p className='text-gray-600'>
          Please complete your profile to view your earnings
        </p>
      </div>
    );
  }

  if (bookingsError) {
    return (
      <div className='text-center py-12'>
        <div className='w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4'>
          <DollarSign className='w-8 h-8 text-red-600' />
        </div>
        <p className='text-red-600 font-semibold text-lg mb-2'>
          Failed to load earnings
        </p>
        <p className='text-gray-600'>
          {bookingsErrorData?.message || 'Unknown error occurred'}
        </p>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-50 p-6'>
      <div className='max-w-7xl mx-auto'>
        {/* Header */}
        <div className='mb-8'>
          <h1 className='text-3xl font-bold text-gray-900 mb-2'>My Earnings</h1>
          <p className='text-gray-600'>
            Track your earnings and payment history
          </p>
        </div>

        {/* Statistics Cards */}
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6'>
          <Card
            title='Total Earnings'
            value={formatCurrency(earningsStats.totalEarnings)}
            icon={DollarSign}
            iconColor='text-green-600'
            iconBgColor='bg-green-100'
          />
          <Card
            title='Pending Earnings'
            value={formatCurrency(earningsStats.pendingEarnings)}
            icon={TrendingUp}
            iconColor='text-yellow-600'
            iconBgColor='bg-yellow-100'
          />
          <Card
            title='This Month'
            value={formatCurrency(earningsStats.monthlyEarnings)}
            icon={Calendar}
            iconColor='text-blue-600'
            iconBgColor='bg-blue-100'
          />
          <Card
            title='Average per Job'
            value={formatCurrency(earningsStats.averageEarning)}
            icon={Package}
            iconColor='text-purple-600'
            iconBgColor='bg-purple-100'
          />
        </div>

        {/* Job Statistics */}
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6'>
          <div className='bg-white rounded-lg shadow-sm p-6'>
            <h3 className='text-lg font-semibold text-gray-900 mb-4'>
              Job Statistics
            </h3>
            <div className='space-y-3'>
              <div className='flex items-center justify-between'>
                <span className='text-gray-600'>Completed Jobs</span>
                <span className='text-lg font-semibold text-green-600'>
                  {earningsStats.totalPaidJobs}
                </span>
              </div>
              <div className='flex items-center justify-between'>
                <span className='text-gray-600'>Pending Jobs</span>
                <span className='text-lg font-semibold text-yellow-600'>
                  {earningsStats.totalPendingJobs}
                </span>
              </div>
            </div>
          </div>

          <div className='bg-white rounded-lg shadow-sm p-6'>
            <h3 className='text-lg font-semibold text-gray-900 mb-4'>
              Earnings Summary
            </h3>
            <div className='space-y-3'>
              <div className='flex items-center justify-between'>
                <span className='text-gray-600'>Total Earned</span>
                <span className='text-lg font-semibold text-gray-900'>
                  {formatCurrency(earningsStats.totalEarnings)}
                </span>
              </div>
              <div className='flex items-center justify-between'>
                <span className='text-gray-600'>Pending Payment</span>
                <span className='text-lg font-semibold text-yellow-600'>
                  {formatCurrency(earningsStats.pendingEarnings)}
                </span>
              </div>
              <div className='pt-3 border-t border-gray-200'>
                <div className='flex items-center justify-between'>
                  <span className='text-gray-900 font-semibold'>
                    Expected Total
                  </span>
                  <span className='text-xl font-bold text-blue-600'>
                    {formatCurrency(
                      earningsStats.totalEarnings +
                        earningsStats.pendingEarnings
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Monthly Breakdown */}
        {earningsStats.monthlyBreakdown.length > 0 && (
          <div className='bg-white rounded-lg shadow-sm p-6'>
            <h3 className='text-lg font-semibold text-gray-900 mb-4'>
              Monthly Earnings (Last 6 Months)
            </h3>
            <div className='space-y-3'>
              {earningsStats.monthlyBreakdown.map(([monthKey, amount]) => (
                <div
                  key={monthKey}
                  className='flex items-center justify-between p-3 bg-gray-50 rounded-lg'>
                  <span className='text-gray-700 font-medium'>
                    {formatMonth(monthKey)}
                  </span>
                  <span className='text-lg font-semibold text-green-600'>
                    {formatCurrency(amount)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {earningsStats.totalPaidJobs === 0 &&
          earningsStats.totalPendingJobs === 0 && (
            <div className='bg-white rounded-lg shadow-sm p-12 text-center'>
              <div className='w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                <DollarSign className='w-10 h-10 text-gray-400' />
              </div>
              <h3 className='text-xl font-semibold text-gray-900 mb-2'>
                No earnings yet
              </h3>
              <p className='text-gray-600'>
                Your earnings will appear here once you complete paid jobs
              </p>
            </div>
          )}
      </div>
    </div>
  );
}
