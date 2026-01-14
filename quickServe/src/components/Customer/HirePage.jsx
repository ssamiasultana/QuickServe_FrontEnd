import { useQueries } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import React, { useContext, useEffect, useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useNavigate, useParams } from 'react-router';
import { useGetSingleWorker } from '../../hooks/useWorker';
import workerService from '../../services/workerService';
import { AuthContext } from '../Context/AuthContext';
import BookingSummary from './HirePage/BookingSummary';
import CustomerInformationForm from './HirePage/CustomerInformationForm';
import ScheduleSection from './HirePage/ScheduleSection';
import ServiceSelection from './HirePage/ServiceSelection';
import WorkerDetailsCard from './HirePage/WorkerDetailsCard';

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

  // User information fields
  const [customerName, setCustomerName] = useState(user?.name || '');
  const [customerEmail, setCustomerEmail] = useState(user?.email || '');
  const [customerPhone, setCustomerPhone] = useState(user?.phone || '');
  const [customerAddress, setCustomerAddress] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');

  const customerId = user?.id;

  const handleSubcategorySelection = (
    subcategoryId,
    subcategory,
    isChecked,
    serviceId
  ) => {
    if (isChecked) {
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

  // Get worker shift with validation
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
    return 'day';
  };

  const workerShift = getWorkerShift();

  // Calculate pricing with quantity multiplied
  const calculatePricing = useMemo(() => {
    let sumOfUnitPrices = 0;

    selectedSubcategories.forEach((sub) => {
      const price = parseFloat(sub.base_price) || 0;
      const qty = quantities[sub.id] || 1;
      sumOfUnitPrices += price * qty;
    });

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

  const getServiceIdForSubcategory = (subcategoryId) => {
    const parentEntry = serviceSubcategories.find((item) =>
      item.subcategories?.data?.some((sub) => sub.id === subcategoryId)
    );
    return parentEntry?.serviceId || services[0]?.id;
  };

  const convertTo24Hour = (time12h) => {
    if (!time12h) return '09:00:00';

    // Handle different time formats
    // Expected format: "9:00 AM" or "09:00 AM"
    const trimmed = time12h.trim().toUpperCase();
    
    // Extract AM/PM
    const periodMatch = trimmed.match(/\s*(AM|PM)\s*$/);
    if (!periodMatch) {
      console.warn('Invalid time format:', time12h);
      return '09:00:00';
    }
    
    const period = periodMatch[1];
    const timePart = trimmed.replace(/\s*(AM|PM)\s*$/, '').trim();
    
    // Split hours and minutes
    const [hoursStr, minutesStr = '00'] = timePart.split(':');
    let hours = parseInt(hoursStr, 10);
    const minutes = minutesStr || '00';

    // Validate hours
    if (isNaN(hours) || hours < 1 || hours > 12) {
      console.warn('Invalid hours in time:', time12h);
      return '09:00:00';
    }

    // Convert to 24-hour format
    if (period === 'PM') {
      if (hours !== 12) {
        hours = hours + 12;
      }
      // 12 PM stays as 12 (noon)
    } else if (period === 'AM') {
      if (hours === 12) {
        hours = 0; // 12 AM becomes 00 (midnight)
      }
      // Other AM times stay as-is
    }

    // Format with leading zeros
    const formattedHours = hours.toString().padStart(2, '0');
    const formattedMinutes = minutes.padStart(2, '0');
    
    return `${formattedHours}:${formattedMinutes}:00`;
  };

  const buildScheduledAt = () => {
    if (!selectedDate || !selectedTime) return null;
    
    // Ensure date is in YYYY-MM-DD format
    let dateStr = selectedDate;
    if (dateStr.includes('T')) {
      dateStr = dateStr.split('T')[0];
    }
    
    // Convert time to 24-hour format
    const timeStr = convertTo24Hour(selectedTime);
    
    // Debug log to verify conversion (can be removed after testing)
    console.log('Time conversion debug:', {
      selectedTime,
      convertedTime: timeStr,
      dateStr,
      final: `${dateStr}T${timeStr}`
    });
    
    // Format: YYYY-MM-DDTHH:mm:ss (ISO 8601 format without timezone)
    // Laravel will handle timezone conversion
    return `${dateStr}T${timeStr}`;
  };

  const handleConfirmBooking = () => {
    if (!customerId) {
      toast.error('Please login to book services');
      return;
    }

    if (selectedSubcategories.length === 0 || !selectedDate || !selectedTime) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Validate user information fields
    if (!customerName.trim()) {
      toast.error('Please enter your name');
      return;
    }
    if (!customerEmail.trim()) {
      toast.error('Please enter your email');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customerEmail.trim())) {
      toast.error('Please enter a valid email address');
      return;
    }
    if (!customerPhone.trim()) {
      toast.error('Please enter your phone number');
      return;
    }
    const phoneRegex = /^\d{10,15}$/;
    if (!phoneRegex.test(customerPhone.trim().replace(/\D/g, ''))) {
      toast.error('Please enter a valid phone number (10-15 digits)');
      return;
    }
    if (!customerAddress.trim()) {
      toast.error('Please enter your address for service delivery');
      return;
    }

    // Prepare booking data for navigation
    // Check if all selected services have the same quantity
    const selectedQuantities = selectedSubcategories.map(
      (sub) => quantities[sub.id] || 1
    );
    const uniqueQuantities = new Set(selectedQuantities);

    // If quantities differ, automatically sync them to the first quantity
    let bookingQuantity;
    if (uniqueQuantities.size > 1) {
      const firstQuantity = selectedQuantities[0] || 1;
      // Sync all quantities to the first one
      const syncedQuantities = { ...quantities };
      selectedSubcategories.forEach((sub) => {
        syncedQuantities[sub.id] = firstQuantity;
      });
      setQuantities(syncedQuantities);
      toast.success(
        `All quantities synced to ${firstQuantity}. You can proceed with booking.`
      );
      bookingQuantity = firstQuantity;
    } else {
      bookingQuantity = selectedQuantities[0] || 1;
    }

    const servicesData = selectedSubcategories.map((sub) => ({
      service_id: sub.service_id || getServiceIdForSubcategory(sub.id),
      service_subcategory_id: sub.id,
    }));

    if (servicesData.some((service) => !service.service_id)) {
      toast.error('Missing service information. Please reselect services.');
      return;
    }

    // Navigate to payment confirmation page with booking data
    navigate('/customer/payment-confirmation', {
      state: {
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
        buildScheduledAt: buildScheduledAt(),
      },
    });
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

  // Update user information when user context changes
  useEffect(() => {
    if (user) {
      setCustomerName(user.name || '');
      setCustomerEmail(user.email || '');
      setCustomerPhone(user.phone || '');
    }
  }, [user]);

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
          <ServiceSelection
            serviceSubcategories={serviceSubcategories}
            isLoadingSubcategories={isLoadingSubcategories}
            selectedSubcategories={selectedSubcategories}
            quantities={quantities}
            onSubcategorySelection={handleSubcategorySelection}
            onQuantityChange={handleQuantityChange}
          />

          <BookingSummary
            selectedSubcategories={selectedSubcategories}
            quantities={quantities}
            calculatePricing={calculatePricing}
          />
        </div>

        <WorkerDetailsCard
          worker={worker}
          workerShift={workerShift}
          services={services}
        />

        <CustomerInformationForm
          customerName={customerName}
          customerEmail={customerEmail}
          customerPhone={customerPhone}
          customerAddress={customerAddress}
          specialInstructions={specialInstructions}
          onNameChange={setCustomerName}
          onEmailChange={setCustomerEmail}
          onPhoneChange={setCustomerPhone}
          onAddressChange={setCustomerAddress}
          onInstructionsChange={setSpecialInstructions}
        />

        <ScheduleSection
          selectedDate={selectedDate}
          selectedTime={selectedTime}
          timeSlots={timeSlots}
          workerShift={workerShift}
          onDateChange={setSelectedDate}
          onTimeChange={setSelectedTime}
        />

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
    </div>
  );
}

export default HirePage;
