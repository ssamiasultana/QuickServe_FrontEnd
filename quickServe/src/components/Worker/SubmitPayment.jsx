import { Calendar, Clock, CreditCard, Loader, MapPin, User } from 'lucide-react';
import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useLocation } from 'react-router';
import { useGetWorkerBookings } from '../../hooks/useBooking';
import { useGetWorkerTransactions, useInitiateSslCommerzPayment } from '../../hooks/usePayment';
import { useCheckWorkerProfile } from '../../hooks/useWorker';
import { AuthContext } from '../Context/AuthContext';
import Card from '../ui/Card';
import Modal from '../ui/Modal';

export default function SubmitPayment() {
  const { user } = useContext(AuthContext);
  const location = useLocation();
  const [selectedCommissionBooking, setSelectedCommissionBooking] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const initiatePaymentMutation = useInitiateSslCommerzPayment();
  const toastShownRef = useRef(false);

  const {
    data: profileData,
    isLoading: profileLoading,
    isError: profileError,
  } = useCheckWorkerProfile();

  const {
    data: bookingsResponse,
    isLoading: bookingsLoading,
    isError: bookingsError,
  } = useGetWorkerBookings(user?.id);

  const { data: transactionsResponse } = useGetWorkerTransactions();

  // Handle payment callback status
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const status = searchParams.get('status');
    const message = searchParams.get('message');
    const transactionId = searchParams.get('transaction_id');

    // Reset ref when search params are cleared
    if (!location.search) {
      toastShownRef.current = false;
      return;
    }

    // Only process if there's a status and we haven't shown toast for this status yet
    if (!status || toastShownRef.current === status) {
      return;
    }

    // Set ref immediately to prevent duplicate toasts
    toastShownRef.current = status;

    if (status === 'success') {
      toast.success('Payment completed successfully!');
      // Refresh transactions by removing query params
      window.history.replaceState({}, '', location.pathname);
    } else if (status === 'failed') {
      toast.error(message || 'Payment failed');
      window.history.replaceState({}, '', location.pathname);
    } else if (status === 'cancelled') {
      toast.error('Payment was cancelled');
      window.history.replaceState({}, '', location.pathname);
    } else if (status === 'error') {
      toast.error(message || 'An error occurred during payment');
      window.history.replaceState({}, '', location.pathname);
    }
  }, [location.search, location.pathname]);

  // Get all paid bookings
  const paidBookings = useMemo(() => {
    if (!bookingsResponse) return [];
    const bookings = Array.isArray(bookingsResponse)
      ? bookingsResponse
      : bookingsResponse?.data || [];

    return bookings.filter(
      (booking) => booking.status === 'paid' && booking.worker_id
    );
  }, [bookingsResponse]);

  // Get submitted transactions
  const submittedTransactions = useMemo(() => {
    if (!transactionsResponse) return [];
    return Array.isArray(transactionsResponse)
      ? transactionsResponse
      : transactionsResponse?.data || [];
  }, [transactionsResponse]);

  // Filter out bookings that already have commission payment transactions
  const availableCommissionBookings = useMemo(() => {
    const submittedBookingIds = new Set(
      submittedTransactions
        .filter((t) => t.transaction_type === 'commission_payment')
        .map((t) => t.booking_id)
    );

    return paidBookings.filter(
      (booking) => !submittedBookingIds.has(booking.id)
    );
  }, [paidBookings, submittedTransactions]);

  const handleCommissionBookingSelect = (booking) => {
    setSelectedCommissionBooking(booking);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCommissionBooking(null);
  };

  const handlePayWithSslCommerz = async () => {
    if (!selectedCommissionBooking) {
      toast.error('Please select a booking');
      return;
    }

    try {
      await initiatePaymentMutation.mutateAsync(selectedCommissionBooking.id);
      // The mutation will redirect to SSL Commerz payment page
    } catch (error) {
      // Error handled by mutation
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      approved: 'bg-blue-100 text-blue-800 border-blue-200',
      completed: 'bg-green-100 text-green-800 border-green-200',
      rejected: 'bg-red-100 text-red-800 border-red-200',
    };
    return styles[status] || styles.pending;
  };

  const calculateCommission = (totalAmount) => {
    return (parseFloat(totalAmount) * 0.30).toFixed(2);
  };

  if (profileLoading || bookingsLoading) {
    return (
      <div className='flex justify-center items-center py-12'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto'></div>
          <p className='mt-4 text-gray-600'>Loading...</p>
        </div>
      </div>
    );
  }

  if (profileError || !profileData?.isComplete) {
    return (
      <div className='text-center py-12'>
        <h1 className='text-2xl font-bold text-gray-900 mb-2'>
          Complete your profile
        </h1>
        <p className='text-gray-600'>
          Please complete your profile to submit payments
        </p>
      </div>
    );
  }

  return (
    <div className='p-4 md:p-6 bg-neutral-50 min-h-screen'>
      <div className='max-w-7xl mx-auto'>
        <div className='mb-6'>
          <h1 className='text-2xl md:text-3xl font-bold text-slate-900 mb-1'>
            Submit Commission Payment
          </h1>
          <p className='text-neutral-600 text-sm'>
            Submit your 30% commission payment to admin through online payment
          </p>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
          {/* Available Bookings */}
          <div className='lg:col-span-2'>
            <Card
              title='Available Bookings for Commission Payment'
              bgColor='bg-white'
              borderColor='border-gray-200'
              className='mb-6'>
              {availableCommissionBookings.length === 0 ? (
                <div className='text-center py-12'>
                  <CreditCard className='w-12 h-12 text-gray-400 mx-auto mb-3' />
                  <p className='text-gray-600'>
                    No bookings available for commission payment
                  </p>
                </div>
              ) : (
                <div className='space-y-4'>
                  {availableCommissionBookings.map((booking) => {
                    const commissionAmount = calculateCommission(booking.total_amount);
                    return (
                      <div
                        key={booking.id}
                        onClick={() => handleCommissionBookingSelect(booking)}
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${selectedCommissionBooking?.id === booking.id
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                          }`}>
                        <div className='flex items-start justify-between mb-2'>
                          <div>
                            <h3 className='font-semibold text-gray-900'>
                              {booking.service_subcategory?.name ||
                                booking.service?.name ||
                                'Service'}
                            </h3>
                            <p className='text-sm text-gray-600'>
                              Booking ID: #{booking.id}
                            </p>
                            <p className='text-xs text-gray-500 mt-1'>
                              Payment: {booking.payment_method === 'cash' ? 'Cash' : 'Online'}
                            </p>
                          </div>
                          <div className='text-right'>
                            <span className='text-lg font-bold text-green-600 block'>
                              ৳{parseFloat(booking.total_amount).toFixed(2)}
                            </span>
                            <span className='text-sm text-blue-600 font-medium'>
                              Commission: ৳{commissionAmount}
                            </span>
                          </div>
                        </div>
                        <div className='grid grid-cols-2 gap-2 text-sm text-gray-600'>
                          <div className='flex items-center gap-1'>
                            <User className='w-4 h-4' />
                            <span>{booking.customer_name || 'N/A'}</span>
                          </div>
                          <div className='flex items-center gap-1'>
                            <Calendar className='w-4 h-4' />
                            <span>{formatDate(booking.scheduled_at)}</span>
                          </div>
                          <div className='flex items-center gap-1'>
                            <Clock className='w-4 h-4' />
                            <span>{formatTime(booking.scheduled_at)}</span>
                          </div>
                          <div className='flex items-center gap-1'>
                            <MapPin className='w-4 h-4' />
                            <span className='truncate'>
                              {booking.service_address || 'N/A'}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>

          </div>

          {/* Transaction History */}
          <div className='lg:col-span-1'>
            <Card
              title='Payment History'
              bgColor='bg-white'
              borderColor='border-gray-200'>
              {submittedTransactions.length === 0 ? (
                <div className='text-center py-8'>
                  <p className='text-gray-600 text-sm'>No submissions yet</p>
                </div>
              ) : (
                <div className='space-y-3'>
                  {submittedTransactions
                    .slice(0, 10)
                    .map((transaction) => (
                      <div
                        key={transaction.id}
                        className='p-3 bg-gray-50 rounded-lg border border-gray-200'>
                        <div className='flex items-center justify-between mb-2'>
                          <div>
                            <span className='text-sm font-semibold text-gray-900 block'>
                              ৳{parseFloat(transaction.amount).toFixed(2)}
                            </span>
                            <span className='text-xs text-gray-500 capitalize'>
                              {transaction.transaction_type === 'cash_submission'
                                ? 'Cash Submission'
                                : transaction.transaction_type === 'commission_payment'
                                  ? 'Commission Payment'
                                  : 'Online Payment'}
                            </span>
                          </div>
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium border capitalize ${getStatusBadge(
                              transaction.status
                            )}`}>
                            {transaction.status}
                          </span>
                        </div>
                        <p className='text-xs text-gray-600'>
                          Booking #{transaction.booking_id}
                        </p>
                        <p className='text-xs text-gray-500 mt-1'>
                          {new Date(transaction.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>

      {/* Commission Payment Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title='Submit Commission Payment (30%)'
        icon={CreditCard}
        iconBgColor='bg-green-100'
        iconColor='text-green-600'
        size='lg'>
        {selectedCommissionBooking && (
          <div className='space-y-4'>
            <div className='bg-blue-50 border border-blue-200 rounded-lg p-4'>
              <div className='flex justify-between items-center mb-2'>
                <span className='text-sm font-medium text-gray-700'>
                  Booking Total:
                </span>
                <span className='text-lg font-bold text-gray-900'>
                  ৳{parseFloat(selectedCommissionBooking.total_amount).toFixed(2)}
                </span>
              </div>
              <div className='flex justify-between items-center'>
                <span className='text-sm font-medium text-gray-700'>
                  Commission (30%):
                </span>
                <span className='text-lg font-bold text-blue-600'>
                  ৳{calculateCommission(selectedCommissionBooking.total_amount)}
                </span>
              </div>
            </div>
            <div className='bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4'>
              <p className='text-sm text-yellow-800'>
                <strong>Note:</strong> You will be redirected to SSL Commerz secure payment page to complete the payment.
              </p>
            </div>
            <div className='flex gap-3'>
              <button
                onClick={handleCloseModal}
                disabled={initiatePaymentMutation.isPending}
                className='flex-1 px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'>
                Cancel
              </button>
              <button
                onClick={handlePayWithSslCommerz}
                disabled={initiatePaymentMutation.isPending}
                className='flex-1 px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2'>
                {initiatePaymentMutation.isPending ? (
                  <>
                    <Loader className='w-5 h-5 animate-spin' />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <CreditCard className='w-5 h-5' />
                    <span>Pay with SSL Commerz</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
