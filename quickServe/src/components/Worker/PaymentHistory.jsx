import { ArrowDown, ArrowUp, RefreshCw } from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { useGetWorkerTransactions } from '../../hooks/usePayment';

const COMMISSION_RATE = 0.2;

const formatCurrency = (amount) => {
  const n = Number(amount);
  if (!Number.isFinite(n)) return '৳0.00';
  return `৳${n.toFixed(2)}`;
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

const getBookingMoneyBreakdown = (transaction) => {
  const amount = Number(transaction?.amount);
  if (!Number.isFinite(amount) || amount <= 0) return null;

  if (transaction?.transaction_type === 'online_payment') {
    const payout = amount;
    const gross = payout / (1 - COMMISSION_RATE);
    const commission = gross * COMMISSION_RATE;
    return { gross, commission, payout };
  }

  if (transaction?.transaction_type === 'commission_payment') {
    const commission = amount;
    const gross = commission / COMMISSION_RATE;
    const payout = gross - commission;
    return { gross, commission, payout };
  }

  return null;
};

export default function PaymentHistory() {
  const {
    data: transactionsResponse,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetWorkerTransactions();

  const [filter, setFilter] = useState('all'); // all | payouts | commissions
  const [bookingIdQuery, setBookingIdQuery] = useState('');

  // Group transactions: merge online_payment + commission_payment for same booking into one entry
  const groupedTransactions = useMemo(() => {
    if (!transactionsResponse) return [];
    const list = Array.isArray(transactionsResponse)
      ? transactionsResponse
      : transactionsResponse?.data || [];

    const relevant = list.filter(
      (t) => t.transaction_type === 'online_payment' || t.transaction_type === 'commission_payment'
    );

    // Group by booking_id
    const byBooking = {};
    for (const t of relevant) {
      const key = t.booking_id;
      if (!byBooking[key]) byBooking[key] = {};
      if (t.transaction_type === 'online_payment') byBooking[key].payout = t;
      if (t.transaction_type === 'commission_payment') byBooking[key].commission = t;
    }

    const entries = [];
    for (const bookingId of Object.keys(byBooking)) {
      const { payout, commission } = byBooking[bookingId];
      if (payout && commission) {
        // Online payment: both exist → combined card
        entries.push({
          type: 'online_combined',
          bookingId: Number(bookingId),
          payout,
          commission,
          timestamp: new Date(payout.created_at || 0).getTime(),
        });
      } else if (commission) {
        // Cash commission only
        entries.push({
          type: 'commission_only',
          bookingId: Number(bookingId),
          commission,
          timestamp: new Date(commission.created_at || 0).getTime(),
        });
      } else if (payout) {
        // Payout only (edge case)
        entries.push({
          type: 'payout_only',
          bookingId: Number(bookingId),
          payout,
          timestamp: new Date(payout.created_at || 0).getTime(),
        });
      }
    }

    return entries.sort((a, b) => b.timestamp - a.timestamp);
  }, [transactionsResponse]);

  const filteredTransactions = useMemo(() => {
    const q = bookingIdQuery.trim();
    return groupedTransactions.filter((entry) => {
      if (filter === 'payouts' && !entry.payout) return false;
      if (filter === 'commissions' && !entry.commission) return false;

      if (q) {
        return String(entry.bookingId || '').includes(q);
      }

      return true;
    });
  }, [groupedTransactions, filter, bookingIdQuery]);

  return (
    <div className='p-4 md:p-6 bg-neutral-50 min-h-screen'>
      <div className='max-w-7xl mx-auto'>
        <div className='mb-6 flex items-center justify-between gap-4'>
          <div>
            <h1 className='text-2xl md:text-3xl font-bold text-slate-900 mb-1'>
              Payment History
            </h1>
            <p className='text-neutral-600 text-sm'>
              Track payouts received and commissions paid per booking
            </p>
          </div>
          <button
            onClick={() => refetch()}
            disabled={isLoading}
            className='px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2'>
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        <div className='bg-white border border-gray-200 rounded-xl p-4 md:p-5 mb-4'>
          <div className='flex flex-col md:flex-row md:items-center gap-3 md:gap-4'>
            <div className='flex items-center gap-2'>
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-sm font-semibold border transition-colors ${
                  filter === 'all'
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-white text-slate-700 border-gray-200 hover:bg-gray-50'
                }`}>
                All
              </button>
              <button
                onClick={() => setFilter('payouts')}
                className={`px-3 py-1.5 rounded-lg text-sm font-semibold border transition-colors ${
                  filter === 'payouts'
                    ? 'bg-green-600 text-white border-green-600'
                    : 'bg-white text-slate-700 border-gray-200 hover:bg-gray-50'
                }`}>
                Payouts
              </button>
              <button
                onClick={() => setFilter('commissions')}
                className={`px-3 py-1.5 rounded-lg text-sm font-semibold border transition-colors ${
                  filter === 'commissions'
                    ? 'bg-red-600 text-white border-red-600'
                    : 'bg-white text-slate-700 border-gray-200 hover:bg-gray-50'
                }`}>
                Commissions
              </button>
            </div>

            <div className='flex-1'>
              <label className='text-xs font-semibold text-gray-600 block mb-1'>
                Search by Booking ID
              </label>
              <input
                value={bookingIdQuery}
                onChange={(e) => setBookingIdQuery(e.target.value)}
                placeholder='e.g. 107'
                className='w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300'
              />
            </div>
          </div>
        </div>

        <div className='bg-white border border-gray-200 rounded-xl p-4 md:p-5'>
          {isLoading ? (
            <div className='text-center py-10'>
              <div className='animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto'></div>
              <p className='mt-3 text-gray-600 text-sm'>Loading payment history...</p>
            </div>
          ) : isError ? (
            <div className='text-center py-10'>
              <p className='text-red-600 font-semibold'>Failed to load payment history</p>
              <p className='text-gray-600 text-sm mt-1'>
                {error?.message || 'Unknown error occurred'}
              </p>
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className='text-center py-10'>
              <p className='text-gray-700 font-semibold'>No transactions found</p>
              <p className='text-gray-600 text-sm mt-1'>
                Try changing the filter or search by another booking ID.
              </p>
            </div>
          ) : (
            <div className='space-y-3'>
              {filteredTransactions.map((entry) => {
                if (entry.type === 'online_combined') {
                  // Combined card for online payments (commission + payout in one card)
                  const breakdown = getBookingMoneyBreakdown(entry.payout);
                  return (
                    <div
                      key={`combined-${entry.bookingId}`}
                      className='p-4 rounded-lg border bg-blue-50 border-blue-200'>
                      <div className='flex items-start justify-between gap-3'>
                        <div className='flex-1'>
                          <p className='text-xs font-semibold text-blue-700 mb-3'>
                            Online Payment
                          </p>

                          {/* Commission sent */}
                          <div className='flex items-center gap-2 mb-1'>
                            <ArrowUp className='w-4 h-4 text-red-500' />
                            <span className='text-sm font-semibold text-red-700'>
                              {formatCurrency(entry.commission.amount)}
                            </span>
                            <span className='text-xs text-red-600'>
                              Commission paid (to Admin)
                            </span>
                          </div>

                          {/* Payout received */}
                          <div className='flex items-center gap-2 mb-2'>
                            <ArrowDown className='w-4 h-4 text-green-500' />
                            <span className='text-sm font-semibold text-green-700'>
                              {formatCurrency(entry.payout.amount)}
                            </span>
                            <span className='text-xs text-green-600'>
                              Payout received (from Admin)
                            </span>
                          </div>

                          {breakdown && (
                            <div className='mt-2 text-[12px] leading-5 text-gray-700'>
                              <div>
                                <span className='font-semibold'>Booking total:</span>{' '}
                                {formatCurrency(breakdown.gross)}
                              </div>
                              <div>
                                <span className='font-semibold'>Platform commission (20%):</span>{' '}
                                {formatCurrency(breakdown.commission)}
                              </div>
                              <div>
                                <span className='font-semibold'>Your payout (80%):</span>{' '}
                                {formatCurrency(breakdown.payout)}
                              </div>
                            </div>
                          )}

                          <div className='mt-3 text-xs text-gray-700 font-medium'>
                            Booking #{entry.bookingId}
                          </div>
                          <div className='text-xs text-gray-500 mt-1'>
                            {new Date(entry.payout.created_at).toLocaleString('en-US', { timeZone: 'Asia/Dhaka' })}
                          </div>
                        </div>

                        <span
                          className={`px-2 py-1 rounded text-xs font-semibold border capitalize ${getStatusBadge(
                            entry.payout.status
                          )}`}>
                          {entry.payout.status}
                        </span>
                      </div>
                    </div>
                  );
                }

                // Standalone commission card (cash payment)
                const transaction = entry.commission || entry.payout;
                const isSent = !!entry.commission;
                const breakdown = getBookingMoneyBreakdown(transaction);

                return (
                  <div
                    key={transaction.id}
                    className={`p-4 rounded-lg border ${
                      isSent
                        ? 'bg-red-50 border-red-200'
                        : 'bg-green-50 border-green-200'
                    }`}>
                    <div className='flex items-start justify-between gap-3'>
                      <div className='flex-1'>
                        <div className='flex items-center gap-2'>
                          {isSent ? (
                            <ArrowUp className='w-4 h-4 text-red-600' />
                          ) : (
                            <ArrowDown className='w-4 h-4 text-green-600' />
                          )}
                          <span
                            className={`text-sm font-semibold ${
                              isSent ? 'text-red-700' : 'text-green-700'
                            }`}>
                            {formatCurrency(transaction.amount)}
                          </span>
                        </div>

                        <p
                          className={`text-xs font-medium mt-1 ${
                            isSent ? 'text-red-700' : 'text-green-700'
                          }`}>
                          {isSent
                            ? 'Commission paid (to Admin)'
                            : 'Payout received (from Admin)'}
                        </p>

                        {breakdown && (
                          <div className='mt-2 text-[12px] leading-5 text-gray-700'>
                            <div>
                              <span className='font-semibold'>Booking total:</span>{' '}
                              {formatCurrency(breakdown.gross)}
                            </div>
                            <div>
                              <span className='font-semibold'>Platform commission (20%):</span>{' '}
                              {formatCurrency(breakdown.commission)}
                            </div>
                            <div>
                              <span className='font-semibold'>Your payout (80%):</span>{' '}
                              {formatCurrency(breakdown.payout)}
                            </div>
                          </div>
                        )}

                        <div className='mt-3 text-xs text-gray-700 font-medium'>
                          Booking #{entry.bookingId}
                        </div>
                        <div className='text-xs text-gray-500 mt-1'>
                          {new Date(transaction.created_at).toLocaleString('en-US', { timeZone: 'Asia/Dhaka' })}
                        </div>
                      </div>

                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold border capitalize ${getStatusBadge(
                          transaction.status
                        )}`}>
                        {transaction.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

