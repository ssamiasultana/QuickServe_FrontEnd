import {
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  User,
  MapPin,
  Package,
  Send,
  Filter,
  CreditCard,
} from 'lucide-react';
import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { toast } from 'react-hot-toast';
import { useGetPendingCommissionPayments, useProcessCommissionPayment } from '../../hooks/usePayment';
import { useGetPendingOnlinePayments, useSendOnlinePayment, useInitiateAdminToWorkerPayment } from '../../hooks/usePayment';
import { useGetAllTransactions } from '../../hooks/usePayment';
import Card from '../ui/Card';

export default function PaymentManagement() {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('commission'); // 'commission', 'online', 'history'
  const [processingId, setProcessingId] = useState(null);
  const [notes, setNotes] = useState({});
  const [showModal, setShowModal] = useState({ type: null, id: null });
  const toastShownRef = useRef(false);

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
    if (!status || toastShownRef.current === status + transactionId) {
      return;
    }

    // Set ref immediately to prevent duplicate toasts
    toastShownRef.current = status + transactionId;

    if (status === 'success') {
      toast.success('Payment sent to worker successfully!');
      // Switch to online payments tab to see updated list
      setActiveTab('online');
      // Clear URL parameters
      navigate(location.pathname, { replace: true });
    } else if (status === 'failed' || status === 'error') {
      toast.error(message || 'Payment failed. Please try again.');
      // Clear URL parameters
      navigate(location.pathname, { replace: true });
    } else if (status === 'cancelled') {
      toast.error('Payment was cancelled.');
      // Clear URL parameters
      navigate(location.pathname, { replace: true });
    }
  }, [location, navigate]);

  const { data: commissionPayments, isLoading: commissionLoading } = useGetPendingCommissionPayments();
  const { data: onlinePayments, isLoading: onlineLoading } = useGetPendingOnlinePayments();
  const { data: allTransactions, isLoading: historyLoading } = useGetAllTransactions();
  const processCommissionMutation = useProcessCommissionPayment();
  const sendOnlineMutation = useSendOnlinePayment(); // kept for backward compatibility (not used now)
  const initiateAdminToWorkerMutation = useInitiateAdminToWorkerPayment();

  // Get all commission payments and separate by status
  const allCommissionPayments = Array.isArray(commissionPayments)
    ? commissionPayments
    : commissionPayments?.data || [];
  
  // Separate pending and completed/approved/rejected
  const pendingCommission = allCommissionPayments.filter(t => t.status === 'pending');
  const completedCommission = allCommissionPayments.filter(t => 
    ['completed', 'approved'].includes(t.status)
  );
  const rejectedCommission = allCommissionPayments.filter(t => t.status === 'rejected');

  const pendingOnline = Array.isArray(onlinePayments)
    ? onlinePayments
    : onlinePayments?.data || [];

  const transactions = Array.isArray(allTransactions)
    ? allTransactions
    : allTransactions?.data || [];

  const handleProcessCommission = async (transactionId, action) => {
    setProcessingId(transactionId);
    try {
      await processCommissionMutation.mutateAsync({
        transactionId,
        action,
        notes: notes[transactionId] || null,
      });
      setShowModal({ type: null, id: null });
      setNotes({ ...notes, [transactionId]: '' });
    } catch (error) {
      // Error handled by mutation
    } finally {
      setProcessingId(null);
    }
  };

  const handleSendOnline = async (bookingId) => {
    setProcessingId(bookingId);
    try {
      // Use SSL Commerz to send payment to worker
      await initiateAdminToWorkerMutation.mutateAsync({
        bookingId,
        notes: notes[bookingId] || null,
      });
      // The mutation will redirect to SSL Commerz payment page
      // No need to close modal as we're redirecting
    } catch (error) {
      // Error handled by mutation
      setProcessingId(null);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      timeZone: 'Asia/Dhaka',
    });
  };

  const formatTime = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Dhaka',
    });
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      completed: 'bg-green-100 text-green-800 border-green-200',
      rejected: 'bg-red-100 text-red-800 border-red-200',
      approved: 'bg-blue-100 text-blue-800 border-blue-200',
    };
    return styles[status] || styles.pending;
  };

  return (
    <div className='p-4 md:p-6 bg-neutral-50 min-h-screen'>
      <div className='max-w-7xl mx-auto'>
        <div className='mb-6'>
          <h1 className='text-2xl md:text-3xl font-bold text-slate-900 mb-1'>
            Payment Management
          </h1>
          <p className='text-neutral-600 text-sm'>
            Manage worker commission payments and manually transfer online payments to workers
          </p>
        </div>

        {/* Tabs */}
        <div className='flex gap-2 mb-6 border-b border-gray-200'>
          <button
            onClick={() => setActiveTab('commission')}
            className={`px-4 py-2 font-medium transition-colors border-b-2 ${
              activeTab === 'commission'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}>
            Commission Payments ({pendingCommission.length})
          </button>
          <button
            onClick={() => setActiveTab('online')}
            className={`px-4 py-2 font-medium transition-colors border-b-2 ${
              activeTab === 'online'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}>
            Online Payments ({pendingOnline.length})
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 font-medium transition-colors border-b-2 ${
              activeTab === 'history'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}>
            Transaction History
          </button>
        </div>

        {/* Commission Payments Tab */}
        {activeTab === 'commission' && (
          <div>
            {commissionLoading ? (
              <div className='flex justify-center items-center py-12'>
                <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600'></div>
              </div>
            ) : allCommissionPayments.length === 0 ? (
              <Card bgColor='bg-white' borderColor='border-gray-200'>
                <div className='text-center py-12'>
                  <CreditCard className='w-12 h-12 text-gray-400 mx-auto mb-3' />
                  <p className='text-gray-600'>No commission payments</p>
                </div>
              </Card>
            ) : (
              <div className='space-y-6'>
                {/* Pending Commission Payments */}
                {pendingCommission.length > 0 && (
                  <div>
                    <h2 className='text-lg font-semibold text-gray-900 mb-4'>
                      Pending ({pendingCommission.length})
                    </h2>
                    <div className='space-y-4'>
                      {pendingCommission.map((transaction) => (
                        <Card
                          key={transaction.id}
                          bgColor='bg-white'
                          borderColor='border-yellow-200'>
                          <div className='p-6'>
                            <div className='flex items-start justify-between mb-4'>
                              <div>
                                <h3 className='text-lg font-semibold text-gray-900 mb-2'>
                                  {transaction.booking?.service_subcategory?.name ||
                                    transaction.booking?.service?.name ||
                                    'Service'}
                                </h3>
                                <div className='flex items-center gap-4 text-sm text-gray-600'>
                                  <span>Booking ID: #{transaction.booking_id}</span>
                                  <span>Worker: {transaction.worker?.name || 'N/A'}</span>
                                  <span>Customer: {transaction.booking?.customer_name || 'N/A'}</span>
                                </div>
                              </div>
                              <div className='text-right'>
                                <p className='text-2xl font-bold text-blue-600 mb-2'>
                                  ৳{parseFloat(transaction.amount).toFixed(2)}
                                </p>
                                <span className='text-sm text-gray-500'>
                                  (20% of ৳{parseFloat(transaction.booking?.total_amount || 0).toFixed(2)})
                                </span>
                                <span
                                  className={`px-3 py-1 rounded-full text-xs font-semibold border capitalize block mt-2 ${getStatusBadge(
                                    transaction.status
                                  )}`}>
                                  {transaction.status}
                                </span>
                              </div>
                            </div>

                            <div className='grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm text-gray-600'>
                              <div className='flex items-center gap-2'>
                                <Calendar className='w-4 h-4' />
                                <span>{formatDate(transaction.booking?.scheduled_at)}</span>
                              </div>
                              <div className='flex items-center gap-2'>
                                <Clock className='w-4 h-4' />
                                <span>{formatTime(transaction.booking?.scheduled_at)}</span>
                              </div>
                              <div className='flex items-center gap-2'>
                                <MapPin className='w-4 h-4' />
                                <span className='truncate'>
                                  {transaction.booking?.service_address || 'N/A'}
                                </span>
                              </div>
                              <div className='flex items-center gap-2'>
                                <Package className='w-4 h-4' />
                                <span>
                                  ৳{parseFloat(transaction.booking?.total_amount || 0).toFixed(2)}
                                </span>
                              </div>
                            </div>

                            {transaction.notes && (
                              <div className='mb-4 p-3 bg-gray-50 rounded-lg'>
                                <p className='text-sm text-gray-700 whitespace-pre-wrap'>{transaction.notes}</p>
                              </div>
                            )}

                            {showModal.type === 'commission' && showModal.id === transaction.id ? (
                              <div className='mt-4 p-4 bg-gray-50 rounded-lg'>
                                <label className='block text-sm font-medium text-gray-700 mb-2'>
                                  Notes (Optional)
                                </label>
                                <textarea
                                  value={notes[transaction.id] || ''}
                                  onChange={(e) =>
                                    setNotes({ ...notes, [transaction.id]: e.target.value })
                                  }
                                  rows={2}
                                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mb-3'
                                  placeholder='Add notes...'
                                />
                                <div className='flex gap-2'>
                                  <button
                                    onClick={() => handleProcessCommission(transaction.id, 'approve')}
                                    disabled={processingId === transaction.id}
                                    className='flex-1 px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2'>
                                    <CheckCircle className='w-4 h-4' />
                                    Approve
                                  </button>
                                  <button
                                    onClick={() => handleProcessCommission(transaction.id, 'reject')}
                                    disabled={processingId === transaction.id}
                                    className='flex-1 px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2'>
                                    <XCircle className='w-4 h-4' />
                                    Reject
                                  </button>
                                  <button
                                    onClick={() => setShowModal({ type: null, id: null })}
                                    className='px-4 py-2 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors'>
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <button
                                onClick={() => setShowModal({ type: 'commission', id: transaction.id })}
                                className='px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2'>
                                <CheckCircle className='w-4 h-4' />
                                Process Payment
                              </button>
                            )}
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {/* Completed/Approved Commission Payments */}
                {completedCommission.length > 0 && (
                  <div>
                    <h2 className='text-lg font-semibold text-gray-900 mb-4'>
                      Completed/Approved ({completedCommission.length})
                    </h2>
                    <div className='space-y-4'>
                      {completedCommission.map((transaction) => (
                        <Card
                          key={transaction.id}
                          bgColor='bg-white'
                          borderColor='border-green-200'>
                          <div className='p-6'>
                            <div className='flex items-start justify-between mb-4'>
                              <div>
                                <h3 className='text-lg font-semibold text-gray-900 mb-2'>
                                  {transaction.booking?.service_subcategory?.name ||
                                    transaction.booking?.service?.name ||
                                    'Service'}
                                </h3>
                                <div className='flex items-center gap-4 text-sm text-gray-600'>
                                  <span>Booking ID: #{transaction.booking_id}</span>
                                  <span>Worker: {transaction.worker?.name || 'N/A'}</span>
                                  <span>Customer: {transaction.booking?.customer_name || 'N/A'}</span>
                                </div>
                              </div>
                              <div className='text-right'>
                                <p className='text-2xl font-bold text-green-600 mb-2'>
                                  ৳{parseFloat(transaction.amount).toFixed(2)}
                                </p>
                                <span className='text-sm text-gray-500'>
                                  (20% of ৳{parseFloat(transaction.booking?.total_amount || 0).toFixed(2)})
                                </span>
                                <span
                                  className={`px-3 py-1 rounded-full text-xs font-semibold border capitalize block mt-2 ${getStatusBadge(
                                    transaction.status
                                  )}`}>
                                  {transaction.status}
                                </span>
                              </div>
                            </div>

                            <div className='grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm text-gray-600'>
                              <div className='flex items-center gap-2'>
                                <Calendar className='w-4 h-4' />
                                <span>{formatDate(transaction.booking?.scheduled_at)}</span>
                              </div>
                              <div className='flex items-center gap-2'>
                                <Clock className='w-4 h-4' />
                                <span>{formatTime(transaction.booking?.scheduled_at)}</span>
                              </div>
                              <div className='flex items-center gap-2'>
                                <MapPin className='w-4 h-4' />
                                <span className='truncate'>
                                  {transaction.booking?.service_address || 'N/A'}
                                </span>
                              </div>
                              <div className='flex items-center gap-2'>
                                <Package className='w-4 h-4' />
                                <span>
                                  ৳{parseFloat(transaction.booking?.total_amount || 0).toFixed(2)}
                                </span>
                              </div>
                            </div>

                            {transaction.notes && (
                              <div className='mb-4 p-3 bg-gray-50 rounded-lg'>
                                <p className='text-sm text-gray-700 whitespace-pre-wrap'>{transaction.notes}</p>
                              </div>
                            )}

                            {transaction.processed_by && transaction.processed_at && (
                              <div className='mb-4 p-3 bg-blue-50 rounded-lg'>
                                <p className='text-xs text-gray-600'>
                                  Processed by: {transaction.processed_by?.name || 'Admin'} on{' '}
                                  {formatDate(transaction.processed_at)}
                                </p>
                              </div>
                            )}
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {/* Rejected Commission Payments */}
                {rejectedCommission.length > 0 && (
                  <div>
                    <h2 className='text-lg font-semibold text-gray-900 mb-4'>
                      Rejected ({rejectedCommission.length})
                    </h2>
                    <div className='space-y-4'>
                      {rejectedCommission.map((transaction) => (
                        <Card
                          key={transaction.id}
                          bgColor='bg-white'
                          borderColor='border-red-200'>
                          <div className='p-6'>
                            <div className='flex items-start justify-between mb-4'>
                              <div>
                                <h3 className='text-lg font-semibold text-gray-900 mb-2'>
                                  {transaction.booking?.service_subcategory?.name ||
                                    transaction.booking?.service?.name ||
                                    'Service'}
                                </h3>
                                <div className='flex items-center gap-4 text-sm text-gray-600'>
                                  <span>Booking ID: #{transaction.booking_id}</span>
                                  <span>Worker: {transaction.worker?.name || 'N/A'}</span>
                                  <span>Customer: {transaction.booking?.customer_name || 'N/A'}</span>
                                </div>
                              </div>
                              <div className='text-right'>
                                <p className='text-2xl font-bold text-red-600 mb-2'>
                                  ৳{parseFloat(transaction.amount).toFixed(2)}
                                </p>
                                <span className='text-sm text-gray-500'>
                                  (20% of ৳{parseFloat(transaction.booking?.total_amount || 0).toFixed(2)})
                                </span>
                                <span
                                  className={`px-3 py-1 rounded-full text-xs font-semibold border capitalize block mt-2 ${getStatusBadge(
                                    transaction.status
                                  )}`}>
                                  {transaction.status}
                                </span>
                              </div>
                            </div>

                            <div className='grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm text-gray-600'>
                              <div className='flex items-center gap-2'>
                                <Calendar className='w-4 h-4' />
                                <span>{formatDate(transaction.booking?.scheduled_at)}</span>
                              </div>
                              <div className='flex items-center gap-2'>
                                <Clock className='w-4 h-4' />
                                <span>{formatTime(transaction.booking?.scheduled_at)}</span>
                              </div>
                              <div className='flex items-center gap-2'>
                                <MapPin className='w-4 h-4' />
                                <span className='truncate'>
                                  {transaction.booking?.service_address || 'N/A'}
                                </span>
                              </div>
                              <div className='flex items-center gap-2'>
                                <Package className='w-4 h-4' />
                                <span>
                                  ৳{parseFloat(transaction.booking?.total_amount || 0).toFixed(2)}
                                </span>
                              </div>
                            </div>

                            {transaction.notes && (
                              <div className='mb-4 p-3 bg-gray-50 rounded-lg'>
                                <p className='text-sm text-gray-700 whitespace-pre-wrap'>{transaction.notes}</p>
                              </div>
                            )}

                            {transaction.processed_by && transaction.processed_at && (
                              <div className='mb-4 p-3 bg-blue-50 rounded-lg'>
                                <p className='text-xs text-gray-600'>
                                  Processed by: {transaction.processed_by?.name || 'Admin'} on{' '}
                                  {formatDate(transaction.processed_at)}
                                </p>
                              </div>
                            )}
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Online Payments Tab */}
        {activeTab === 'online' && (
          <div>
            {onlineLoading ? (
              <div className='flex justify-center items-center py-12'>
                <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600'></div>
              </div>
            ) : pendingOnline.length === 0 ? (
              <Card bgColor='bg-white' borderColor='border-gray-200'>
                <div className='text-center py-12'>
                  <Send className='w-12 h-12 text-gray-400 mx-auto mb-3' />
                  <p className='text-gray-600'>No pending online payments</p>
                </div>
              </Card>
            ) : (
              <div className='space-y-4'>
                {pendingOnline.map((booking) => (
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
                            <span>Worker: {booking.worker?.name || 'N/A'}</span>
                            <span>Customer: {booking.customer_name || 'N/A'}</span>
                          </div>
                        </div>
                        <div className='text-right'>
                          <p className='text-2xl font-bold text-blue-600 mb-2'>
                            ৳{parseFloat(booking.total_amount).toFixed(2)}
                          </p>
                          <div className='text-xs text-gray-600 space-y-1'>
                            <div>Worker: ৳{(parseFloat(booking.total_amount) * 0.80).toFixed(2)} (80%)</div>
                            <div>Commission: ৳{(parseFloat(booking.total_amount) * 0.20).toFixed(2)} (20%)</div>
                          </div>
                          <span className='px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200 mt-2 inline-block'>
                            Online Payment
                          </span>
                        </div>
                      </div>

                      <div className='grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm text-gray-600'>
                        <div className='flex items-center gap-2'>
                          <Calendar className='w-4 h-4' />
                          <span>{formatDate(booking.scheduled_at)}</span>
                        </div>
                        <div className='flex items-center gap-2'>
                          <Clock className='w-4 h-4' />
                          <span>{formatTime(booking.scheduled_at)}</span>
                        </div>
                        <div className='flex items-center gap-2'>
                          <MapPin className='w-4 h-4' />
                          <span className='truncate'>{booking.service_address || 'N/A'}</span>
                        </div>
                        <div className='flex items-center gap-2'>
                          <User className='w-4 h-4' />
                          <span>{booking.customer_email || 'N/A'}</span>
                        </div>
                      </div>

                      {!booking.worker_id || !booking.worker ? (
                        <div className='mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg'>
                          <div className='flex items-center gap-2 text-yellow-800 mb-2'>
                            <XCircle className='w-5 h-5' />
                            <span className='font-semibold'>Worker Not Assigned</span>
                          </div>
                          <p className='text-sm text-yellow-700'>
                            This booking does not have a worker assigned. Please assign a worker before sending payment.
                          </p>
                        </div>
                      ) : showModal.type === 'online' && showModal.id === booking.id ? (
                        <div className='mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200'>
                          <div className='mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg'>
                            <p className='text-sm font-semibold text-blue-900 mb-1'>
                              SSL Commerz Payment to Worker
                            </p>
                            <p className='text-xs text-blue-700'>
                              You will be redirected to SSL Commerz to send <strong>৳{(parseFloat(booking.total_amount) * 0.80).toFixed(2)}</strong> (80%) to the worker. 
                              Commission of <strong>৳{(parseFloat(booking.total_amount) * 0.20).toFixed(2)}</strong> (20%) will be automatically deducted.
                            </p>
                          </div>
                          <label className='block text-sm font-medium text-gray-700 mb-2'>
                            Transfer Notes (Optional)
                          </label>
                          <textarea
                            value={notes[booking.id] || ''}
                            onChange={(e) =>
                              setNotes({ ...notes, [booking.id]: e.target.value })
                            }
                            rows={2}
                            className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mb-3'
                            placeholder='Add transfer notes (e.g., bank transfer reference, transaction ID)...'
                          />
                          <div className='flex gap-2'>
                            <button
                              onClick={() => handleSendOnline(booking.id)}
                              disabled={processingId === booking.id}
                              className='flex-1 px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2'>
                              {processingId === booking.id ? (
                                <>
                                  <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white'></div>
                                  Processing...
                                </>
                              ) : (
                                <>
                                  <CreditCard className='w-4 h-4' />
                                  Pay via SSL Commerz
                                </>
                              )}
                            </button>
                            <button
                              onClick={() => setShowModal({ type: null, id: null })}
                              className='px-4 py-2 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors'>
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => setShowModal({ type: 'online', id: booking.id })}
                          className='px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2'>
                          <CreditCard className='w-4 h-4' />
                          Pay via SSL Commerz
                        </button>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Transaction History Tab */}
        {activeTab === 'history' && (
          <div>
            {historyLoading ? (
              <div className='flex justify-center items-center py-12'>
                <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600'></div>
              </div>
            ) : transactions.length === 0 ? (
              <Card bgColor='bg-white' borderColor='border-gray-200'>
                <div className='text-center py-12'>
                  <Filter className='w-12 h-12 text-gray-400 mx-auto mb-3' />
                  <p className='text-gray-600'>No transactions found</p>
                </div>
              </Card>
            ) : (
              <div className='bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden'>
                <div className='overflow-x-auto'>
                  <table className='min-w-full divide-y divide-gray-200'>
                    <thead className='bg-gray-50'>
                      <tr>
                        <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                          Date
                        </th>
                        <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                          Type
                        </th>
                        <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                          Worker
                        </th>
                        <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                          Booking ID
                        </th>
                        <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                          Amount
                        </th>
                        <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                          Status
                        </th>
                        <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                          Processed By
                        </th>
                      </tr>
                    </thead>
                    <tbody className='bg-white divide-y divide-gray-200'>
                      {transactions.map((transaction) => (
                        <tr key={transaction.id}>
                          <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                            {formatDate(transaction.created_at)}
                          </td>
                          <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-600'>
                            <span
                              className={`px-2 py-1 rounded text-xs font-medium ${
                                transaction.transaction_type === 'cash_submission'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : transaction.transaction_type === 'commission_payment'
                                  ? 'bg-purple-100 text-purple-800'
                                  : 'bg-blue-100 text-blue-800'
                              }`}>
                              {transaction.transaction_type === 'cash_submission'
                                ? 'Cash Submission'
                                : transaction.transaction_type === 'commission_payment'
                                ? 'Commission Payment'
                                : 'Online Payment'}
                            </span>
                          </td>
                          <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-600'>
                            {transaction.worker?.name || 'N/A'}
                          </td>
                          <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-600'>
                            #{transaction.booking_id}
                          </td>
                          <td className='px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900'>
                            ৳{parseFloat(transaction.amount).toFixed(2)}
                          </td>
                          <td className='px-6 py-4 whitespace-nowrap'>
                            <span
                              className={`px-2 py-1 rounded text-xs font-semibold border capitalize ${getStatusBadge(
                                transaction.status
                              )}`}>
                              {transaction.status}
                            </span>
                          </td>
                          <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-600'>
                            {transaction.processed_by
                              ? transaction.processedBy?.name || 'Admin'
                              : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
