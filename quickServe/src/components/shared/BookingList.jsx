import {
  AlertTriangle,
  Calendar,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Clock,
  Filter,
  MapPin,
  Package,
  X
} from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { useUpdateBookingStatus } from '../../hooks/useBooking';
import Card from '../ui/Card';
import Modal from '../ui/Modal';

/**
 * Reusable BookingList Component
 *
 * @param {Object} props
 * @param {Array} props.bookings - Array of booking objects
 * @param {boolean} props.isLoading - Loading state
 * @param {boolean} props.isError - Error state
 * @param {Object} props.error - Error object
 * @param {string} props.title - Page title (e.g., "My Bookings" or "Job Requests")
 * @param {string} props.description - Page description
 * @param {string} props.emptyTitle - Title for empty state
 * @param {string} props.emptyMessage - Message for empty state
 * @param {string} props.emptyActionText - Text for empty state action button
 * @param {string} props.totalLabel - Label for total bookings (e.g., "Total Bookings" or "Total Jobs")
 * @param {string} props.viewType - 'customer' or 'worker' - determines which fields to show
 * @param {number|null} props.workerId - Worker ID to filter bookings (only show bookings assigned to this worker)
 */
export default function BookingList({
  bookings = [],
  isLoading = false,
  isError = false,
  error = null,
  title = 'Bookings',
  description = 'View and manage your bookings',
  emptyTitle = 'No bookings yet',
  emptyMessage = 'Start booking services to see them here',
  emptyActionText = 'Show All Bookings',
  totalLabel = 'Total Bookings',
  viewType = 'customer', // 'customer' or 'worker'
  workerId = null, // Worker ID to filter bookings
}) {
  const [statusFilter, setStatusFilter] = useState('all');
  const [expandedBooking, setExpandedBooking] = useState(null);
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    bookingId: null,
    status: null,
    bookingDetails: null,
  });
  const updateStatusMutation = useUpdateBookingStatus();

  // Normalize bookings data
  const normalizedBookings = Array.isArray(bookings)
    ? bookings
    : bookings?.data || [];

  // Filter bookings by status (backend already filters by worker_id)
  const filteredBookings = useMemo(() => {
    // Backend already filters bookings by worker_id, so we just filter by status here
    if (statusFilter === 'all') return normalizedBookings;
    return normalizedBookings.filter(
      (booking) => booking.status === statusFilter
    );
  }, [normalizedBookings, statusFilter]);

  // Group bookings by status for summary
  const bookingStats = useMemo(() => {
    return {
      total: normalizedBookings.length,
      pending: normalizedBookings.filter((b) => b.status === 'pending').length,
      confirmed: normalizedBookings.filter((b) => b.status === 'confirmed')
        .length,
      paid: normalizedBookings.filter((b) => b.status === 'paid').length,
      cancelled: normalizedBookings.filter((b) => b.status === 'cancelled')
        .length,
    };
  }, [normalizedBookings]);

  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'N/A';
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        timeZone: 'Asia/Dhaka', // Adjust to your timezone
      });
    } catch (error) {
      return 'N/A';
    }
  };

  // Format time helper
  const formatTime = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'N/A';
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Asia/Dhaka', // Adjust to your timezone
      });
    } catch (error) {
      return 'N/A';
    }
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

  // Open confirmation modal
  const handleStatusUpdateClick = (bookingId, status, bookingDetails) => {
    setConfirmModal({
      isOpen: true,
      bookingId,
      status,
      bookingDetails,
    });
  };

  // Handle confirmed status update
  const handleConfirmStatusUpdate = () => {
    if (confirmModal.bookingId && confirmModal.status) {
      updateStatusMutation.mutate({
        bookingId: confirmModal.bookingId,
        status: confirmModal.status,
      });
      setConfirmModal({
        isOpen: false,
        bookingId: null,
        status: null,
        bookingDetails: null,
      });
    }
  };

  // Close confirmation modal
  const handleCloseModal = () => {
    setConfirmModal({
      isOpen: false,
      bookingId: null,
      status: null,
      bookingDetails: null,
    });
  };

  // Check if booking can be confirmed (only pending bookings)
  const canConfirm = (booking) => {
    return booking.status === 'pending';
  };

  // Check if booking can be cancelled (only pending bookings)
  const canCancel = (booking) => {
    return booking.status === 'pending';
  };

  if (isLoading) {
    return (
      <div className='min-h-screen bg-gray-50 p-6 flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto'></div>
          <p className='mt-4 text-gray-600'>Loading...</p>
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
          <h1 className='text-3xl font-bold text-gray-900 mb-2'>{title}</h1>
          <p className='text-gray-600'>{description}</p>
        </div>

        {/* Statistics Cards */}
        {normalizedBookings.length > 0 && (
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6'>
            <Card
              title={totalLabel}
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
        {normalizedBookings.length > 0 && (
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
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${statusFilter === status
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}>
                      {status === 'all' ? 'All' : status}
                      {status !== 'all' && (
                        <span className='ml-2 text-xs opacity-75'>
                          (
                          {
                            normalizedBookings.filter(
                              (b) => b.status === status
                            ).length
                          }
                          )
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
            {normalizedBookings.length === 0 ? (
              <>
                <div className='w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                  <Calendar className='w-10 h-10 text-gray-400' />
                </div>
                <h3 className='text-xl font-semibold text-gray-900 mb-2'>
                  {emptyTitle}
                </h3>
                <p className='text-gray-600'>{emptyMessage}</p>
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
                  {emptyActionText}
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
                  <div className='p-6'>
                    <div className='flex items-start justify-between'>
                      <div className='flex-1'>
                        <div className='flex items-center gap-3 mb-3'>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold border capitalize ${getStatusBadge(
                              booking.status
                            )}`}>
                            {booking.status?.toUpperCase() || 'PENDING'}
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

                        {booking.service?.name &&
                          booking.service_subcategory?.name && (
                            <p className='text-sm text-gray-600 mb-3'>
                              {booking.service.name}
                            </p>
                          )}

                        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4'>

                          <div className='flex items-center gap-2 text-sm text-gray-600'>
                            <MapPin className='w-4 h-4 text-gray-400' />
                            <span>
                              <span className='font-medium'>Service Address:</span>{' '}
                              {booking.service_address || 'N/A'}
                            </span>
                          </div>

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
                              <span className='font-medium'>Amount:</span> ৳
                              {typeof booking.total_amount === 'string'
                                ? parseFloat(booking.total_amount || 0).toFixed(
                                  2
                                )
                                : (Number(booking.total_amount) || 0).toFixed(
                                  2
                                )}
                            </span>
                          </div>
                        </div>

                        {/* Expanded Details */}
                        {isExpanded && (
                          <div className='mt-4 pt-4 border-t border-gray-200 space-y-3'>
                            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                              {/* Customer details for workers */}
                              {viewType === 'worker' && (
                                <>
                                  <div>
                                    <p className='text-sm font-medium text-gray-700 mb-1'>
                                      Customer Email:
                                    </p>
                                    <p className='text-sm text-gray-600'>
                                      {booking.customer_email ||
                                        booking.customer?.email ||
                                        'N/A'}
                                    </p>
                                  </div>
                                  <div>
                                    <p className='text-sm font-medium text-gray-700 mb-1'>
                                      Customer Phone:
                                    </p>
                                    <p className='text-sm text-gray-600'>
                                      {booking.customer_phone ||
                                        booking.customer?.phone ||
                                        'N/A'}
                                    </p>
                                  </div>
                                </>
                              )}

                              {/* Worker details for customers */}
                              {viewType === 'customer' && booking.worker && (
                                <>
                                  <div>
                                    <p className='text-sm font-medium text-gray-700 mb-1'>
                                      Worker Name:
                                    </p>
                                    <p className='text-sm text-gray-600'>
                                      {booking.worker.name || 'N/A'}
                                    </p>
                                  </div>
                                  <div>
                                    <p className='text-sm font-medium text-gray-700 mb-1'>
                                      Worker Email:
                                    </p>
                                    <p className='text-sm text-gray-600'>
                                      {booking.worker.email || 'N/A'}
                                    </p>
                                  </div>
                                  <div>
                                    <p className='text-sm font-medium text-gray-700 mb-1'>
                                      Worker Phone:
                                    </p>
                                    <p className='text-sm text-gray-600'>
                                      {booking.worker.phone || 'N/A'}
                                    </p>
                                  </div>
                                  {booking.worker.shift && (
                                    <div>
                                      <p className='text-sm font-medium text-gray-700 mb-1'>
                                        Worker Shift:
                                      </p>
                                      <p className='text-sm text-gray-600 capitalize'>
                                        {booking.worker.shift}
                                      </p>
                                    </div>
                                  )}
                                </>
                              )}
                              {viewType === 'customer' && !booking.worker && (
                                <div className='md:col-span-2'>
                                  <p className='text-sm font-medium text-gray-700 mb-1'>
                                    Worker:
                                  </p>
                                  <p className='text-sm text-gray-500 italic'>
                                    No worker assigned yet
                                  </p>
                                </div>
                              )}


                              <div className='md:col-span-2'>
                                {viewType === 'worker' && (
                                  <>
                                    <p className='text-sm font-medium text-gray-700 mb-1'>
                                      Customer Name:
                                      {booking.customer?.name || 'N/A'}

                                    </p>



                                  </>

                                )}
                                {viewType === 'customer' && (
                                  <p className='text-sm font-medium text-gray-700 mb-1'>
                                    Worker Name:

                                    {booking.worker?.name || 'Not Assigned'}
                                  </p>

                                )}

                              </div>

                              {/* Special instructions */}
                              {booking.special_instructions && (
                                <div className='md:col-span-2'>
                                  <p className='text-sm font-medium text-gray-700 mb-1'>
                                    Special Instructions:
                                  </p>
                                  <p className='text-sm text-gray-600'>
                                    {booking.special_instructions}
                                  </p>
                                </div>
                              )}

                              {/* Quantity */}
                              <div>
                                <p className='text-sm font-medium text-gray-700 mb-1'>
                                  Quantity:
                                </p>
                                <p className='text-sm text-gray-600'>
                                  {booking.quantity}{' '}
                                  {booking.service_subcategory?.unit_type && (
                                    <span className='text-gray-500'>
                                      ({booking.service_subcategory.unit_type})
                                    </span>
                                  )}
                                </p>
                              </div>

                              {/* Shift type */}
                              <div>
                                <p className='text-sm font-medium text-gray-700 mb-1'>
                                  Shift Type:
                                </p>
                                <p className='text-sm text-gray-600 capitalize'>
                                  {booking.shift_type || 'Day'}
                                </p>
                              </div>

                              {/* Additional details for customers */}
                              {viewType === 'customer' && (
                                <>
                                  <div>
                                    <p className='text-sm font-medium text-gray-700 mb-1'>
                                      Unit Price:
                                    </p>
                                    <p className='text-sm text-gray-600'>
                                      ৳
                                      {parseFloat(
                                        booking.unit_price || 0
                                      ).toFixed(2)}
                                    </p>
                                  </div>
                                  <div>
                                    <p className='text-sm font-medium text-gray-700 mb-1'>
                                      Subtotal:
                                    </p>
                                    <p className='text-sm text-gray-600'>
                                      ৳
                                      {parseFloat(
                                        booking.subtotal_amount || 0
                                      ).toFixed(2)}
                                    </p>
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className='flex items-center gap-2'>
                        {/* Action buttons for workers */}
                        {viewType === 'worker' && (
                          <div className='flex items-center gap-2'>
                            {canConfirm(booking) && (
                              <button
                                onClick={() =>
                                  handleStatusUpdateClick(
                                    booking.id,
                                    'confirmed',
                                    booking
                                  )
                                }
                                disabled={updateStatusMutation.isPending}
                                className='px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2'>
                                <CheckCircle className='w-4 h-4' />
                                Confirm
                              </button>
                            )}
                            {canCancel(booking) && (
                              <button
                                onClick={() =>
                                  handleStatusUpdateClick(
                                    booking.id,
                                    'cancelled',
                                    booking
                                  )
                                }
                                disabled={updateStatusMutation.isPending}
                                className='px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2'>
                                <X className='w-4 h-4' />
                                Cancel
                              </button>
                            )}
                          </div>
                        )}

                        <button
                          onClick={() => toggleExpand(booking.id)}
                          className='ml-2 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors'>
                          {isExpanded ? (
                            <ChevronUp className='w-5 h-5' />
                          ) : (
                            <ChevronDown className='w-5 h-5' />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      <Modal
        isOpen={confirmModal.isOpen}
        onClose={handleCloseModal}
        title={
          confirmModal.status === 'confirmed'
            ? 'Confirm Booking'
            : 'Cancel Booking'
        }
        icon={confirmModal.status === 'confirmed' ? CheckCircle : AlertTriangle}
        iconBgColor={
          confirmModal.status === 'confirmed' ? 'bg-green-100' : 'bg-red-100'
        }
        iconColor={
          confirmModal.status === 'confirmed'
            ? 'text-green-600'
            : 'text-red-600'
        }
        size='md'
        showCloseButton={!updateStatusMutation.isPending}
        footerAlignment='right'
        footer={
          <>
            <button
              onClick={handleCloseModal}
              disabled={updateStatusMutation.isPending}
              className='px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium'>
              Cancel
            </button>
            <button
              onClick={handleConfirmStatusUpdate}
              disabled={updateStatusMutation.isPending}
              className={`px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 ${confirmModal.status === 'confirmed'
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'bg-red-600 text-white hover:bg-red-700'
                }`}>
              {updateStatusMutation.isPending ? (
                <>
                  <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin'></div>
                  Processing...
                </>
              ) : confirmModal.status === 'confirmed' ? (
                <>
                  <CheckCircle className='w-4 h-4' />
                  Confirm Booking
                </>
              ) : (
                <>
                  <X className='w-4 h-4' />
                  Cancel Booking
                </>
              )}
            </button>
          </>
        }>
        <div className='space-y-4'>
          <p className='text-gray-700'>
            {confirmModal.status === 'confirmed' ? (
              <>
                Are you sure you want to <strong>confirm</strong> this booking?
                Once confirmed, you will not be able to cancel it.
              </>
            ) : (
              <>
                Are you sure you want to <strong>cancel</strong> this booking?
                This action cannot be undone.
              </>
            )}
          </p>

          {confirmModal.bookingDetails && (
            <div className='bg-gray-50 rounded-lg p-4 space-y-2'>
              <div className='flex items-center justify-between'>
                <span className='text-sm text-gray-600'>Booking ID:</span>
                <span className='text-sm font-semibold text-gray-900'>
                  #{confirmModal.bookingDetails.id}
                </span>
              </div>
              <div className='flex items-center justify-between'>
                <span className='text-sm text-gray-600'>Service:</span>
                <span className='text-sm font-semibold text-gray-900'>
                  {confirmModal.bookingDetails.service_subcategory?.name ||
                    confirmModal.bookingDetails.service?.name ||
                    'N/A'}
                </span>
              </div>
              {viewType === 'worker' && (
                <div className='flex items-center justify-between'>
                  <span className='text-sm text-gray-600'>Customer:</span>
                  <span className='text-sm font-semibold text-gray-900'>
                    {confirmModal.bookingDetails.customer_name ||
                      confirmModal.bookingDetails.customer?.name ||
                      'N/A'}
                  </span>
                </div>
              )}
              <div className='flex items-center justify-between'>
                <span className='text-sm text-gray-600'>Amount:</span>
                <span className='text-sm font-semibold text-gray-900'>
                  ৳
                  {parseFloat(
                    confirmModal.bookingDetails.total_amount || 0
                  ).toFixed(2)}
                </span>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div >
  );
}
