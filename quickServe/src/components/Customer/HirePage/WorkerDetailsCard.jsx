import { Star, User } from 'lucide-react';
import React from 'react';
import SectionHeader from './SectionHeader';

const WorkerDetailsCard = ({ worker, workerShift, services }) => {
  const averageRating = worker?.average_rating || 0;
  const totalReviews = worker?.total_reviews || 0;

  return (
    <div className='bg-white rounded-lg shadow-sm p-6 mb-6'>
      <SectionHeader
        icon={User}
        title='Worker Details'
        iconBgColor='bg-green-100'
        iconColor='text-green-600'
      />
      <div className='space-y-4'>
        <div className='flex items-center gap-4 p-4 bg-gray-50 rounded-lg'>
          <div className='w-20 h-20 rounded-full flex items-center justify-center shrink-0 overflow-hidden'>
            {worker.image ? (
              <img
                src={worker.image}
                alt={worker.name}
                className='w-20 h-20 rounded-full object-cover'
              />
            ) : (
              <div className='w-20 h-20 bg-gray-300 rounded-full flex items-center justify-center'>
                <User className='w-10 h-10 text-gray-600' />
              </div>
            )}
          </div>
          <div>
            <h3 className='text-lg font-semibold text-gray-900'>
              {worker.name}
            </h3>
            <p className='text-sm text-gray-600 capitalize'>
              {worker.shift} Shift
              {workerShift === 'night' && (
                <span className='ml-2 text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded'>
                  +20% charge
                </span>
              )}
            </p>

            {/* Customer Rating Summary */}
            <div className='flex items-center gap-2 mt-2'>
              <div className='inline-flex items-center gap-1 px-2 py-1 bg-yellow-50 rounded-full border border-yellow-200'>
                <Star className='w-4 h-4 text-yellow-400 fill-yellow-400' />
                <span className='text-sm font-semibold text-gray-900'>
                  {averageRating.toFixed(1)}
                </span>
              </div>
              <span className='text-xs text-gray-600'>
                {totalReviews > 0
                  ? `${totalReviews} review${totalReviews > 1 ? 's' : ''}`
                  : 'No customer reviews yet'}
              </span>
            </div>

            <div className='flex items-center gap-2 mt-2'>
              <span className='text-sm text-gray-600'>Age: {worker.age}</span>
            </div>
          </div>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          <div>
            <h4 className='text-sm font-semibold text-gray-900 mb-2'>
              Contact Information
            </h4>
            <p className='text-sm text-gray-600'>Email: {worker.email}</p>
            <p className='text-sm text-gray-600'>
              Phone: {worker.phone || 'N/A'}
            </p>
          </div>
          <div>
            <h4 className='text-sm font-semibold text-gray-900 mb-2'>
              Service Types
            </h4>
            <div className='space-y-2'>
              {services.length > 0 ? (
                services.map((service, index) => {
                  const expertise = Array.isArray(worker.expertise_of_service)
                    ? worker.expertise_of_service
                    : typeof worker.expertise_of_service === 'string'
                      ? JSON.parse(worker.expertise_of_service || '[]')
                      : [];
                  const rating = expertise[index] || 0;
                  return (
                    <div
                      key={service.id}
                      className='flex items-center justify-between px-3 py-2 bg-gray-50 rounded-lg'>
                      <span className='text-sm font-medium text-gray-700'>
                        {service.name}
                      </span>
                      <div className='flex items-center gap-1'>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-3.5 h-3.5 ${
                              star <= rating
                                ? 'text-yellow-400 fill-yellow-400'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                        <span className='text-xs font-semibold text-gray-600 ml-1'>
                          {rating}/5
                        </span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <span className='text-sm text-gray-500'>
                  No services listed
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkerDetailsCard;
