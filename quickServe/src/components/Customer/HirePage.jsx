import { useQueries } from '@tanstack/react-query';
import {
  ArrowLeft,
  Calendar,
  CheckCircle,
  CreditCard,
  Loader2,
  User,
  X,
} from 'lucide-react';
import React, { useContext, useEffect, useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useNavigate, useParams } from 'react-router';
import { useCreateBooking } from '../../hooks/useBooking';
import { useGetSingleWorker } from '../../hooks/useWorker';
import workerService from '../../services/workerService';
import { AuthContext } from '../Context/AuthContext';

function HirePage() {
  const params = useParams();
  const navigate = useNavigate();
  const id = params.id;

  const { user } = useContext(AuthContext);

  const {
    data: worker,
    isLoading: loading,
    isError,
    error: queryError,
  } = useGetSingleWorker(id);

  const [selectedSubcategories, setSelectedSubcategories] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('bkash');

  const customerId = user?.id;

  const createBookingMutation = useCreateBooking();

  const handleSubcategorySelection = (
    subcategoryId,
    subcategory,
    isChecked,
    serviceId
  ) => {
    if (isChecked) {
      // Persist the parent service_id with the selected subcategory so payload matches backend expectations
      setSelectedSubcategories([
        ...selectedSubcategories,
        { ...subcategory, service_id: subcategory.service_id || serviceId },
      ]);
      setQuantities({ ...quantities, [subcategoryId]: 1 });
    } else {
      setSelectedSubcategories(
        selectedSubcategories.filter((sub) => sub.id !== subcategoryId)
      );
      const newQuantities = { ...quantities };
      delete newQuantities[subcategoryId];
      setQuantities(newQuantities);
    }
  };

  const handleQuantityChange = (subcategoryId, value) => {
    const quantity = Math.max(1, parseInt(value) || 1);
    setQuantities({ ...quantities, [subcategoryId]: quantity });
  };

  const getServices = () => {
    if (!worker || !worker.services) return [];
    return Array.isArray(worker.services) ? worker.services : [];
  };

  const services = getServices();

  const subcategoryQueries = useQueries({
    queries: services.map((service) => ({
      queryKey: ['serviceCategory', service.id],
      queryFn: async () => {
        const response = await workerService.getServicecategoryById(service.id);
        return {
          serviceId: service.id,
          subcategories: response,
        };
      },
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      enabled: !!service.id,
    })),
  });

  const isLoadingSubcategories = subcategoryQueries.some(
    (query) => query.isLoading
  );

  const serviceSubcategories = subcategoryQueries
    .filter((query) => query.data)
    .map((query) => query.data);

  // Get worker shift with validation (DB currently stores day|night|flexible)
  const getWorkerShift = () => {
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
    // Default to day for other values
    return 'day';
  };

  const workerShift = getWorkerShift();

  // Calculate pricing with quantity multiplied
  const calculatePricing = useMemo(() => {
    let sumOfUnitPrices = 0;

    selectedSubcategories.forEach((sub) => {
      const price = parseFloat(sub.base_price) || 0;
      const qty = quantities[sub.id] || 1;
      sumOfUnitPrices += price * qty; // Price multiplied by quantity
    });

    // Shift charge calculation
    const shiftChargePercent = workerShift === 'night' ? 20 : 0;
    const shiftCharge = sumOfUnitPrices * (shiftChargePercent / 100);
    const totalAmount = sumOfUnitPrices + shiftCharge;

    return {
      sumOfUnitPrices: sumOfUnitPrices.toFixed(2),
      shiftChargePercent,
      shiftCharge: shiftCharge.toFixed(2),
      total: totalAmount.toFixed(2),
    };
  }, [selectedSubcategories, quantities, workerShift]);

  const handleConfirmBooking = () => {
    if (!customerId) {
      toast.error('Please login to book services');
      return;
    }

    if (selectedSubcategories.length === 0 || !selectedDate || !selectedTime) {
      toast.error('Please fill in all required fields');
      return;
    }
    setShowPaymentModal(true);
  };

  const getServiceIdForSubcategory = (subcategoryId) => {
    // Try to resolve the parent service id from fetched subcategory lists
    const parentEntry = serviceSubcategories.find((item) =>
      item.subcategories?.data?.some((sub) => sub.id === subcategoryId)
    );
    return parentEntry?.serviceId || services[0]?.id;
  };

  const buildScheduledAt = () =>
    `${selectedDate}T${convertTo24Hour(selectedTime)}`;

  const handlePayment = async () => {
    try {
      // Enforce a single quantity value because backend booking payload accepts only one quantity
      const selectedQuantities = selectedSubcategories.map(
        (sub) => quantities[sub.id] || 1
      );
      const uniqueQuantities = new Set(selectedQuantities);
      if (uniqueQuantities.size > 1) {
        toast.error('Use the same quantity for all selected services');
        return;
      }
      const bookingQuantity = selectedQuantities[0] || 1;

      // Prepare services data for booking - each service should have its own quantity
      const servicesData = selectedSubcategories.map((sub) => ({
        service_id: sub.service_id || getServiceIdForSubcategory(sub.id),
        service_subcategory_id: sub.id,
      }));

      if (servicesData.some((service) => !service.service_id)) {
        toast.error('Missing service information. Please reselect services.');
        return;
      }

      // Debug log to check data before sending
      console.log('Worker shift value:', workerShift);
      console.log('Selected date:', selectedDate);
      console.log('Selected time:', selectedTime);
      console.log('Converted time:', convertTo24Hour(selectedTime));

      // Create booking with all services
      const bookingData = {
        user_id: customerId, // Will be mapped to customer_id in backend
        services: servicesData,
        shift_type: workerShift, // Use validated shift type
        scheduled_at: buildScheduledAt(),
        quantity: bookingQuantity,
      };

      console.log(
        'Sending booking data:',
        JSON.stringify(bookingData, null, 2)
      );

      // Use the mutation
      await createBookingMutation.mutateAsync(bookingData);

      // Success is handled in the mutation's onSuccess callback
      setShowPaymentModal(false);
    } catch (error) {
      console.error('Booking error:', error);
      // Error is handled in the mutation's onError callback
    }
  };

  const convertTo24Hour = (time12h) => {
    if (!time12h) return '09:00:00'; // default to 9 AM if no time selected

    const [time, period] = time12h.split(' ');
    let [hours, minutes] = time.split(':');

    if (period === 'PM' && hours !== '12') {
      hours = parseInt(hours) + 12;
    } else if (period === 'AM' && hours === '12') {
      hours = '00';
    }

    // Ensure hours are 2 digits
    hours = hours.toString().padStart(2, '0');

    return `${hours}:${minutes}:00`;
  };

  // Define time slots for day and night shifts
  const dayTimeSlots = [
    '9:00 AM',
    '10:00 AM',
    '11:00 AM',
    '12:00 PM',
    '2:00 PM',
    '3:00 PM',
    '4:00 PM',
    '5:00 PM',
  ];

  const nightTimeSlots = [
    '6:00 PM',
    '7:00 PM',
    '8:00 PM',
    '9:00 PM',
    '10:00 PM',
    '11:00 PM',
    '12:00 AM',
    '1:00 AM',
  ];

  // Filter time slots based on worker shift
  const timeSlots = useMemo(() => {
    if (workerShift === 'night') {
      return nightTimeSlots;
    } else if (workerShift === 'flexible') {
      // Flexible shift workers can work both day and night
      return [...dayTimeSlots, ...nightTimeSlots];
    }
    return dayTimeSlots;
  }, [workerShift]);

  // Clear selected time if it's not available for the current shift
  useEffect(() => {
    if (selectedTime && !timeSlots.includes(selectedTime)) {
      setSelectedTime('');
    }
  }, [timeSlots, selectedTime]);

  // Add loading state for booking creation
  const isCreatingBooking = createBookingMutation.isPending;

  if (loading) {
    return (
      <div className='min-h-screen bg-gray-50 p-6 flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto'></div>
          <p className='mt-4 text-gray-600'>Loading worker details...</p>
        </div>
      </div>
    );
  }

  if (isError || !worker) {
    return (
      <div className='min-h-screen bg-gray-50 p-6 flex items-center justify-center'>
        <div className='text-center'>
          <p className='text-red-600 font-semibold'>
            Error loading worker details
          </p>
          <p className='text-gray-600 mt-2'>
            {queryError?.message || 'Something went wrong'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-50 p-6'>
      <div className='max-w-7xl mx-auto'>
        <div className='mb-8'>
          <button
            onClick={() => navigate(-1)}
            className='flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors cursor-pointer'>
            <ArrowLeft className='w-5 h-5' />
            Back to Workers
          </button>
          <h1 className='text-3xl font-bold text-gray-900'>Hire a Worker</h1>
          <p className='text-gray-600 mt-2'>
            Select multiple services and complete your booking
          </p>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6'>
          <div className='bg-white rounded-lg shadow-sm p-6'>
            <div className='flex items-center gap-3 mb-4'>
              <div className='w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center'>
                <CheckCircle className='w-6 h-6 text-purple-600' />
              </div>
              <h2 className='text-xl font-semibold text-gray-900'>
                Select Services
              </h2>
            </div>
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
                              handleSubcategorySelection(
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
                                      handleQuantityChange(
                                        sub.id,
                                        e.target.value
                                      )
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

          <div className='bg-white rounded-lg shadow-sm p-6'>
            <div className='flex items-center gap-3 mb-4'>
              <div className='w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center'>
                <CheckCircle className='w-6 h-6 text-blue-600' />
              </div>
              <h2 className='text-xl font-semibold text-gray-900'>
                Booking Summary
              </h2>
            </div>
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
                          Night Shift Charge (
                          {calculatePricing.shiftChargePercent}%):
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
        </div>

        <div className='bg-white rounded-lg shadow-sm p-6 mb-6'>
          <div className='flex items-center gap-3 mb-4'>
            <div className='w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center'>
              <User className='w-6 h-6 text-green-600' />
            </div>
            <h2 className='text-xl font-semibold text-gray-900'>
              Worker Details
            </h2>
          </div>
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
                  <span className='text-sm text-gray-600'>
                    Age: {worker.age}
                  </span>
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

        <div className='bg-white rounded-lg shadow-sm p-6 mb-6'>
          <div className='flex items-center gap-3 mb-4'>
            <div className='w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center'>
              <Calendar className='w-6 h-6 text-purple-600' />
            </div>
            <h2 className='text-xl font-semibold text-gray-900'>
              Schedule Your Time
            </h2>
          </div>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Select Date
              </label>
              <input
                type='date'
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none'
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Select Time Slot
                <span className='ml-2 text-xs text-gray-500'>
                  (
                  {workerShift === 'night'
                    ? 'Night'
                    : workerShift === 'flexible'
                    ? 'Flexible'
                    : 'Day'}{' '}
                  shift available)
                </span>
              </label>
              <div className='grid grid-cols-2 sm:grid-cols-4 gap-2'>
                {timeSlots.length > 0 ? (
                  timeSlots.map((time) => (
                    <button
                      key={time}
                      onClick={() => setSelectedTime(time)}
                      className={`px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${
                        selectedTime === time
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-blue-500'
                      }`}>
                      {time}
                    </button>
                  ))
                ) : (
                  <p className='text-sm text-gray-500 col-span-full'>
                    No time slots available for {workerShift} shift
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className='bg-white rounded-lg shadow-sm p-6'>
          <button
            onClick={handleConfirmBooking}
            className='w-full bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 transition-colors shadow-sm disabled:bg-gray-400 disabled:cursor-not-allowed'
            disabled={
              selectedSubcategories.length === 0 ||
              !selectedDate ||
              !selectedTime
            }>
            Confirm Booking ({selectedSubcategories.length} service
            {selectedSubcategories.length !== 1 ? 's' : ''})
          </button>
        </div>
      </div>

      {showPaymentModal && (
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
              <button
                onClick={() => setShowPaymentModal(false)}
                className='text-gray-400 hover:text-gray-600 transition-colors'
                disabled={isCreatingBooking}>
                <X className='w-6 h-6' />
              </button>
            </div>

            <div className='p-6 space-y-6'>
              <div className='bg-gray-50 rounded-lg p-4'>
                <h3 className='font-semibold text-gray-900 mb-3'>
                  Booking Details
                </h3>
                <div className='space-y-2 text-sm'>
                  <div className='flex justify-between'>
                    <span className='text-gray-600'>Worker:</span>
                    <span className='font-medium text-gray-900'>
                      {worker.name}
                    </span>
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
                          <p className='font-medium text-gray-900'>
                            {sub.name}
                          </p>
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
                        Night Shift Charge (
                        {calculatePricing.shiftChargePercent}%):
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
                <h3 className='font-semibold text-gray-900 mb-3'>
                  Payment Method
                </h3>
                <div className='space-y-2'>
                  <label className='flex items-center gap-3 p-3 border border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 transition-colors'>
                    <input
                      type='radio'
                      name='payment'
                      value='cash'
                      checked={paymentMethod === 'cash'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className='w-4 h-4 text-blue-600'
                    />
                    <div className='flex-1'>
                      <p className='font-medium text-gray-900'>
                        Cash on Service
                      </p>
                      <p className='text-xs text-gray-500'>
                        Pay when worker arrives
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              <div className='flex gap-3 pt-4'>
                <button
                  onClick={() => setShowPaymentModal(false)}
                  disabled={isCreatingBooking}
                  className='flex-1 px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'>
                  Cancel
                </button>
                <button
                  onClick={handlePayment}
                  disabled={isCreatingBooking}
                  className='flex-1 px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2'>
                  {isCreatingBooking ? (
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
      )}
    </div>
  );
}

export default HirePage;
