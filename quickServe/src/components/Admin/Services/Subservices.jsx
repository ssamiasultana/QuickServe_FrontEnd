import { Filter, Tag } from 'lucide-react';
import React from 'react';

function SubServices({
  subservices = [],
  onSubServiceClick,
  showEmptyState = true,
  onClearFilters,
}) {
  if (subservices.length === 0 && showEmptyState) {
    return (
      <div className='bg-white rounded-lg border border-gray-200 p-12 text-center'>
        <div className='max-w-sm mx-auto'>
          <div className='bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4'>
            <Filter size={32} className='text-gray-400' />
          </div>
          <h3 className='text-lg font-semibold text-gray-900 mb-2'>
            No sub services found
          </h3>
          <p className='text-sm text-gray-600 mb-4'>
            No sub services match your current filters.
          </p>
          {onClearFilters && (
            <button
              onClick={onClearFilters}
              className='text-blue-600 hover:text-blue-700 text-sm font-medium'>
              Clear all filters
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3'>
      {subservices.map((subservice) => (
        <div
          key={subservice.id}
          onClick={() => onSubServiceClick?.(subservice)}
          className='bg-white rounded-lg shadow-sm hover:shadow-md transition-all p-3 border border-gray-200 cursor-pointer hover:border-blue-300'>
          {/* Header with Badge */}
          <div className='flex items-start justify-between mb-2'>
            <span
              className={`px-2 py-0.5 rounded text-xs font-medium ${
                subservice.unit_type === 'fixed'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-purple-100 text-purple-700'
              }`}>
              {subservice.unit_type === 'fixed' ? 'Fixed' : 'Hourly'}
            </span>
            {/*  */}
          </div>

          {/* Service Name */}
          <h3 className='text-sm font-semibold text-gray-900 mb-1 line-clamp-2'>
            {subservice.name}
          </h3>

          {/* Category Tag */}
          <div className='flex items-center gap-1 mb-2'>
            <Tag size={12} className='text-gray-400' />
            <span className='text-xs text-gray-600'>
              {subservice.category?.name || 'Unknown Category'}
            </span>
          </div>

          {/* Price */}
          <div className='flex items-baseline gap-1 pt-2 border-t border-gray-100'>
            <span className='text-lg font-bold text-gray-900'>
              BDT {parseFloat(subservice.base_price).toFixed(2)}
            </span>
            {subservice.unit_type === 'hourly' && (
              <span className='text-xs text-gray-500'>/hr</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export default SubServices;
