import { ArrowLeft, CreditCard, Loader2 } from 'lucide-react';
import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { useLocation, useNavigate } from 'react-router';
import { useCreateBooking } from '../../hooks/useBooking';
import SectionHeader from './HirePage/SectionHeader';

const PaymentConfirmationPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const createBookingMutation = useCreateBooking();
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [isProcessing, setIsProcessing] = useState(false);

  // Get booking data from location state
  const bookingData = location.state;

  // If no booking data, redirect back
  if (!bookingData) {
    navigate('/customer/manage-workers');
    return null;
  }

  const {
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
    servicesData,
    bookingQuantity,
    customerId,
    buildScheduledAt: scheduledAtString,
  } = bookingData || {};

  const handlePayment = async () => {
    setIsProcessing(true);
    try {
      const bookingPayload = {
        user_id: customerId,
        customer_name: customerName.trim(),
        customer_email: customerEmail.trim(),
        customer_phone: customerPhone.trim(),
        service_address: customerAddress.trim(),
        special_instructions: specialInstructions.trim() || null,
        services: servicesData,
        shift_type: workerShift,
        scheduled_at: scheduledAtString,
        quantity: bookingQuantity,
      };

      await createBookingMutation.mutateAsync(bookingPayload);
      toast.success('Booking confirmed successfully!');
      navigate('/customer/my-booking');
    } catch (error) {
      console.error('Booking error:', error);
      toast.error('Failed to confirm booking. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className='min-h-screen bg-gray-50 p-6'>
      <div className='max-w-4xl mx-auto'>
        <div className='mb-8'>
          <button
            onClick={() => navigate(-1)}
            className='flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors cursor-pointer'
            disabled={isProcessing}>
            <ArrowLeft className='w-5 h-5' />
            Back
          </button>
          <div className='flex items-center gap-3'>
            <div className='w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center'>
              <CreditCard className='w-6 h-6 text-green-600' />
            </div>
            <h1 className='text-3xl font-bold text-gray-900'>
              Payment Confirmation
            </h1>
          </div>
          <p className='text-gray-600 mt-2'>
            Review your booking details and confirm payment
          </p>
        </div>

        <div className='space-y-6'>
          <div className='bg-white rounded-lg shadow-sm p-6'>
            <SectionHeader
              icon={CreditCard}
              title='Booking Details'
              iconBgColor='bg-blue-100'
              iconColor='text-blue-600'
            />
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mt-4'>
              <div>
                <p className='text-sm text-gray-600'>Worker</p>
                <p className='font-medium text-gray-900'>{worker.name}</p>
              </div>
              <div>
                <p className='text-sm text-gray-600'>Shift</p>
                <p className='font-medium text-gray-900 capitalize'>
                  {workerShift}
                </p>
              </div>
              <div>
                <p className='text-sm text-gray-600'>Date</p>
                <p className='font-medium text-gray-900'>{selectedDate}</p>
              </div>
              <div>
                <p className='text-sm text-gray-600'>Time</p>
                <p className='font-medium text-gray-900'>{selectedTime}</p>
              </div>
              <div>
                <p className='text-sm text-gray-600'>Total Services</p>
                <p className='font-medium text-gray-900'>
                  {selectedSubcategories.length}
                </p>
              </div>
            </div>
          </div>

          <div className='bg-white rounded-lg shadow-sm p-6'>
            <h3 className='text-xl font-semibold text-gray-900 mb-4'>
              Your Information
            </h3>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div>
                <p className='text-sm text-gray-600'>Name</p>
                <p className='font-medium text-gray-900'>{customerName}</p>
              </div>
              <div>
                <p className='text-sm text-gray-600'>Email</p>
                <p className='font-medium text-gray-900'>{customerEmail}</p>
              </div>
              <div>
                <p className='text-sm text-gray-600'>Phone</p>
                <p className='font-medium text-gray-900'>{customerPhone}</p>
              </div>
              <div>
                <p className='text-sm text-gray-600'>Service Address</p>
                <p className='font-medium text-gray-900'>{customerAddress}</p>
              </div>
              {specialInstructions && (
                <div className='md:col-span-2'>
                  <p className='text-sm text-gray-600'>Special Instructions</p>
                  <p className='font-medium text-gray-900'>
                    {specialInstructions}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className='bg-white rounded-lg shadow-sm p-6'>
            <h3 className='text-xl font-semibold text-gray-900 mb-4'>
              Selected Services
            </h3>
            <div className='space-y-3'>
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
                        Quantity: {qty} {sub.unit_type} × ৳{price}
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

          <div className='bg-white rounded-lg shadow-sm p-6'>
            <h3 className='text-xl font-semibold text-gray-900 mb-4'>
              Price Breakdown
            </h3>
            <div className='space-y-3'>
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
              <div className='flex justify-between text-xl font-bold text-gray-900 border-t pt-3'>
                <span>Total Amount:</span>
                <span className='text-green-600'>
                  ৳{calculatePricing.total}
                </span>
              </div>
            </div>
          </div>

          <div className='bg-white rounded-lg shadow-sm p-6'>
            <h3 className='text-xl font-semibold text-gray-900 mb-4'>
              Payment Method
            </h3>
            <div className='space-y-2'>
              <label className='flex items-center gap-3 p-4 border-2 border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 transition-colors'>
                <input
                  type='radio'
                  name='payment'
                  value='cash'
                  checked={paymentMethod === 'cash'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className='w-4 h-4 text-blue-600'
                  disabled={isProcessing}
                />
                <div className='flex-1'>
                  <p className='font-medium text-gray-900'>Cash on Service</p>
                  <p className='text-sm text-gray-500'>
                    Pay when worker arrives
                  </p>
                </div>
              </label>
            </div>
          </div>

          <div className='flex gap-4 pt-4'>
            <button
              onClick={() => navigate(-1)}
              disabled={isProcessing}
              className='flex-1 px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'>
              Cancel
            </button>
            <button
              onClick={handlePayment}
              disabled={isProcessing}
              className='flex-1 px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2'>
              {isProcessing ? (
                <>
                  <Loader2 className='w-5 h-5 animate-spin' />
                  Processing...
                </>
              ) : (
                'Confirm Payment'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentConfirmationPage;
