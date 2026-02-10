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
import React, { useState } from 'react';
import { useGetPendingCommissionPayments, useProcessCommissionPayment } from '../../hooks/usePayment';
import { useGetPendingOnlinePayments, useSendOnlinePayment } from '../../hooks/usePayment';
import { useGetAllTransactions } from '../../hooks/usePayment';
import Card from '../ui/Card';

export default function PaymentManagement() {
  const [activeTab, setActiveTab] = useState('commission'); // 'commission', 'online', 'history'
  const [processingId, setProcessingId] = useState(null);
  const [notes, setNotes] = useState({});
  const [showModal, setShowModal] = useState({ type: null, id: null });

  const { data: commissionPayments, isLoading: commissionLoading } = useGetPendingCommissionPayments();
  const { data: onlinePayments, isLoading: onlineLoading } = useGetPendingOnlinePayments();
  const { data: allTransactions, isLoading: historyLoading } = useGetAllTransactions();
  const processCommissionMutation = useProcessCommissionPayment();
  const sendOnlineMutation = useSendOnlinePayment();

  const pendingCommission = Array.isArray(commissionPayments)
    ? commissionPayments
    : commissionPayments?.data || [];

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
      await sendOnlineMutation.mutateAsync({
        bookingId,
        notes: notes[bookingId] || null,
      });
      setShowModal({ type: null, id: null });
      setNotes({ ...notes, [bookingId]: '' });
    } catch (error) {
      // Error handled by mutation
    } finally {
      setProcessingId(null);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
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
            Manage worker commission payments and send online payments
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
            ) : pendingCommission.length === 0 ? (
              <Card bgColor='bg-white' borderColor='border-gray-200'>
                <div className='text-center py-12'>
                  <CreditCard className='w-12 h-12 text-gray-400 mx-auto mb-3' />
                  <p className='text-gray-600'>No pending commission payments</p>
                </div>
              </Card>
            ) : (
              <div className='space-y-4'>
                {pendingCommission.map((transaction) => (
                  <Card
                    key={transaction.id}
                    bgColor='bg-white'
                    borderColor='border-gray-200'>
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
                            (30% of ৳{parseFloat(transaction.booking?.total_amount || 0).toFixed(2)})
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
                          className='px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors'>
                          Process Payment
                        </button>
                      )}
                    </div>
                  </Card>
                ))}
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
                          <span className='px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200'>
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

                      {showModal.type === 'online' && showModal.id === booking.id ? (
                        <div className='mt-4 p-4 bg-gray-50 rounded-lg'>
                          <label className='block text-sm font-medium text-gray-700 mb-2'>
                            Notes (Optional)
                          </label>
                          <textarea
                            value={notes[booking.id] || ''}
                            onChange={(e) =>
                              setNotes({ ...notes, [booking.id]: e.target.value })
                            }
                            rows={2}
                            className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mb-3'
                            placeholder='Add notes...'
                          />
                          <div className='flex gap-2'>
                            <button
                              onClick={() => handleSendOnline(booking.id)}
                              disabled={processingId === booking.id}
                              className='flex-1 px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2'>
                              <Send className='w-4 h-4' />
                              Send Payment
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
                          <Send className='w-4 h-4' />
                          Send to Worker
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
