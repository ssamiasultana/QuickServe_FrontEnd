import { Clock, DollarSign, Package, TrendingUp, CheckCircle } from 'lucide-react';
import React, { useMemo } from 'react';
import { useGetWorkerPendingPayments } from '../../hooks/usePayment';
import Card from '../ui/Card';

export default function PendingPayments() {
  const {
    data: pendingPaymentsResponse,
    isLoading,
    isError,
    error,
  } = useGetWorkerPendingPayments();

  const pendingPayments = useMemo(() => {
    if (!pendingPaymentsResponse) return null;
    return pendingPaymentsResponse;
  }, [pendingPaymentsResponse]);

  const formatCurrency = (amount) => {
    return `৳${parseFloat(amount || 0).toFixed(2)}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className='flex justify-center items-center py-12'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto'></div>
          <p className='mt-4 text-gray-600'>Loading pending payments...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className='text-center py-12'>
        <div className='w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4'>
          <DollarSign className='w-8 h-8 text-red-600' />
        </div>
        <p className='text-red-600 font-semibold text-lg mb-2'>
          Failed to load pending payments
        </p>
        <p className='text-gray-600'>
          {error?.message || 'Unknown error occurred'}
        </p>
      </div>
    );
  }

  if (!pendingPayments || pendingPayments.count === 0) {
    return (
      <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center'>
        <div className='w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4'>
          <CheckCircle className='w-10 h-10 text-green-600' />
        </div>
        <h3 className='text-xl font-semibold text-gray-900 mb-2'>
          No pending payments
        </h3>
        <p className='text-gray-600'>
          All payments from admin have been processed
        </p>
      </div>
    );
  }

  return (
    <div className='p-4 md:p-6 bg-neutral-50 min-h-screen'>
      <div className='max-w-7xl mx-auto'>
        {/* Header */}
        <div className='mb-6'>
          <h1 className='text-2xl md:text-3xl font-bold text-slate-900 mb-1'>
            Pending Payments from Admin
          </h1>
          <p className='text-neutral-600 text-sm'>
            Payments waiting for admin to send via SSL Commerz
          </p>
        </div>

        {/* Summary Cards */}
        <div className='grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-5 mb-6'>
          <Card
            title='Total Pending'
            value={formatCurrency(pendingPayments.total_pending_amount)}
            icon={Clock}
            iconColor='text-yellow-600'
            iconBgColor='bg-yellow-50'
            bgColor='bg-gradient-to-br from-yellow-50/50 to-white'
            borderColor='border-yellow-100'
          />
          <Card
            title='Your Share (80%)'
            value={formatCurrency(pendingPayments.worker_pending_amount)}
            icon={DollarSign}
            iconColor='text-green-600'
            iconBgColor='bg-green-50'
            bgColor='bg-gradient-to-br from-green-50/50 to-white'
            borderColor='border-green-100'
          />
          <Card
            title='Pending Bookings'
            value={pendingPayments.count}
            icon={Package}
            iconColor='text-blue-600'
            iconBgColor='bg-blue-50'
            bgColor='bg-gradient-to-br from-blue-50/50 to-white'
            borderColor='border-blue-100'
          />
        </div>

        {/* Commission Info */}
        <div className='bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6'>
          <div className='flex items-start'>
            <TrendingUp className='w-5 h-5 text-blue-600 mt-0.5 mr-3' />
            <div>
              <p className='text-sm font-semibold text-blue-900 mb-1'>
                Commission Information
              </p>
              <p className='text-sm text-blue-700'>
                Platform commission is 20% ({formatCurrency(pendingPayments.commission_amount)}).
                Your payout is 80% ({formatCurrency(pendingPayments.worker_pending_amount)}) once the payment is processed.
              </p>
            </div>
          </div>
        </div>

        {/* Pending Bookings List */}
        <div className='space-y-4'>
          <h2 className='text-lg font-semibold text-gray-900'>
            Pending Payment Bookings ({pendingPayments.count})
          </h2>
          {pendingPayments.bookings.map((booking) => {
            const workerAmount = parseFloat(booking.total_amount) * 0.80;
            const commissionAmount = parseFloat(booking.total_amount) * 0.20;
            const customerPayment = booking.payment_transactions?.[0];

            return (
              <Card
                key={booking.id}
                bgColor='bg-white'
                borderColor='border-gray-200'>
                <div className='p-6'>
                  <div className='flex items-start justify-between mb-4'>
                    <div>
                      <h3 className='text-lg font-semibold text-gray-900 mb-2'>
                        {booking.service_subcategory?.name ||
                          booking.service?.name ||
                          'Service'}
                      </h3>
                      <div className='flex items-center gap-4 text-sm text-gray-600'>
                        <span>Booking ID: #{booking.id}</span>
                        <span>Customer: {booking.customer_name || 'N/A'}</span>
                        {customerPayment && (
                          <span>
                            Paid: {formatDate(customerPayment.created_at)}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className='text-right'>
                      <p className='text-2xl font-bold text-blue-600 mb-2'>
                        {formatCurrency(booking.total_amount)}
                      </p>
                      <div className='text-xs text-gray-600 space-y-1'>
                        <div className='text-green-600 font-semibold'>
                          Your Share: {formatCurrency(workerAmount)} (80%)
                        </div>
                        <div className='text-gray-500'>
                          Commission: {formatCurrency(commissionAmount)} (20%)
                        </div>
                      </div>
                      <span className='px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800 border border-yellow-200 mt-2 inline-block'>
                        Pending Payment
                      </span>
                    </div>
                  </div>

                  <div className='grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600'>
                    <div>
                      <span className='font-medium text-gray-700'>Service Date:</span>
                      <p>{formatDate(booking.scheduled_at)}</p>
                    </div>
                    <div>
                      <span className='font-medium text-gray-700'>Quantity:</span>
                      <p>{booking.quantity || 1}</p>
                    </div>
                    <div>
                      <span className='font-medium text-gray-700'>Unit Price:</span>
                      <p>{formatCurrency(booking.unit_price)}</p>
                    </div>
                    <div>
                      <span className='font-medium text-gray-700'>Status:</span>
                      <p className='capitalize'>{booking.status}</p>
                    </div>
                  </div>

                  {booking.service_address && (
                    <div className='mt-4 pt-4 border-t border-gray-200'>
                      <span className='text-sm font-medium text-gray-700'>
                        Service Address:
                      </span>
                      <p className='text-sm text-gray-600'>{booking.service_address}</p>
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
