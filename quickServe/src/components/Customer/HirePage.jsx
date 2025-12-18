import { useQueries } from '@tanstack/react-query';
import { ArrowLeft, Calendar, CheckCircle, User } from 'lucide-react';
import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useGetSingleWorker } from '../../hooks/useWorker';
import workerService from '../../services/workerService';

function HirePage() {
  const params = useParams();
  const navigate = useNavigate();
  const id = params.id;

  const {
    data: worker,
    isLoading: loading,
    isError,
    error: queryError,
  } = useGetSingleWorker(id);

  const [selectedServices, setSelectedServices] = useState([]);
  const [selectedSubcategories, setSelectedSubcategories] = useState({});
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');

  const handleServiceSelection = (serviceId, isChecked) => {
    if (isChecked) {
      setSelectedServices([...selectedServices, serviceId]);
    } else {
      setSelectedServices(selectedServices.filter((id) => id !== serviceId));
      // Remove subcategories for this service
      const newSubcategories = { ...selectedSubcategories };
      delete newSubcategories[serviceId];
      setSelectedSubcategories(newSubcategories);
    }
  };

  const handleSubcategorySelection = (serviceId, subcategoryId, isChecked) => {
    setSelectedSubcategories((prev) => {
      const serviceSubcats = prev[serviceId] || [];
      if (isChecked) {
        return {
          ...prev,
          [serviceId]: [...serviceSubcats, subcategoryId],
        };
      } else {
        return {
          ...prev,
          [serviceId]: serviceSubcats.filter((id) => id !== subcategoryId),
        };
      }
    });
  };

  // Get services from the new relationship structure
  const getServices = () => {
    if (!worker || !worker.services) return [];
    return Array.isArray(worker.services) ? worker.services : [];
  };

  // Get expertise ratings
  const getExpertiseRatings = () => {
    if (!worker || !worker.expertise_of_service) return [];
    return Array.isArray(worker.expertise_of_service)
      ? worker.expertise_of_service
      : [];
  };

  const services = getServices();
  const expertiseRatings = getExpertiseRatings();

  // Fetch subcategories for all services using useQueries - FIXED TYPOS
  const subcategoryQueries = useQueries({
    queries: services.map((service) => ({
      queryKey: ['serviceCategory', service.id],
      queryFn: async () => {
        const response = await workerService.getServicecategoryById(service.id);
        console.log(response);
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

  // Get subcategories data
  const serviceSubcategories = subcategoryQueries
    .filter((query) => query.data)
    .map((query) => query.data);

  const result = serviceSubcategories.flatMap((item) =>
    item.subcategories.data.map((sub) => ({
      name: sub.name,
      base_price: sub.base_price,
    }))
  );

  const timeSlots = [
    '9:00 AM',
    '10:00 AM',
    '11:00 AM',
    '12:00 PM',
    '2:00 PM',
    '3:00 PM',
    '4:00 PM',
    '5:00 PM',
  ];

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
        {/* Header */}
        <div className='mb-8'>
          <button
            onClick={() => navigate(-1)}
            className='flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors'>
            <ArrowLeft className='w-5 h-5' />
            Back to Workers
          </button>
          <h1 className='text-3xl font-bold text-gray-900'>Hire a Worker</h1>
          <p className='text-gray-600 mt-2'>
            Complete the form below to book your service
          </p>
        </div>

        {/* Service Selection and Service Details */}
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6'>
          {/* Service Selection */}
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
                Choose one or more services you need:
              </p>

              {isLoadingSubcategories && (
                <div className='text-center py-4'>
                  <div className='animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600 mx-auto'></div>
                  <p className='text-sm text-gray-500 mt-2'>
                    Loading subcategories...
                  </p>
                </div>
              )}

              <div className='space-y-2'>
                {serviceSubcategories.map((item) =>
                  item.subcategories.data.map((sub) => (
                    <label
                      key={sub.id}
                      className='flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all'>
                      <input
                        type='checkbox'
                        className='w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500'
                        value={sub.id}
                        // checked={selectedSubcategories.includes(sub.id)}
                        onChange={(e) =>
                          handleSubcategorySelection(sub.id, e.target.checked)
                        }
                      />
                      <div className='flex-1'>
                        <div className='flex items-center justify-between'>
                          <span className='font-medium text-gray-900'>
                            {sub.name}
                          </span>
                          {sub.base_price && (
                            <span className='text-sm font-semibold text-green-600'>
                              ${sub.base_price} ({sub.unit_type})
                            </span>
                          )}
                        </div>
                        <p className='text-xs text-gray-500 mt-1'>
                          Part of {item.serviceName} service
                        </p>
                      </div>
                    </label>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Service Details */}
          <div className='bg-white rounded-lg shadow-sm p-6'>
            <div className='flex items-center gap-3 mb-4'>
              <div className='w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center'>
                <CheckCircle className='w-6 h-6 text-blue-600' />
              </div>
              <h2 className='text-xl font-semibold text-gray-900'>
                Service Details
              </h2>
            </div>
            <div className='space-y-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  What You Get:
                </label>
                <ul className='space-y-2'>
                  <li className='flex items-start gap-2 text-gray-700'>
                    <span className='text-blue-600 font-bold mt-1'>•</span>
                    <span className='text-sm'>
                      Professional and experienced workers
                    </span>
                  </li>
                  <li className='flex items-start gap-2 text-gray-700'>
                    <span className='text-blue-600 font-bold mt-1'>•</span>
                    <span className='text-sm'>Quality guaranteed service</span>
                  </li>
                  <li className='flex items-start gap-2 text-gray-700'>
                    <span className='text-blue-600 font-bold mt-1'>•</span>
                    <span className='text-sm'>Flexible scheduling options</span>
                  </li>
                  <li className='flex items-start gap-2 text-gray-700'>
                    <span className='text-blue-600 font-bold mt-1'>•</span>
                    <span className='text-sm'>
                      Transparent pricing with no hidden fees
                    </span>
                  </li>
                  <li className='flex items-start gap-2 text-gray-700'>
                    <span className='text-blue-600 font-bold mt-1'>•</span>
                    <span className='text-sm'>
                      Customer satisfaction guarantee
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Worker Details - Full Width */}
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
              <div className='w-20 h-20 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden'>
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
              <div>
                <h4 className='text-sm font-semibold text-gray-900 mb-2'>
                  Feedback
                </h4>
                <p className='text-sm text-gray-600'>
                  {worker.feedback || 'No feedback available'}
                </p>
              </div>
              <div>
                <h4 className='text-sm font-semibold text-gray-900 mb-2'>
                  Availability Status
                </h4>
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                    worker.is_active
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                  }`}>
                  {worker.is_active ? 'Available' : 'Not Available'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Schedule Time */}
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
              </label>
              <div className='grid grid-cols-2 sm:grid-cols-4 gap-2'>
                {timeSlots.map((time) => (
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
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Booking Button */}
        <div className='bg-white rounded-lg shadow-sm p-6'>
          <button
            className='w-full bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 transition-colors shadow-sm disabled:bg-gray-400 disabled:cursor-not-allowed'
            disabled={
              selectedServices.length === 0 || !selectedDate || !selectedTime
            }>
            Confirm Booking
          </button>
        </div>
      </div>
    </div>
  );
}

export default HirePage;
