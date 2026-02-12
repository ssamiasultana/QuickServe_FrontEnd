import {
  Activity,
  BarChart3,
  CheckCircle,
  Clock,
  Package,
  TrendingUp,
  UserCheck,
  Users,
} from 'lucide-react';
import { useMemo } from 'react';
import { useGetAllBookings } from '../../hooks/useBooking';
import { useGetAllCustomers } from '../../hooks/useCustomer';
import { useWorkers } from '../../hooks/useWorker';
import Card from '../ui/Card';

// Taka Sign Icon Component
const TakaSignIcon = ({ size = 24, color = "currentColor", ...props }) => {
  return (
    <div
      style={{
        width: size,
        height: size,
        color: color,
        fontSize: 28,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: "bold",
      }}
      {...props}
    >
      ৳
    </div>
  );
};

function Dashboard() {
  const { data: workersData, isLoading: workersLoading } = useWorkers();
  const { data: bookingsData, isLoading: bookingsLoading } = useGetAllBookings();
  const { data: customersData, isLoading: customersLoading } = useGetAllCustomers();

  // Normalize data
  const workers = useMemo(() => {
    if (!workersData) return [];
    return Array.isArray(workersData) ? workersData : workersData?.data || [];
  }, [workersData]);

  const bookings = useMemo(() => {
    if (!bookingsData) return [];
    return Array.isArray(bookingsData) ? bookingsData : bookingsData?.data || [];
  }, [bookingsData]);

  const customers = useMemo(() => {
    if (!customersData) return [];
    return Array.isArray(customersData) ? customersData : customersData?.data || [];
  }, [customersData]);

  // Calculate stats
  const totalWorkers = workers.length;
  const totalCustomers = customers.length;
  const totalBookings = bookings.length;

  // Bookings Performance Calculations
  const bookingsStats = useMemo(() => {
    const total = bookings.length;
    const pending = bookings.filter((b) => b.status === 'pending').length;
    const confirmed = bookings.filter((b) => b.status === 'confirmed').length;
    const paid = bookings.filter((b) => b.status === 'paid').length;
    const cancelled = bookings.filter((b) => b.status === 'cancelled').length;

    // Completion rate (paid / total)
    const completionRate = total > 0 ? ((paid / total) * 100).toFixed(1) : 0;

    // Bookings by month (last 6 months)
    const monthlyBookings = {};
    bookings.forEach((booking) => {
      if (booking.created_at || booking.scheduled_at) {
        const date = new Date(booking.created_at || booking.scheduled_at);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        if (!monthlyBookings[monthKey]) {
          monthlyBookings[monthKey] = 0;
        }
        monthlyBookings[monthKey]++;
      }
    });

    // Average bookings per day (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentBookings = bookings.filter((b) => {
      const date = new Date(b.created_at || b.scheduled_at);
      return date >= thirtyDaysAgo;
    });
    const avgPerDay = (recentBookings.length / 30).toFixed(1);

    return {
      total,
      pending,
      confirmed,
      paid,
      cancelled,
      completionRate,
      monthlyBookings: Object.entries(monthlyBookings)
        .sort((a, b) => b[0].localeCompare(a[0]))
        .slice(0, 6),
      avgPerDay,
    };
  }, [bookings]);

  // Workers Performance Calculations
  const workersStats = useMemo(() => {
    const total = workers.length;
    const active = workers.filter((w) => w.is_active !== false).length;

    // Workers with bookings
    const workersWithBookings = new Set(
      bookings.filter((b) => b.worker_id).map((b) => b.worker_id)
    ).size;

    // Top performing workers (by number of bookings)
    const workerBookingCounts = {};
    bookings.forEach((booking) => {
      if (booking.worker_id) {
        workerBookingCounts[booking.worker_id] =
          (workerBookingCounts[booking.worker_id] || 0) + 1;
      }
    });

    const topWorkers = Object.entries(workerBookingCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([workerId, count]) => {
        const worker = workers.find((w) => w.id === parseInt(workerId));
        return {
          id: workerId,
          name: worker?.name || 'Unknown',
          bookings: count,
          earnings: bookings
            .filter((b) => b.worker_id === parseInt(workerId) && b.status === 'paid')
            .reduce((sum, b) => sum + parseFloat(b.total_amount || 0), 0),
        };
      });

    // Average bookings per worker
    const avgBookingsPerWorker =
      workersWithBookings > 0
        ? (bookings.filter((b) => b.worker_id).length / workersWithBookings).toFixed(1)
        : 0;

    // Workers by shift
    const shiftBreakdown = {};
    workers.forEach((worker) => {
      const shift = worker.shift || 'not_specified';
      shiftBreakdown[shift] = (shiftBreakdown[shift] || 0) + 1;
    });

    return {
      total,
      active,
      workersWithBookings,
      topWorkers,
      avgBookingsPerWorker,
      shiftBreakdown,
    };
  }, [workers, bookings]);

  // Financial Records Calculations
  const financialStats = useMemo(() => {
    // Total revenue (from paid bookings)
    const paidBookings = bookings.filter((b) => b.status === 'paid');
    const totalRevenue = paidBookings.reduce(
      (sum, b) => sum + parseFloat(b.total_amount || 0),
      0
    );

    // Pending revenue (from confirmed bookings)
    const confirmedBookings = bookings.filter((b) => b.status === 'confirmed');
    const pendingRevenue = confirmedBookings.reduce(
      (sum, b) => sum + parseFloat(b.total_amount || 0),
      0
    );

    // Revenue by status
    const revenueByStatus = {
      paid: totalRevenue,
      confirmed: pendingRevenue,
      pending: bookings
        .filter((b) => b.status === 'pending')
        .reduce((sum, b) => sum + parseFloat(b.total_amount || 0), 0),
      cancelled: bookings
        .filter((b) => b.status === 'cancelled')
        .reduce((sum, b) => sum + parseFloat(b.total_amount || 0), 0),
    };

    // Monthly revenue (last 6 months)
    const monthlyRevenue = {};
    paidBookings.forEach((booking) => {
      if (booking.scheduled_at || booking.created_at) {
        const date = new Date(booking.scheduled_at || booking.created_at);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        if (!monthlyRevenue[monthKey]) {
          monthlyRevenue[monthKey] = 0;
        }
        monthlyRevenue[monthKey] += parseFloat(booking.total_amount || 0);
      }
    });

    // Average booking value
    const avgBookingValue =
      bookings.length > 0
        ? bookings.reduce((sum, b) => sum + parseFloat(b.total_amount || 0), 0) /
          bookings.length
        : 0;

    // Average paid booking value
    const avgPaidBookingValue =
      paidBookings.length > 0 ? totalRevenue / paidBookings.length : 0;

    // Revenue growth (compare last month to previous month)
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const previousMonth = new Date(now.getFullYear(), now.getMonth() - 2, 1);

    const lastMonthRevenue = paidBookings
      .filter((b) => {
        const date = new Date(b.scheduled_at || b.created_at);
        return (
          date.getMonth() === lastMonth.getMonth() &&
          date.getFullYear() === lastMonth.getFullYear()
        );
      })
      .reduce((sum, b) => sum + parseFloat(b.total_amount || 0), 0);

    const previousMonthRevenue = paidBookings
      .filter((b) => {
        const date = new Date(b.scheduled_at || b.created_at);
        return (
          date.getMonth() === previousMonth.getMonth() &&
          date.getFullYear() === previousMonth.getFullYear()
        );
      })
      .reduce((sum, b) => sum + parseFloat(b.total_amount || 0), 0);

    const revenueGrowth =
      previousMonthRevenue > 0
        ? (((lastMonthRevenue - previousMonthRevenue) / previousMonthRevenue) * 100).toFixed(1)
        : 0;

    return {
      totalRevenue,
      pendingRevenue,
      revenueByStatus,
      monthlyRevenue: Object.entries(monthlyRevenue)
        .sort((a, b) => b[0].localeCompare(a[0]))
        .slice(0, 6),
      avgBookingValue,
      avgPaidBookingValue,
      revenueGrowth,
      totalBookings: bookings.length,
      paidBookings: paidBookings.length,
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
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  const isLoading = workersLoading || bookingsLoading || customersLoading;

  if (isLoading) {
    return (
      <div className='p-4 md:p-6 bg-neutral-50 min-h-screen flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto'></div>
          <p className='mt-4 text-gray-600'>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='p-4 md:p-6 bg-neutral-50 min-h-screen'>
      <div className='max-w-7xl mx-auto'>
        <div className='mb-6'>
          <h1 className='text-2xl md:text-3xl font-bold text-slate-900 mb-1'>
            Dashboard Overview
          </h1>
          <p className='text-neutral-600 text-sm'>
            Track your business metrics and performance
          </p>
        </div>

        {/* Main Stats Cards */}
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5 mb-6'>
          <Card
            title='Total Workers'
            value={totalWorkers}
            icon={Users}
            iconColor='text-blue-600'
            iconBgColor='bg-blue-50'
            bgColor='bg-gradient-to-br from-blue-25 to-white'
            borderColor='border-blue-100'
          />

          <Card
            title='Total Customers'
            value={totalCustomers}
            icon={UserCheck}
            iconColor='text-emerald-600'
            iconBgColor='bg-emerald-50'
            bgColor='bg-gradient-to-br from-emerald-25 to-white'
            borderColor='border-emerald-100'
          />

          <Card
            title='Total Bookings'
            value={totalBookings}
            icon={Package}
            iconColor='text-indigo-600'
            iconBgColor='bg-indigo-50'
            bgColor='bg-gradient-to-br from-indigo-25 to-white'
            borderColor='border-indigo-100'
          />

          <Card
            title='Total Revenue'
            value={formatCurrency(financialStats.totalRevenue)}
            icon={TakaSignIcon}
            iconColor='text-green-600'
            iconBgColor='bg-green-50'
            bgColor='bg-gradient-to-br from-green-25 to-white'
            borderColor='border-green-100'
          />
        </div>

        {/* Bookings Performance Section */}
        <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6'>
          <h2 className='text-xl font-semibold text-gray-900 mb-4'>Bookings Performance</h2>
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6'>
            <Card
              title='Completion Rate'
              value={`${bookingsStats.completionRate}%`}
              icon={CheckCircle}
              iconColor='text-green-600'
              iconBgColor='bg-green-100'
            />
            <Card
              title='Pending Bookings'
              value={bookingsStats.pending}
              icon={Clock}
              iconColor='text-yellow-600'
              iconBgColor='bg-yellow-100'
            />
            <Card
              title='Confirmed Bookings'
              value={bookingsStats.confirmed}
              icon={CheckCircle}
              iconColor='text-blue-600'
              iconBgColor='bg-blue-100'
            />
            <Card
              title='Avg per Day (30d)'
              value={bookingsStats.avgPerDay}
              icon={Activity}
              iconColor='text-purple-600'
              iconBgColor='bg-purple-100'
            />
          </div>

          {/* Status Breakdown */}
          <div className='mb-6'>
            <h3 className='text-lg font-medium text-gray-900 mb-3'>Status Breakdown</h3>
            <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
              <div className='text-center p-4 bg-blue-50 rounded-lg'>
                <p className='text-2xl font-bold text-blue-600'>{bookingsStats.pending}</p>
                <p className='text-sm text-gray-600 mt-1'>Pending</p>
              </div>
              <div className='text-center p-4 bg-indigo-50 rounded-lg'>
                <p className='text-2xl font-bold text-indigo-600'>{bookingsStats.confirmed}</p>
                <p className='text-sm text-gray-600 mt-1'>Confirmed</p>
              </div>
              <div className='text-center p-4 bg-green-50 rounded-lg'>
                <p className='text-2xl font-bold text-green-600'>{bookingsStats.paid}</p>
                <p className='text-sm text-gray-600 mt-1'>Paid</p>
              </div>
              <div className='text-center p-4 bg-red-50 rounded-lg'>
                <p className='text-2xl font-bold text-red-600'>{bookingsStats.cancelled}</p>
                <p className='text-sm text-gray-600 mt-1'>Cancelled</p>
              </div>
            </div>
          </div>

          {/* Monthly Booking Trend */}
          {bookingsStats.monthlyBookings.length > 0 && (
            <div>
              <h3 className='text-lg font-medium text-gray-900 mb-3'>Monthly Booking Trend</h3>
              <div className='space-y-3'>
                {bookingsStats.monthlyBookings.map(([month, count]) => {
                  const maxCount = Math.max(...bookingsStats.monthlyBookings.map(([, c]) => c));
                  const percentage = maxCount > 0 ? (count / maxCount) * 100 : 0;
                  return (
                    <div key={month}>
                      <div className='flex items-center justify-between mb-1'>
                        <span className='text-sm font-medium text-gray-700'>
                          {formatMonth(month)}
                        </span>
                        <span className='text-sm font-semibold text-gray-900'>{count}</span>
                      </div>
                      <div className='w-full bg-gray-200 rounded-full h-2'>
                        <div
                          className='bg-blue-600 h-2 rounded-full transition-all'
                          style={{ width: `${percentage}%` }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Workers Performance Section */}
        <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6'>
          <h2 className='text-xl font-semibold text-gray-900 mb-4'>Workers Performance</h2>
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6'>
            <Card
              title='Active Workers'
              value={workersStats.active}
              icon={CheckCircle}
              iconColor='text-green-600'
              iconBgColor='bg-green-100'
            />
            <Card
              title='Workers with Bookings'
              value={workersStats.workersWithBookings}
              icon={Activity}
              iconColor='text-purple-600'
              iconBgColor='bg-purple-100'
            />
            <Card
              title='Avg Bookings/Worker'
              value={workersStats.avgBookingsPerWorker}
              icon={TrendingUp}
              iconColor='text-orange-600'
              iconBgColor='bg-orange-100'
            />
          </div>

          {/* Top Performing Workers */}
          {workersStats.topWorkers.length > 0 && (
            <div className='mb-6'>
              <h3 className='text-lg font-medium text-gray-900 mb-3'>Top Performing Workers</h3>
              <div className='overflow-x-auto'>
                <table className='min-w-full divide-y divide-gray-200'>
                  <thead className='bg-gray-50'>
                    <tr>
                      <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        Worker Name
                      </th>
                      <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        Total Bookings
                      </th>
                      <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        Total Earnings
                      </th>
                    </tr>
                  </thead>
                  <tbody className='bg-white divide-y divide-gray-200'>
                    {workersStats.topWorkers.map((worker) => (
                      <tr key={worker.id}>
                        <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900'>
                          {worker.name}
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-600'>
                          {worker.bookings}
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-600'>
                          {formatCurrency(worker.earnings)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Shift Breakdown */}
          {Object.keys(workersStats.shiftBreakdown).length > 0 && (
            <div>
              <h3 className='text-lg font-medium text-gray-900 mb-3'>Workers by Shift</h3>
              <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
                {Object.entries(workersStats.shiftBreakdown).map(([shift, count]) => (
                  <div key={shift} className='text-center p-4 bg-gray-50 rounded-lg'>
                    <p className='text-2xl font-bold text-gray-900'>{count}</p>
                    <p className='text-sm text-gray-600 mt-1 capitalize'>
                      {shift.replace('_', ' ')}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Financial Records Section */}
        <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6'>
          <h2 className='text-xl font-semibold text-gray-900 mb-4'>Financial Records</h2>
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6'>
            <Card
              title='Pending Revenue'
              value={formatCurrency(financialStats.pendingRevenue)}
              icon={Clock}
              iconColor='text-yellow-600'
              iconBgColor='bg-yellow-100'
            />
            <Card
              title='Avg Booking Value'
              value={formatCurrency(financialStats.avgBookingValue)}
              icon={TrendingUp}
              iconColor='text-blue-600'
              iconBgColor='bg-blue-100'
            />
            <Card
              title='Revenue Growth'
              value={`${financialStats.revenueGrowth > 0 ? '+' : ''}${financialStats.revenueGrowth}%`}
              icon={BarChart3}
              iconColor={
                financialStats.revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'
              }
              iconBgColor={
                financialStats.revenueGrowth >= 0 ? 'bg-green-100' : 'bg-red-100'
              }
            />
          </div>

          {/* Revenue by Status */}
          <div className='mb-6'>
            <h3 className='text-lg font-medium text-gray-900 mb-3'>Revenue by Status</h3>
            <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
              <div className='text-center p-4 bg-green-50 rounded-lg'>
                <p className='text-2xl font-bold text-green-600'>
                  {formatCurrency(financialStats.revenueByStatus.paid)}
                </p>
                <p className='text-sm text-gray-600 mt-1'>Paid</p>
              </div>
              <div className='text-center p-4 bg-yellow-50 rounded-lg'>
                <p className='text-2xl font-bold text-yellow-600'>
                  {formatCurrency(financialStats.revenueByStatus.confirmed)}
                </p>
                <p className='text-sm text-gray-600 mt-1'>Confirmed</p>
              </div>
              <div className='text-center p-4 bg-blue-50 rounded-lg'>
                <p className='text-2xl font-bold text-blue-600'>
                  {formatCurrency(financialStats.revenueByStatus.pending)}
                </p>
                <p className='text-sm text-gray-600 mt-1'>Pending</p>
              </div>
              <div className='text-center p-4 bg-red-50 rounded-lg'>
                <p className='text-2xl font-bold text-red-600'>
                  {formatCurrency(financialStats.revenueByStatus.cancelled)}
                </p>
                <p className='text-sm text-gray-600 mt-1'>Cancelled</p>
              </div>
            </div>
          </div>

          {/* Monthly Revenue Trend */}
          {financialStats.monthlyRevenue.length > 0 && (
            <div className='mb-6'>
              <h3 className='text-lg font-medium text-gray-900 mb-3'>Monthly Revenue Trend</h3>
              <div className='space-y-3'>
                {financialStats.monthlyRevenue.map(([month, revenue]) => {
                  const maxRevenue = Math.max(
                    ...financialStats.monthlyRevenue.map(([, r]) => r)
                  );
                  const percentage = maxRevenue > 0 ? (revenue / maxRevenue) * 100 : 0;
                  return (
                    <div key={month}>
                      <div className='flex items-center justify-between mb-1'>
                        <span className='text-sm font-medium text-gray-700'>
                          {formatMonth(month)}
                        </span>
                        <span className='text-sm font-semibold text-gray-900'>
                          {formatCurrency(revenue)}
                        </span>
                      </div>
                      <div className='w-full bg-gray-200 rounded-full h-2'>
                        <div
                          className='bg-green-600 h-2 rounded-full transition-all'
                          style={{ width: `${percentage}%` }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Financial Summary */}
          <div>
            <h3 className='text-lg font-medium text-gray-900 mb-3'>Financial Summary</h3>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <div className='space-y-3'>
                <div className='flex justify-between items-center py-2 border-b border-gray-200'>
                  <span className='text-gray-600'>Paid Bookings</span>
                  <span className='font-semibold text-gray-900'>
                    {financialStats.paidBookings}
                  </span>
                </div>
                <div className='flex justify-between items-center py-2 border-b border-gray-200'>
                  <span className='text-gray-600'>Average Booking Value</span>
                  <span className='font-semibold text-gray-900'>
                    {formatCurrency(financialStats.avgBookingValue)}
                  </span>
                </div>
                <div className='flex justify-between items-center py-2'>
                  <span className='text-gray-600'>Average Paid Booking Value</span>
                  <span className='font-semibold text-gray-900'>
                    {formatCurrency(financialStats.avgPaidBookingValue)}
                  </span>
                </div>
              </div>
              <div className='space-y-3'>
                <div className='flex justify-between items-center py-2 border-b border-gray-200'>
                  <span className='text-gray-600'>Payment Rate</span>
                  <span className='font-semibold text-gray-900'>
                    {financialStats.totalBookings > 0
                      ? (
                          (financialStats.paidBookings / financialStats.totalBookings) *
                          100
                        ).toFixed(1)
                      : 0}
                    %
                  </span>
                </div>
                <div className='flex justify-between items-center py-2 border-b border-gray-200'>
                  <span className='text-gray-600'>Completion Rate</span>
                  <span className='font-semibold text-green-600'>
                    {bookingsStats.completionRate}%
                  </span>
                </div>
                <div className='flex justify-between items-center py-2'>
                  <span className='text-gray-600'>Cancelled Revenue</span>
                  <span className='font-semibold text-red-600'>
                    {formatCurrency(financialStats.revenueByStatus.cancelled)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
