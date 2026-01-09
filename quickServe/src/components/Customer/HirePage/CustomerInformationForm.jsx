import { User } from 'lucide-react';
import React from 'react';
import SectionHeader from './SectionHeader';

const CustomerInformationForm = ({
  customerName,
  customerEmail,
  customerPhone,
  customerAddress,
  specialInstructions,
  onNameChange,
  onEmailChange,
  onPhoneChange,
  onAddressChange,
  onInstructionsChange,
}) => {
  return (
    <div className='bg-white rounded-lg shadow-sm p-6 mb-6'>
      <SectionHeader
        icon={User}
        title='Your Information'
        iconBgColor='bg-orange-100'
        iconColor='text-orange-600'
      />
      <div className='space-y-4'>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              Full Name <span className='text-red-500'>*</span>
            </label>
            <input
              type='text'
              value={customerName}
              onChange={(e) => onNameChange(e.target.value)}
              placeholder='Enter your full name'
              className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none'
              required
            />
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              Email <span className='text-red-500'>*</span>
            </label>
            <input
              type='email'
              value={customerEmail}
              onChange={(e) => onEmailChange(e.target.value)}
              placeholder='Enter your email address'
              className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none'
              required
            />
          </div>
        </div>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              Phone Number <span className='text-red-500'>*</span>
            </label>
            <input
              type='tel'
              value={customerPhone}
              onChange={(e) => onPhoneChange(e.target.value)}
              placeholder='Enter your phone number'
              className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none'
              required
            />
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              Service Address <span className='text-red-500'>*</span>
            </label>
            <input
              type='text'
              value={customerAddress}
              onChange={(e) => onAddressChange(e.target.value)}
              placeholder='Enter service delivery address'
              className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none'
              required
            />
          </div>
        </div>
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-2'>
            Special Instructions (Optional)
          </label>
          <textarea
            value={specialInstructions}
            onChange={(e) => onInstructionsChange(e.target.value)}
            placeholder='Any special instructions or notes for the worker...'
            rows={3}
            className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none'
          />
          <p className='text-xs text-gray-500 mt-1'>
            Provide any additional details about the service location or
            requirements
          </p>
        </div>
      </div>
    </div>
  );
};

export default CustomerInformationForm;
