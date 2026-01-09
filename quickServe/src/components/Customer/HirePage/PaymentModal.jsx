import { CreditCard, Loader2, X } from 'lucide-react';
import React from 'react';

const PaymentModal = ({
  isOpen,
  onClose,
  worker,
  workerShift,
  selectedDate,
  selectedTime,
  selectedSubcategories,
  quantities,
  customerName,
  customerEmail,
  customerPhone,
  customerAddress,
  specialInstructions,
  calculatePricing,
  paymentMethod,
  onPaymentMethodChange,
  onConfirmPayment,
  isProcessing,
}) => {
  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50'>
      <div className='bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto'>
        <div className='sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center'>
          <div className='flex items-center gap-3'>
            <div className='w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center'>
              <CreditCard className='w-6 h-6 text-green-600' />
            </div>
            <h2 className='text-2xl font-bold text-gray-900'>
              Payment Summary
            </h2>
          </div>
          {!isProcessing && (
            <button
              onClick={onClose}
              className='text-gray-400 hover:text-gray-600 transition-colors'>
              <X className='w-6 h-6' />
            </button>
          )}
        </div>

        <div className='p-6 space-y-6'>
          <div className='bg-gray-50 rounded-lg p-4'>
            <h3 className='font-semibold text-gray-900 mb-3'>
              Booking Details
            </h3>
            <div className='space-y-2 text-sm'>
              <div className='flex justify-between'>
                <span className='text-gray-600'>Worker:</span>
                <span className='font-medium text-gray-900'>{worker.name}</span>
              </div>
              <div className='flex justify-between'>
                <span className='text-gray-600'>Shift:</span>
                <span className='font-medium text-gray-900 capitalize'>
                  {workerShift}
                </span>
              </div>
              <div className='flex justify-between'>
                <span className='text-gray-600'>Date:</span>
                <span className='font-medium text-gray-900'>
                  {selectedDate}
                </span>
              </div>
              <div className='flex justify-between'>
                <span className='text-gray-600'>Time:</span>
                <span className='font-medium text-gray-900'>
                  {selectedTime}
                </span>
              </div>
              <div className='flex justify-between'>
                <span className='text-gray-600'>Total Services:</span>
                <span className='font-medium text-gray-900'>
                  {selectedSubcategories.length}
                </span>
              </div>
            </div>
          </div>

          <div className='bg-gray-50 rounded-lg p-4'>
            <h3 className='font-semibold text-gray-900 mb-3'>
              Your Information
            </h3>
            <div className='space-y-2 text-sm'>
              <div className='flex justify-between'>
                <span className='text-gray-600'>Name:</span>
                <span className='font-medium text-gray-900'>
                  {customerName}
                </span>
              </div>
              <div className='flex justify-between'>
                <span className='text-gray-600'>Email:</span>
                <span className='font-medium text-gray-900'>
                  {customerEmail}
                </span>
              </div>
              <div className='flex justify-between'>
                <span className='text-gray-600'>Phone:</span>
                <span className='font-medium text-gray-900'>
                  {customerPhone}
                </span>
              </div>
              <div className='flex justify-between items-start'>
                <span className='text-gray-600'>Address:</span>
                <span className='font-medium text-gray-900 text-right max-w-[60%]'>
                  {customerAddress}
                </span>
              </div>
              {specialInstructions && (
                <div className='flex justify-between items-start pt-2 border-t'>
                  <span className='text-gray-600'>Special Instructions:</span>
                  <span className='font-medium text-gray-900 text-right max-w-[60%]'>
                    {specialInstructions}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div>
            <h3 className='font-semibold text-gray-900 mb-3'>
              Selected Services
            </h3>
            <div className='space-y-2 max-h-60 overflow-y-auto'>
              {selectedSubcategories.map((sub) => {
                const qty = quantities[sub.id] || 1;
                const price = parseFloat(sub.base_price) || 0;
                const itemTotal = price * qty;
                return (
                  <div
                    key={sub.id}
                    className='flex justify-between items-center p-3 bg-gray-50 rounded-lg'>
                    <div>
                      <p className='font-medium text-gray-900'>{sub.name}</p>
                      <p className='text-sm text-gray-500'>
                        Quantity: {qty} {sub.unit_type}
                      </p>
                      <p className='text-sm text-gray-500'>
                        Unit Price: ৳{price}
                      </p>
                    </div>
                    <p className='font-semibold text-gray-900'>
                      ৳{itemTotal.toFixed(2)}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className='border-t pt-4'>
            <h3 className='font-semibold text-gray-900 mb-3'>
              Price Breakdown
            </h3>
            <div className='space-y-2'>
              <div className='flex justify-between text-gray-700'>
                <span>Sum of Services:</span>
                <span className='font-medium'>
                  ৳{calculatePricing.sumOfUnitPrices}
                </span>
              </div>
              {calculatePricing.shiftChargePercent > 0 && (
                <div className='flex justify-between text-gray-700'>
                  <span>
                    Night Shift Charge ({calculatePricing.shiftChargePercent}%):
                  </span>
                  <span className='font-medium'>
                    ৳{calculatePricing.shiftCharge}
                  </span>
                </div>
              )}
              <div className='flex justify-between text-lg font-bold text-gray-900 border-t pt-2'>
                <span>Total Amount:</span>
                <span className='text-green-600'>
                  ৳{calculatePricing.total}
                </span>
              </div>
            </div>
          </div>

          <div>
            <h3 className='font-semibold text-gray-900 mb-3'>Payment Method</h3>
            <div className='space-y-2'>
              <label className='flex items-center gap-3 p-3 border border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 transition-colors'>
                <input
                  type='radio'
                  name='payment'
                  value='cash'
                  checked={paymentMethod === 'cash'}
                  onChange={(e) => onPaymentMethodChange(e.target.value)}
                  className='w-4 h-4 text-blue-600'
                  disabled={isProcessing}
                />
                <div className='flex-1'>
                  <p className='font-medium text-gray-900'>Cash on Service</p>
                  <p className='text-xs text-gray-500'>
                    Pay when worker arrives
                  </p>
                </div>
              </label>
            </div>
          </div>

          <div className='flex gap-3 pt-4 border-t'>
            <button
              onClick={onClose}
              disabled={isProcessing}
              className='flex-1 px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'>
              Cancel
            </button>
            <button
              onClick={onConfirmPayment}
              disabled={isProcessing}
              className='flex-1 px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2'>
              {isProcessing ? (
                <>
                  <Loader2 className='w-5 h-5 animate-spin' />
                  Processing...
                </>
              ) : (
                'Confirm'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
