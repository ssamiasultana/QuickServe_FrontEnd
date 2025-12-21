import { Clock, DollarSign, Filter, Plus, Tag, X } from 'lucide-react';
import React, { useState } from 'react';
import { useGetSubServices } from '../../../hooks/useServiceCategory';
import { useGetServices } from '../../../hooks/useWorker';
import Service from '../../Service/Service';
import AddSubService from './AddSubService';

function Services() {
  const [selectedService, setSelectedService] = useState(null);
  const [priceFilter, setPriceFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: subserviceData = [] } = useGetSubServices();
  const { data: servicesData } = useGetServices();
  const services = Array.isArray(servicesData)
    ? servicesData
    : servicesData?.data || [];

  const filteredSubservices = subserviceData.filter((sub) => {
    const matchesService =
      !selectedService || sub.category.id === selectedService;
    const matchesPriceType =
      priceFilter === 'all' || sub.unit_type === priceFilter;
    return matchesService && matchesPriceType;
  });

  const handleServiceClick = (serviceId) => {
    setSelectedService(selectedService === serviceId ? null : serviceId);
  };

  const clearFilters = () => {
    setSelectedService(null);
    setPriceFilter('all');
  };

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Service Component Section */}
      <div className='bg-white'>
        <div className='max-w-7xl mx-auto px-6 py-6'>
          <Service
            selectedService={selectedService}
            onServiceSelect={handleServiceClick}
          />
        </div>
      </div>

      {/* Divider */}
      <div className='h-px bg-gray-200'></div>

      {/* Filter Section */}
      <div className='bg-white border-b border-gray-200'>
        <div className='max-w-7xl mx-auto px-6 py-4'>
          {/* Header with Add Button */}
          <div className='flex items-center justify-between mb-4'>
            <h2 className='text-2xl font-bold text-gray-900'>Sub Services</h2>
            <button
              onClick={() => setIsModalOpen(true)}
              className='flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors shadow-sm'>
              <Plus size={20} />
              <span>Add Sub Service</span>
            </button>
          </div>

          {/* Service Filter Chips */}
          <div className='flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide mb-3'>
            <span className='text-sm text-gray-600 font-medium whitespace-nowrap'>
              Filter:
            </span>
            <button
              onClick={clearFilters}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                !selectedService && priceFilter === 'all'
                  ? 'bg-gray-900 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}>
              All Services
            </button>
          </div>

          {/* Price Type Filter */}
          <div className='flex items-center gap-2'>
            <Filter size={16} className='text-gray-500' />
            <span className='text-sm text-gray-600 font-medium'>
              Price Type:
            </span>
            <div className='flex gap-2'>
              <button
                onClick={() => setPriceFilter('all')}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                  priceFilter === 'all'
                    ? 'bg-gray-900 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}>
                All
              </button>
              <button
                onClick={() => setPriceFilter('fixed')}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                  priceFilter === 'fixed'
                    ? 'bg-green-600 text-white'
                    : 'bg-white text-green-700 border border-green-300 hover:bg-green-50'
                }`}>
                Fixed
              </button>
              <button
                onClick={() => setPriceFilter('hourly')}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                  priceFilter === 'hourly'
                    ? 'bg-purple-600 text-white'
                    : 'bg-white text-purple-700 border border-purple-300 hover:bg-purple-50'
                }`}>
                Hourly
              </button>
            </div>
            {(selectedService || priceFilter !== 'all') && (
              <button
                onClick={clearFilters}
                className='ml-auto flex items-center gap-1 text-xs text-gray-600 hover:text-gray-900'>
                <X size={14} />
                Clear filters
              </button>
            )}
          </div>

          {/* Results Count */}
          <div className='mt-4'>
            <p className='text-sm text-gray-600'>
              Showing{' '}
              <span className='font-semibold text-gray-900'>
                {filteredSubservices.length}
              </span>{' '}
              of{' '}
              <span className='font-semibold text-gray-900'>
                {subserviceData.length}
              </span>{' '}
              sub services
            </p>
          </div>
        </div>
      </div>

      {/* Sub Services Cards Section */}
      <div className='max-w-7xl mx-auto px-6 py-6'>
        {filteredSubservices.length > 0 ? (
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3'>
            {filteredSubservices.map((subservice) => (
              <div
                key={subservice.id}
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
                  <div
                    className={`p-1 rounded ${
                      subservice.unit_type === 'fixed'
                        ? 'bg-green-50'
                        : 'bg-purple-50'
                    }`}>
                    {subservice.unit_type === 'fixed' ? (
                      <DollarSign size={14} className='text-green-600' />
                    ) : (
                      <Clock size={14} className='text-purple-600' />
                    )}
                  </div>
                </div>

                {/* Service Name */}
                <h3 className='text-sm font-semibold text-gray-900 mb-1 line-clamp-2'>
                  {subservice.name}
                </h3>

                {/* Category Tag */}
                <div className='flex items-center gap-1 mb-2'>
                  <Tag size={12} className='text-gray-400' />
                  <span className='text-xs text-gray-600'>
                    {subservice.category.name}
                  </span>
                </div>

                {/* Price */}
                <div className='flex items-baseline gap-1 pt-2 border-t border-gray-100'>
                  <span className='text-lg font-bold text-gray-900'>
                    ${parseFloat(subservice.base_price).toFixed(2)}
                  </span>
                  {subservice.unit_type === 'hourly' && (
                    <span className='text-xs text-gray-500'>/hr</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
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
              <button
                onClick={clearFilters}
                className='text-blue-600 hover:text-blue-700 text-sm font-medium'>
                Clear all filters
              </button>
            </div>
          </div>
        )}
      </div>

      <AddSubService
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        services={services}
      />
    </div>
  );
}

export default Services;
