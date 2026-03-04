import React, { useContext } from 'react';
import { AlertTriangle, CheckCircle, IdCard, ShieldAlert } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useGetWorkerBookings } from '../../hooks/useBooking';
import { useCheckWorkerProfile, useGetProfile } from '../../hooks/useWorker';
import { AuthContext } from '../Context/AuthContext';
import BookingList from '../shared/BookingList';

export default function WorkerPortal() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const {
    data: profileData,
    isLoading: profileLoading,
    isError: profileError,
  } = useCheckWorkerProfile();
  const {
    data: workerProfile,
    isLoading: workerProfileLoading,
  } = useGetProfile();
  const {
    data: bookingsResponse,
    isLoading: bookingsLoading,
    isError: bookingsError,
    error: bookingsErrorData,
  } = useGetWorkerBookings(user?.id);

  if (profileLoading || bookingsLoading || workerProfileLoading) {
    return (
      <div className='flex justify-center items-center py-12'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto'></div>
          <p className='mt-4 text-gray-600'>Loading jobs...</p>
        </div>
      </div>
    );
  }

  if (profileError || !profileData?.isComplete) {
    return (
      <div className='text-center py-12'>
        <h1 className='text-2xl font-bold text-gray-900 mb-2'>
          {profileData?.message || 'Complete your info to get your job'}
        </h1>
        <p className='text-gray-600'>
          Please complete your profile to receive job requests
        </p>
      </div>
    );
  }

  // Determine NID status for notification
  const hasNid = !!workerProfile?.nid;
  const hasNidImages = !!workerProfile?.nid_front_image && !!workerProfile?.nid_back_image;
  const isNidVerified = !!workerProfile?.nid_verified;
  const showNidNotification = !hasNid || !hasNidImages || !isNidVerified;

  return (
    <div>
      {/* NID Notification Banner */}
      {showNidNotification && (
        <div className='mx-4 mt-4 mb-2'>
          {!hasNid || !hasNidImages ? (
            // Worker has NOT submitted NID yet
            <div className='flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg'>
              <ShieldAlert className='w-6 h-6 text-red-600 shrink-0 mt-0.5' />
              <div className='flex-1'>
                <h3 className='font-semibold text-red-800 text-sm'>
                  NID Verification Required
                </h3>
                <p className='text-red-700 text-sm mt-1'>
                  {!hasNid
                    ? 'You have not submitted your National ID (NID) number yet. '
                    : 'You have not uploaded your NID images yet. '}
                  Please submit your NID information to get verified and become visible to customers.
                  Without NID verification, your profile will not appear in customer search results.
                </p>
                <button
                  onClick={() => navigate('/worker/profile')}
                  className='mt-3 inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors'>
                  <IdCard className='w-4 h-4' />
                  Submit NID Now
                </button>
              </div>
            </div>
          ) : !isNidVerified ? (
            // Worker has submitted NID but it's not verified yet
            <div className='flex items-start gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg'>
              <AlertTriangle className='w-6 h-6 text-yellow-600 shrink-0 mt-0.5' />
              <div className='flex-1'>
                <h3 className='font-semibold text-yellow-800 text-sm'>
                  NID Verification Pending
                </h3>
                <p className='text-yellow-700 text-sm mt-1'>
                  Your NID has been submitted and is awaiting verification by an admin.
                  Once verified, your profile will become visible to customers.
                  You will be able to receive job requests after verification.
                </p>
              </div>
            </div>
          ) : null}
        </div>
      )}

      {/* Verified Badge */}
      {isNidVerified && (
        <div className='mx-4 mt-4 mb-2'>
          <div className='flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg'>
            <CheckCircle className='w-5 h-5 text-green-600' />
            <p className='text-green-700 text-sm font-medium'>
              Your NID is verified — Your profile is visible to customers
            </p>
          </div>
        </div>
      )}

      <BookingList
        bookings={bookingsResponse}
        isLoading={bookingsLoading}
        isError={bookingsError}
        error={bookingsErrorData}
        title='Job Requests'
        description='View and manage job requests from customers'
        emptyTitle='No job requests yet'
        emptyMessage='Job requests from customers will appear here'
        emptyActionText='Show All Jobs'
        totalLabel='Total Jobs'
        viewType='worker'
      />
    </div>
  );
}
