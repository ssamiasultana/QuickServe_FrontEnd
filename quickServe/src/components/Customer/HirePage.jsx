import {
  ArrowLeft,
  Calendar,
  CheckCircle,
  DollarSign,
  User,
} from 'lucide-react';
import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useGetSingleWorker } from '../../hooks/useWorker';

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
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');

  const handleServiceSelection = (serviceId, isChecked) => {
    if (isChecked) {
      setSelectedServices([...selectedServices, serviceId]);
    } else {
      setSelectedServices(selectedServices.filter((id) => id !== serviceId));
    }
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

  const serviceFeatures = [
    'Professional and experienced workers',
    'Quality guaranteed service',
    'Flexible scheduling options',
    'Transparent pricing with no hidden fees',
    'Customer satisfaction guarantee',
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
              <div className='space-y-3'>
                {services.length > 0 ? (
                  services.map((service, index) => {
                    const rating = expertiseRatings[index];
                    return (
                      <label
                        key={service.id}
                        className='flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-purple-500 hover:bg-purple-50 transition-all'>
                        <input
                          type='checkbox'
                          className='w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500'
                          value={service.id}
                          checked={selectedServices.includes(service.id)}
                          onChange={(e) =>
                            handleServiceSelection(service.id, e.target.checked)
                          }
                        />
                        <div className='flex-1'>
                          <div className='flex items-center justify-between'>
                            <span className='font-medium text-gray-900'>
                              {service.name}
                            </span>
                            {rating !== undefined && (
                              <span className='text-sm font-semibold text-purple-600'>
                                Expertise: {rating}/5
                              </span>
                            )}
                          </div>
                        </div>
                      </label>
                    );
                  })
                ) : (
                  <p className='text-sm text-gray-500 text-center py-4'>
                    No services available
                  </p>
                )}
              </div>

              {/* Selected Services Summary */}
              <div className='mt-4 pt-4 border-t border-gray-200'>
                <h4 className='text-sm font-semibold text-gray-900 mb-2'>
                  Selected Services
                </h4>
                <div className='flex flex-wrap gap-2'>
                  {selectedServices.length > 0 ? (
                    selectedServices.map((serviceId) => {
                      const service = services.find((s) => s.id === serviceId);
                      return service ? (
                        <span
                          key={serviceId}
                          className='px-3 py-1 bg-purple-100 text-purple-700 text-xs rounded-full font-medium'>
                          {service.name}
                        </span>
                      ) : null;
                    })
                  ) : (
                    <span className='text-sm text-gray-500'>
                      No services selected yet
                    </span>
                  )}
                </div>
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
                  {serviceFeatures.map((feature, index) => (
                    <li
                      key={index}
                      className='flex items-start gap-2 text-gray-700'>
                      <span className='text-blue-600 font-bold mt-1'>•</span>
                      <span className='text-sm'>{feature}</span>
                    </li>
                  ))}
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

        {/* Schedule Time and Submit Details */}
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6'>
          {/* Schedule Time */}
          <div className='bg-white rounded-lg shadow-sm p-6'>
            <div className='flex items-center gap-3 mb-4'>
              <div className='w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center'>
                <Calendar className='w-6 h-6 text-purple-600' />
              </div>
              <h2 className='text-xl font-semibold text-gray-900'>
                Schedule Your Time
              </h2>
            </div>
            <div className='space-y-4'>
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
                <div className='grid grid-cols-2 sm:grid-cols-3 gap-2'>
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

          {/* Submit Details */}
          <div className='bg-white rounded-lg shadow-sm p-6'>
            <div className='flex items-center gap-3 mb-4'>
              <div className='w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center'>
                <User className='w-6 h-6 text-indigo-600' />
              </div>
              <h2 className='text-xl font-semibold text-gray-900'>
                Submit Your Details
              </h2>
            </div>
            <div className='space-y-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Full Name
                </label>
                <input
                  type='text'
                  placeholder='Enter your name'
                  className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none'
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Phone Number
                </label>
                <input
                  type='tel'
                  placeholder='Enter your phone'
                  className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none'
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Service Address
                </label>
                <input
                  type='text'
                  placeholder='Enter complete address'
                  className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none'
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Additional Notes
                </label>
                <textarea
                  rows='2'
                  placeholder='Any special instructions...'
                  className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none'
                />
              </div>
            </div>
          </div>
        </div>

        {/* Payment Details */}
        <div className='bg-white rounded-lg shadow-sm p-6'>
          <div className='flex items-center gap-3 mb-6'>
            <div className='w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center'>
              <DollarSign className='w-6 h-6 text-orange-600' />
            </div>
            <h2 className='text-xl font-semibold text-gray-900'>
              Payment Details
            </h2>
          </div>

          <div className='max-w-2xl mx-auto'>
            <div className='space-y-3 mb-6'>
              <div className='flex justify-between py-2 border-b border-gray-200'>
                <span className='text-gray-600'>Service Rate</span>
                <span className='font-semibold text-gray-900'>$50/hr</span>
              </div>
              <div className='flex justify-between py-2 border-b border-gray-200'>
                <span className='text-gray-600'>Estimated Duration</span>
                <span className='font-semibold text-gray-900'>2 hours</span>
              </div>
              <div className='flex justify-between py-2 border-b border-gray-200'>
                <span className='text-gray-600'>Service Fee</span>
                <span className='font-semibold text-gray-900'>$5</span>
              </div>
              <div className='flex justify-between py-3 bg-blue-50 px-4 rounded-lg'>
                <span className='font-semibold text-gray-900'>
                  Total Amount
                </span>
                <span className='font-bold text-blue-600 text-xl'>$105</span>
              </div>
            </div>

            <div className='flex items-start gap-3 mb-4'>
              <input
                type='checkbox'
                id='terms'
                className='mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500'
              />
              <label htmlFor='terms' className='text-sm text-gray-600'>
                I agree to the terms and conditions and understand that payment
                will be processed after service completion
              </label>
            </div>

            <button
              className='w-full bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 transition-colors shadow-sm'
              disabled={
                selectedServices.length === 0 || !selectedDate || !selectedTime
              }>
              Confirm Booking
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HirePage;
