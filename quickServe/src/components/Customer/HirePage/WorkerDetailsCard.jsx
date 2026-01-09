import { User } from 'lucide-react';
import React from 'react';
import SectionHeader from './SectionHeader';

const WorkerDetailsCard = ({ worker, workerShift, services }) => {
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
            <div className='flex items-center gap-2 mt-1'>
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
            <div className='flex flex-wrap gap-2'>
              {services.length > 0 ? (
                services.map((service) => (
                  <span
                    key={service.id}
                    className='px-3 py-1 bg-blue-100 text-blue-700 text-xs rounded-full'>
                    {service.name}
                  </span>
                ))
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
