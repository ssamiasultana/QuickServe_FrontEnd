import { Clock, Plus, X } from 'lucide-react';
import React, { useState } from 'react';
import { useCreateSubServices } from '../../../hooks/useServiceCategory';

// Taka Sign Icon Component
const TakaSignIcon = ({ size = 24, color = "currentColor", className, ...props }) => {
  return (
    <div
      className={className}
      style={{
        width: size,
        height: size,
        color: color,
        fontSize: size * 0.75,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: "bold",
      }}
      {...props}
    >
      ৳
    </div>
  );
};

function AddSubService({ isOpen, onClose, services = [] }) {
  const [formData, setFormData] = useState({
    service_id: '',
    name: '',
    base_price: '',
    unit_type: 'fixed',
  });
  const [errors, setErrors] = useState({});

  const createSubServiceMutation = useCreateSubServices();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async () => {
    try {
      await createSubServiceMutation.mutateAsync({
        ...formData,
        service_id: parseInt(formData.service_id),
        base_price: parseFloat(formData.base_price),
      });

      handleClose();
    } catch (error) {
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      }
    }
  };

  const handleClose = () => {
    if (!createSubServiceMutation.isPending) {
      resetForm();
      onClose();
    }
  };

  const resetForm = () => {
    setFormData({
      service_id: '',
      name: '',
      base_price: '',
      unit_type: 'fixed',
    });
    setErrors({});
  };

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4'>
      <div className='bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto'>
        {createSubServiceMutation.isPending && (
          <div className='absolute inset-0 bg-white bg-opacity-75 rounded-lg flex items-center justify-center z-10'>
            <div className='text-center'>
              <div className='w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4' />
              <p className='text-lg font-semibold text-gray-900'>
                Creating Sub Service...
              </p>
              <p className='text-sm text-gray-600 mt-1'>Please wait</p>
            </div>
          </div>
        )}

        {/* Header */}
        <div className='flex justify-between items-center p-6 border-b border-gray-200'>
          <div className='flex items-center gap-3'>
            <div className='bg-blue-100 p-2 rounded-lg'>
              <Plus className='text-blue-600' size={24} />
            </div>
            <h2 className='text-2xl font-bold text-gray-900'>
              Add Sub Service
            </h2>
          </div>
          <button
            onClick={handleClose}
            className='text-gray-400 hover:text-gray-600 transition-colors'>
            <X size={24} />
          </button>
        </div>

        {/* Form Content */}
        <div className='p-6 space-y-4'>
          {/* Service Selection */}
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              Service <span className='text-red-500'>*</span>
            </label>
            <select
              name='service_id'
              value={formData.service_id}
              onChange={handleInputChange}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.service_id ? 'border-red-500' : 'border-gray-300'
              }`}
              required>
              <option value=''>Select a service</option>
              {services.map((service) => (
                <option key={service.id} value={service.id}>
                  {service.name}
                </option>
              ))}
            </select>
            {errors.service_id && (
              <p className='text-red-500 text-sm mt-1'>
                {errors.service_id[0]}
              </p>
            )}
          </div>

          {/* Sub Service Name */}
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              Sub Service Name <span className='text-red-500'>*</span>
            </label>
            <input
              type='text'
              name='name'
              value={formData.name}
              onChange={handleInputChange}
              placeholder='e.g., House Cleaning, AC Installation'
              maxLength={255}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              required
            />
            {errors.name && (
              <p className='text-red-500 text-sm mt-1'>{errors.name[0]}</p>
            )}
          </div>

          {/* Base Price */}
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              Base Price <span className='text-red-500'>*</span>
            </label>
            <div className='relative'>
              <TakaSignIcon
                className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400'
                size={18}
              />
              <input
                type='number'
                name='base_price'
                value={formData.base_price}
                onChange={handleInputChange}
                placeholder='0.00'
                step='0.01'
                min='0'
                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.base_price ? 'border-red-500' : 'border-gray-300'
                }`}
                required
              />
            </div>
            {errors.base_price && (
              <p className='text-red-500 text-sm mt-1'>
                {errors.base_price[0]}
              </p>
            )}
          </div>

          {/* Unit Type */}
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              Pricing Type <span className='text-red-500'>*</span>
            </label>
            <div className='grid grid-cols-2 gap-3'>
              <button
                type='button'
                onClick={() =>
                  setFormData((prev) => ({ ...prev, unit_type: 'fixed' }))
                }
                className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-all ${
                  formData.unit_type === 'fixed'
                    ? 'border-green-600 bg-green-50 text-green-700'
                    : 'border-gray-300 hover:border-gray-400 text-gray-700'
                }`}>
                <TakaSignIcon size={18} />
                Fixed Price
              </button>
              <button
                type='button'
                onClick={() =>
                  setFormData((prev) => ({ ...prev, unit_type: 'hourly' }))
                }
                className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-all ${
                  formData.unit_type === 'hourly'
                    ? 'border-purple-600 bg-purple-50 text-purple-700'
                    : 'border-gray-300 hover:border-gray-400 text-gray-700'
                }`}>
                <Clock size={18} />
                Hourly Rate
              </button>
            </div>
            {errors.unit_type && (
              <p className='text-red-500 text-sm mt-1'>{errors.unit_type[0]}</p>
            )}
          </div>

          {/* Preview */}
          {formData.name && formData.base_price && (
            <div className='bg-gray-50 rounded-lg p-4 border border-gray-200'>
              <p className='text-sm text-gray-600 mb-2'>Preview:</p>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='font-semibold text-gray-900'>{formData.name}</p>
                  <p className='text-xs text-gray-600'>
                    {services.find(
                      (s) => s.id === parseInt(formData.service_id)
                    )?.name || 'No service selected'}
                  </p>
                </div>
                <div className='text-right'>
                  <p className='text-lg font-bold text-gray-900'>
                    ${parseFloat(formData.base_price || 0).toFixed(2)}
                  </p>
                  {formData.unit_type === 'hourly' && (
                    <p className='text-xs text-gray-600'>/hour</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className='flex gap-3 p-6 border-t border-gray-200'>
          <button
            type='button'
            onClick={handleClose}
            disabled={createSubServiceMutation.isPending}
            className='flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'>
            Cancel
          </button>
          <button
            type='button'
            onClick={handleSubmit}
            disabled={
              createSubServiceMutation.isPending ||
              !formData.service_id ||
              !formData.name ||
              !formData.base_price
            }
            className='flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'>
            {createSubServiceMutation.isPending ? (
              <>
                <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin' />
                Creating...
              </>
            ) : (
              <>
                <Plus size={18} />
                Create Sub Service
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default AddSubService;
