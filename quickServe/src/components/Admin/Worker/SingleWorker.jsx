import {
  AlertCircle,
  ArrowLeft,
  CheckCircle,
  ShieldCheck,
  Star,
} from 'lucide-react';
import { useContext, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router';
import { AuthContext } from '../../../components/Context/AuthContext';
import { useGetSingleWorker } from '../../../hooks/useWorker';
import { calculateAverageRating } from '../../../utils/util';
import NIDVerificationModal from './NIDVerificationModal';

function SingleWorker() {
  const params = useParams();
  const id = params.id;

  const {
    data: worker,
    isLoading: loading,
    isError,
    error: queryError,
  } = useGetSingleWorker(id);

  const [averageRating, setAverageRating] = useState(0);
  const [nidVerificationModal, setNidVerificationModal] = useState({
    open: false,
  });
  const { user } = useContext(AuthContext);
  const isAdmin = user?.role === 'Admin';

  useEffect(() => {
    if (worker && worker.expertise_of_service) {
      const avgRating = calculateAverageRating(worker.expertise_of_service);
      setAverageRating(avgRating);
    }
  }, [worker]);

  const error =
    queryError?.message || (isError ? 'Failed to load worker details' : null);

  // Get services array from the relationship
  const getServices = () => {
    if (!worker) return [];

    // Services come from the relationship
    if (Array.isArray(worker.services)) {
      return worker.services;
    }

    return [];
  };

  // Get expertise ratings array
  const getExpertiseRatings = () => {
    if (!worker) return [];

    const expertise = worker.expertise_of_service;

    // Already an array (from model cast)
    if (Array.isArray(expertise)) {
      return expertise;
    }

    // Fallback for string (shouldn't happen with proper model cast)
    if (typeof expertise === 'string') {
      try {
        const parsed = JSON.parse(expertise);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }

    return [];
  };

  const services = getServices();
  const expertiseRatings = getExpertiseRatings();

  // Show loading state
  if (loading) {
    return (
      <div className='p-6'>
        <div className='flex justify-center items-center py-12'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600'></div>
          <span className='ml-3 text-gray-600'>Loading worker details...</span>
        </div>
      </div>
    );
  }

  // Show error state
  if (error || !worker) {
    return (
      <div className='p-6'>
        <div className='text-center py-12'>
          <p className='text-red-600 mb-4'>{error || 'Worker not found'}</p>
          <Link
            to='/manage'
            className='inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700'>
            <ArrowLeft className='w-4 h-4' />
            Back to Workers
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className='p-6'>
      {/* Header */}
      <div className='flex items-center justify-between mb-6'>
        <div className='flex items-center gap-4'>
          <Link
            to='/manage'
            className='flex items-center gap-2 text-gray-600 hover:text-gray-900'>
            <ArrowLeft className='w-5 h-5' />
            Back to Workers
          </Link>
        </div>
      </div>

      {/* Basic Information */}
      <div className='bg-white rounded-lg border border-gray-200 p-6 mb-6'>
        <h2 className='text-lg font-semibold text-gray-900 mb-4'>
          Basic Information
        </h2>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
          <div className='flex items-center gap-3'>
            <div className='w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center'>
              {worker.image ? (
                <img
                  src={worker.image}
                  alt={worker.name}
                  className='w-12 h-12 rounded-full object-cover'
                />
              ) : (
                <span className='font-semibold text-blue-600'>
                  {worker.name?.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div>
              <p className='font-medium text-gray-900'>{worker.name}</p>
              <p className='text-sm text-gray-500'>Name</p>
            </div>
          </div>

          <div>
            <p className='font-medium text-gray-900'>{worker.email}</p>
            <p className='text-sm text-gray-500'>Email</p>
          </div>

          <div>
            <p className='font-medium text-gray-900'>{worker.phone || 'N/A'}</p>
            <p className='text-sm text-gray-500'>Phone</p>
          </div>

          <div>
            <p className='font-medium text-gray-900'>{worker.age} years</p>
            <p className='text-sm text-gray-500'>Age</p>
          </div>
        </div>
      </div>

      {/* Status, Shift, and Rating Cards */}
      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6'>
        <div className='bg-white rounded-lg border border-gray-200 p-6'>
          <h3 className='font-semibold text-gray-900 mb-3'>Status</h3>
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              worker.is_active
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }`}>
            {worker.is_active ? 'Active' : 'Inactive'}
          </span>
        </div>

        <div className='bg-white rounded-lg border border-gray-200 p-6'>
          <h3 className='font-semibold text-gray-900 mb-3'>Shift</h3>
          <p className='text-gray-900 capitalize'>
            {worker.shift || 'Not specified'}
          </p>
        </div>

        <div className='bg-white rounded-lg border border-gray-200 p-6'>
          <h3 className='font-semibold text-gray-900 mb-3'>Average Rating</h3>
          <div className='flex items-center gap-2'>
            <Star className='w-5 h-5 text-yellow-400 fill-current' />
            <span className='font-semibold text-gray-900'>
              {averageRating > 0 ? averageRating.toFixed(1) : '0'}/5
            </span>
          </div>
        </div>
      </div>

      {/* Services & Ratings */}
      <div className='bg-white rounded-lg border border-gray-200 p-6 mb-6'>
        <h2 className='text-lg font-semibold text-gray-900 mb-4'>
          Services & Expertise Ratings
        </h2>
        <div className='space-y-3'>
          {services && services.length > 0 ? (
            services.map((service, index) => {
              // Get the rating for this service
              const rating = expertiseRatings[index];

              return (
                <div
                  key={service.id}
                  className='flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors'>
                  <div className='flex items-center gap-3'>
                    <div className='w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center'>
                      <span className='font-semibold text-blue-600 text-sm'>
                        {service.name?.charAt(0).toUpperCase() || 'S'}
                      </span>
                    </div>
                    <span className='font-medium text-gray-900'>
                      {service.name}
                    </span>
                  </div>

                  {rating !== undefined && rating !== null ? (
                    <div className='flex items-center gap-2'>
                      <div className='flex items-center gap-1'>
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < rating
                                ? 'text-yellow-400 fill-current'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className='text-sm font-medium text-gray-700'>
                        ({rating}/5)
                      </span>
                    </div>
                  ) : (
                    <span className='text-sm text-gray-500'>No rating</span>
                  )}
                </div>
              );
            })
          ) : (
            <div className='text-center py-8'>
              <p className='text-gray-500'>No services assigned</p>
            </div>
          )}
        </div>
      </div>

      {/* Address */}
      {worker.address && (
        <div className='bg-white rounded-lg border border-gray-200 p-6 mb-6'>
          <h2 className='text-lg font-semibold text-gray-900 mb-4'>Address</h2>
          <p className='text-gray-700 bg-gray-50 p-4 rounded-lg'>
            {worker.address}
          </p>
        </div>
      )}

      {/* Feedback */}
      {worker.feedback && (
        <div className='bg-white rounded-lg border border-gray-200 p-6'>
          <h2 className='text-lg font-semibold text-gray-900 mb-4'>
            Additional Feedback
          </h2>
          <p className='text-gray-700 bg-gray-50 p-4 rounded-lg'>
            {worker.feedback}
          </p>
        </div>
      )}

      {/* NID Verification Section */}
      {worker.nid && (
        <div className='bg-white rounded-lg border border-gray-200 p-6'>
          <div className='flex items-center justify-between mb-4'>
            <h2 className='text-lg font-semibold text-gray-900 flex items-center gap-2'>
              <ShieldCheck className='w-5 h-5 text-blue-600' />
              National ID Verification
            </h2>
            {isAdmin && (
              <button
                onClick={() => setNidVerificationModal({ open: true })}
                className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2'>
                <ShieldCheck className='w-4 h-4' />
                {worker.nid_verified ? 'Update Verification' : 'Verify NID'}
              </button>
            )}
          </div>

          <div className='space-y-4'>
            {/* NID Number */}
            <div>
              <label className='block text-sm font-semibold text-gray-700 mb-2'>
                NID Number
              </label>
              <div className='p-3 bg-gray-50 rounded-lg border border-gray-200'>
                <p className='text-lg font-mono font-semibold text-gray-900'>
                  {worker.nid}
                </p>
              </div>
            </div>

            {/* Verification Status */}
            <div>
              <label className='block text-sm font-semibold text-gray-700 mb-2'>
                Verification Status
              </label>
              <div
                className={`p-3 rounded-lg flex items-center gap-2 ${
                  worker.nid_verified
                    ? 'bg-green-50 border border-green-200'
                    : 'bg-yellow-50 border border-yellow-200'
                }`}>
                {worker.nid_verified ? (
                  <>
                    <CheckCircle className='w-5 h-5 text-green-600' />
                    <span className='font-medium text-green-800'>
                      Verified
                      {worker.nid_verified_at && (
                        <span className='ml-2 text-sm text-green-600'>
                          on{' '}
                          {new Date(
                            worker.nid_verified_at
                          ).toLocaleDateString()}
                        </span>
                      )}
                    </span>
                  </>
                ) : (
                  <>
                    <AlertCircle className='w-5 h-5 text-yellow-600' />
                    <span className='font-medium text-yellow-800'>
                      Pending Verification
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* NID Images */}
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div>
                <label className='block text-sm font-semibold text-gray-700 mb-2'>
                  NID Front Image
                </label>
                {worker.nid_front_image ? (
                  <div className='border border-gray-200 rounded-lg overflow-hidden'>
                    <img
                      src={worker.nid_front_image}
                      alt='NID Front'
                      className='w-full h-64 object-contain bg-gray-50'
                    />
                  </div>
                ) : (
                  <div className='border border-gray-200 rounded-lg p-8 text-center bg-gray-50'>
                    <p className='text-sm text-gray-500'>No image provided</p>
                  </div>
                )}
              </div>

              <div>
                <label className='block text-sm font-semibold text-gray-700 mb-2'>
                  NID Back Image
                </label>
                {worker.nid_back_image ? (
                  <div className='border border-gray-200 rounded-lg overflow-hidden'>
                    <img
                      src={worker.nid_back_image}
                      alt='NID Back'
                      className='w-full h-64 object-contain bg-gray-50'
                    />
                  </div>
                ) : (
                  <div className='border border-gray-200 rounded-lg p-8 text-center bg-gray-50'>
                    <p className='text-sm text-gray-500'>No image provided</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* NID Verification Modal */}
      {isAdmin && (
        <NIDVerificationModal
          isOpen={nidVerificationModal.open}
          onClose={() => setNidVerificationModal({ open: false })}
          worker={worker}
        />
      )}
    </div>
  );
}

export default SingleWorker;
