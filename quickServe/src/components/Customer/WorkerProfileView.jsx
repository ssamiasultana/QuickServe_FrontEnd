import { ArrowLeft } from 'lucide-react';
import React, { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useGetSingleWorker } from '../../hooks/useWorker';
import WorkerDetailsCard from './HirePage/WorkerDetailsCard';
import WorkerReviews from './HirePage/WorkerReviews';

export default function WorkerProfileView() {
  const { id } = useParams();
  const navigate = useNavigate();

  const {
    data: worker,
    isLoading,
    isError,
    error,
  } = useGetSingleWorker(id);

  const services = useMemo(() => {
    if (!worker) return [];
    if (Array.isArray(worker.services)) return worker.services;
    return [];
  }, [worker]);

  const workerShift = useMemo(() => {
    if (!worker) return 'day';
    const shift = (
      worker.shift ||
      worker.shift_type ||
      worker.worker_shift ||
      ''
    )
      .toString()
      .toLowerCase();
    if (shift === 'night') return 'night';
    if (shift === 'flexible') return 'flexible';
    return 'day';
  }, [worker]);

  if (isLoading) {
    return (
      <div className='min-h-screen bg-gray-50 p-6 flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto'></div>
          <p className='mt-4 text-gray-600'>Loading worker profile...</p>
        </div>
      </div>
    );
  }

  if (isError || !worker) {
    return (
      <div className='min-h-screen bg-gray-50 p-6 flex items-center justify-center'>
        <div className='text-center'>
          <p className='text-red-600 font-semibold'>Error loading worker profile</p>
          <p className='text-gray-600 mt-2'>
            {error?.message || 'Something went wrong'}
          </p>
          <button
            onClick={() => navigate(-1)}
            className='mt-4 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors'>
            Go back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-50 p-6'>
      <div className='max-w-7xl mx-auto'>
        <div className='mb-6'>
          <button
            onClick={() => navigate(-1)}
            className='flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-3 transition-colors cursor-pointer'>
            <ArrowLeft className='w-5 h-5' />
            Back
          </button>
          <div className='flex items-start justify-between gap-4 flex-col sm:flex-row'>
            <div>
              <h1 className='text-2xl md:text-3xl font-bold text-gray-900'>
                Worker Profile
              </h1>
              <p className='text-gray-600 mt-1'>
                View worker details and reviews before hiring
              </p>
            </div>
            <button
              onClick={() => navigate(`/customer/hire-worker/${worker.id}`)}
              className='px-5 py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-sm'>
              Hire this worker
            </button>
          </div>
        </div>

        <WorkerDetailsCard worker={worker} workerShift={workerShift} services={services} />
        <WorkerReviews workerId={worker.id} />
      </div>
    </div>
  );
}

