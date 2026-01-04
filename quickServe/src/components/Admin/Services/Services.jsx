import { Filter, Plus, X } from 'lucide-react';
import React, { use, useState } from 'react';
import { useGetSubServices } from '../../../hooks/useServiceCategory';
import { useGetServices } from '../../../hooks/useWorker';
import { AuthContext } from '../../Context/AuthContext';
import Service from '../../Service/Service';
import AddSubService from './AddSubService';
import SubServices from './Subservices';

function Services() {
  const { user } = use(AuthContext);
  const isAdmin = user?.role === 'Admin';

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

  const handleSubServiceClick = (subservice) => {
    console.log('SubService clicked:', subservice);
    // Add your logic here (e.g., navigate to detail page, open modal, etc.)
  };

  const clearFilters = () => {
    setSelectedService(null);
    setPriceFilter('all');
  };

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Filters Section */}
      <div className='bg-white border-b border-gray-200'>
        <div className='max-w-7xl mx-auto px-6 py-4'>
          {/* Service Filter */}
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

      {/* Service Selection Section */}
      <div className='bg-white'>
        <div className='max-w-7xl mx-auto px-6 py-6'>
          <Service
            isAdmin={isAdmin}
            selectedService={selectedService}
            onServiceSelect={handleServiceClick}
          />
        </div>
      </div>

      {/* Divider */}
      <div className='h-px bg-gray-200'></div>

      {/* Sub Services Cards Section */}
      <div className='max-w-7xl mx-auto px-6 py-6'>
        <div className='flex items-center justify-between mb-4'>
          <h2 className='text-2xl font-bold text-gray-900'>Sub Services</h2>
          {isAdmin && (
            <button
              onClick={() => setIsModalOpen(true)}
              className='flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors shadow-sm'>
              <Plus size={20} />
              <span>Add Sub Service</span>
            </button>
          )}
        </div>

        {/* Reusable SubServices Component */}
        <SubServices
          subservices={filteredSubservices}
          onSubServiceClick={handleSubServiceClick}
          onClearFilters={clearFilters}
          showEmptyState={true}
        />
      </div>

      {/* Add SubService Modal */}
      <AddSubService
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        services={services}
      />
    </div>
  );
}

export default Services;
