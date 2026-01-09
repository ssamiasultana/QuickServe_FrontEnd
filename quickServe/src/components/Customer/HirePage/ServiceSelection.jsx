import { CheckCircle } from 'lucide-react';
import React from 'react';
import SectionHeader from './SectionHeader';

const ServiceSelection = ({
  serviceSubcategories,
  isLoadingSubcategories,
  selectedSubcategories,
  quantities,
  onSubcategorySelection,
  onQuantityChange,
}) => {
  return (
    <div className='bg-white rounded-lg shadow-sm p-6'>
      <SectionHeader
        icon={CheckCircle}
        title='Select Services'
        iconBgColor='bg-purple-100'
        iconColor='text-purple-600'
      />
      <div className='space-y-4'>
        <p className='text-sm text-gray-600 mb-4'>
          Choose one or more services (each creates a separate booking):
        </p>

        {isLoadingSubcategories && (
          <div className='text-center py-4'>
            <div className='animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600 mx-auto'></div>
            <p className='text-sm text-gray-500 mt-2'>
              Loading subcategories...
            </p>
          </div>
        )}

        <div className='space-y-3 max-h-96 overflow-y-auto'>
          {serviceSubcategories.map((item) =>
            item.subcategories?.data?.map((sub) => {
              const isSelected = selectedSubcategories.some(
                (s) => s.id === sub.id
              );
              return (
                <div
                  key={sub.id}
                  className='border border-gray-200 rounded-lg p-3 hover:border-blue-500 transition-all'>
                  <label className='flex items-start gap-3 cursor-pointer'>
                    <input
                      type='checkbox'
                      className='w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-1'
                      checked={isSelected}
                      onChange={(e) =>
                        onSubcategorySelection(
                          sub.id,
                          sub,
                          e.target.checked,
                          item.serviceId
                        )
                      }
                    />
                    <div className='flex-1'>
                      <div className='flex items-center justify-between'>
                        <span className='font-medium text-gray-900'>
                          {sub.name}
                        </span>
                        {sub.base_price && (
                          <span className='text-sm font-semibold text-green-600'>
                            ৳{sub.base_price} / {sub.unit_type}
                          </span>
                        )}
                      </div>
                      {isSelected && (
                        <div className='mt-2'>
                          <label className='flex items-center gap-2'>
                            <span className='text-sm text-gray-600'>
                              Quantity:
                            </span>
                            <input
                              type='number'
                              min='1'
                              value={quantities[sub.id] || 1}
                              onChange={(e) =>
                                onQuantityChange(sub.id, e.target.value)
                              }
                              className='w-20 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                              onClick={(e) => e.stopPropagation()}
                            />
                            <span className='text-xs text-gray-500'>
                              {sub.unit_type}
                            </span>
                          </label>
                        </div>
                      )}
                    </div>
                  </label>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default ServiceSelection;
