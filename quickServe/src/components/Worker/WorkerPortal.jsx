import React from 'react';
import { useGetWorkerBookings } from '../../hooks/useBooking';
import { useCheckWorkerProfile } from '../../hooks/useWorker';
import BookingList from '../shared/BookingList';

export default function WorkerPortal() {
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
  } = useGetWorkerBookings();

  if (profileLoading || bookingsLoading) {
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

  return (
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
  );
}
