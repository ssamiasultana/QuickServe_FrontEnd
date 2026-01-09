import { CheckCircle } from 'lucide-react';
import React from 'react';
import SectionHeader from './SectionHeader';

const BookingSummary = ({
  selectedSubcategories,
  quantities,
  calculatePricing,
}) => {
  return (
    <div className='bg-white rounded-lg shadow-sm p-6'>
      <SectionHeader
        icon={CheckCircle}
        title='Booking Summary'
        iconBgColor='bg-blue-100'
        iconColor='text-blue-600'
      />
      <div className='space-y-4'>
        {selectedSubcategories.length > 0 ? (
          <>
            <div className='space-y-2 max-h-60 overflow-y-auto'>
              {selectedSubcategories.map((sub) => {
                const qty = quantities[sub.id] || 1;
                const price = parseFloat(sub.base_price) || 0;
                const itemTotal = price * qty;
                return (
                  <div
                    key={sub.id}
                    className='flex justify-between items-center p-2 bg-gray-50 rounded'>
                    <div className='flex-1'>
                      <p className='text-sm font-medium text-gray-900'>
                        {sub.name}
                      </p>
                      <p className='text-xs text-gray-500'>
                        {qty} {sub.unit_type} × ৳{price}
                      </p>
                    </div>
                    <p className='text-sm font-semibold text-gray-900'>
                      ৳{itemTotal.toFixed(2)}
                    </p>
                  </div>
                );
              })}
            </div>
            <div className='border-t pt-3 space-y-2'>
              <div className='flex justify-between text-sm'>
                <span className='text-gray-600'>Sum of Services:</span>
                <span className='font-medium'>
                  ৳{calculatePricing.sumOfUnitPrices}
                </span>
              </div>
              {calculatePricing.shiftChargePercent > 0 && (
                <div className='flex justify-between text-sm'>
                  <span className='text-gray-600'>
                    Night Shift Charge ({calculatePricing.shiftChargePercent}%):
                  </span>
                  <span className='font-medium'>
                    ৳{calculatePricing.shiftCharge}
                  </span>
                </div>
              )}
              <div className='flex justify-between text-base font-semibold border-t pt-2'>
                <span className='text-gray-900'>Total Amount:</span>
                <span className='text-green-600'>
                  ৳{calculatePricing.total}
                </span>
              </div>
              <div className='text-xs text-gray-500 mt-2'>
                {selectedSubcategories.length} service(s) selected
              </div>
            </div>
          </>
        ) : (
          <div className='text-center py-8'>
            <p className='text-gray-500'>No services selected yet</p>
            <p className='text-sm text-gray-400 mt-1'>
              Select services to see pricing
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingSummary;
