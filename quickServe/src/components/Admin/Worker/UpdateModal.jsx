import { Edit } from 'lucide-react';
import { useActionState, useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { useGetServices } from '../../../hooks/useWorker';
import { uploadImageToCloudinary } from '../../../utils/cloudinaryUpload';
import { SHIFT_OPTIONS } from '../../../utils/constants';
import { updateWorkerData } from '../../../utils/workerAction';
import { FormCheckboxGroup } from '../../ui/FormCheckbox';
import { FormInput } from '../../ui/FormInput';
import { FormSelect } from '../../ui/FormSelect';
import Modal from '../../ui/Modal';
import Rating from '../../ui/Rating';

function UpdateModal({ editModal, setEditModal, onWorkerUpdate }) {
  const { data: servicesData } = useGetServices();
  const services = Array.isArray(servicesData)
    ? servicesData
    : servicesData?.data || [];
  const [selectedServices, setSelectedServices] = useState([]);
  const [serviceRatings, setServiceRatings] = useState({});

  // NID image upload states
  const [nidFrontPreview, setNidFrontPreview] = useState(null);
  const [nidBackPreview, setNidBackPreview] = useState(null);
  const [nidFrontUrl, setNidFrontUrl] = useState(null);
  const [nidBackUrl, setNidBackUrl] = useState(null);
  const [uploadingNidFront, setUploadingNidFront] = useState(false);
  const [uploadingNidBack, setUploadingNidBack] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    age: '',
    nid: '',
    shift: '',
    rating: 0,
    feedback: '',
    imageUrl: '',
    is_active: '',
    nid_front_image: '',
    nid_back_image: '',
  });

  const [state, formAction, isPending] = useActionState(updateWorkerData, {
    success: false,
    message: '',
    errors: {},
    data: null,
  });
  const toastShownRef = useRef(false);
  const previousStateRef = useRef(null);

  useEffect(() => {
    if (editModal.open && editModal.worker) {
      const worker = editModal.worker;

      let serviceIds = [];
      let expertiseOfService = [];
      if (worker.services && Array.isArray(worker.services)) {
        serviceIds = worker.services.map((service) => service.id);

        if (worker.expertise_of_service) {
          try {
            const ratings =
              typeof worker.expertise_of_service === 'string'
                ? JSON.parse(worker.expertise_of_service)
                : worker.expertise_of_service;

            if (Array.isArray(ratings)) {
              expertiseOfService = ratings;
            }
          } catch (error) {
            console.error('Error parsing expertise_of_service:', error);
          }
        }
      }

      setFormData({
        name: worker.name || '',
        email: worker.email || '',
        phone: worker.phone || '',
        age: worker.age || '',
        nid: worker.nid || '',
        shift: worker.shift || '',
        rating: worker.rating || 0,
        feedback: worker.feedback || '',
        imageUrl: worker.image || '',
        is_active: Boolean(worker.is_active),
        nid_front_image: worker.nid_front_image || '',
        nid_back_image: worker.nid_back_image || '',
      });

      // Set NID image previews
      if (worker.nid_front_image) {
        setNidFrontPreview(worker.nid_front_image);
        setNidFrontUrl(worker.nid_front_image);
      }
      if (worker.nid_back_image) {
        setNidBackPreview(worker.nid_back_image);
        setNidBackUrl(worker.nid_back_image);
      }

      setSelectedServices(serviceIds);
      const ratingsObj = {};
      serviceIds.forEach((serviceId, index) => {
        ratingsObj[serviceId] = expertiseOfService[index] || 0;
      });
      setServiceRatings(ratingsObj);

      // Reset toast tracking when modal opens
      toastShownRef.current = false;
      previousStateRef.current = null;
    }
  }, [editModal.open, editModal.worker]);

  useEffect(() => {
    // Only process if we have state data
    if (!state) return;

    // Create a unique identifier for this state update
    const stateIdentifier = JSON.stringify({
      success: state.success,
      message: state.message,
    });

    // Skip if we've already processed this exact state
    if (previousStateRef.current === stateIdentifier) {
      return;
    }

    // Skip if toast was already shown for a success state
    if (state.success && toastShownRef.current) {
      return;
    }

    // Mark this state as processed
    previousStateRef.current = stateIdentifier;

    if (state.success) {
      // Mark toast as shown before displaying it
      toastShownRef.current = true;

      toast.success(state.message || 'Worker updated successfully!');
      setEditModal({ open: false, worker: null });

      if (onWorkerUpdate) {
        onWorkerUpdate();
      }
    } else if (state.message && !state.success) {
      toast.error(state.message);
    }
  }, [state, setEditModal, onWorkerUpdate]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    console.log('Input change:', { name, value, type, checked });
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleNidImageChange = async (event, side) => {
    const file = event.currentTarget.files[0];
    if (file) {
      const validateTypes = [
        'image/jpeg',
        'image/png',
        'image/jpg',
        'image/gif',
        'image/webp',
      ];
      if (!validateTypes.includes(file.type)) {
        toast.error('Please select a valid image file (JPEG, PNG, GIF, WEBP)');
        event.target.value = '';
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Image size should be less than 2MB');
        event.target.value = '';
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        if (side === 'front') {
          setNidFrontPreview(reader.result);
        } else {
          setNidBackPreview(reader.result);
        }
      };
      reader.readAsDataURL(file);

      if (side === 'front') {
        setUploadingNidFront(true);
      } else {
        setUploadingNidBack(true);
      }

      try {
        const url = await uploadImageToCloudinary(file);
        if (side === 'front') {
          setNidFrontUrl(url);
          setFormData((prev) => ({ ...prev, nid_front_image: url }));
        } else {
          setNidBackUrl(url);
          setFormData((prev) => ({ ...prev, nid_back_image: url }));
        }
        toast.success(`NID ${side} image uploaded successfully`);
      } catch (error) {
        toast.error(`Failed to upload NID ${side} image: ${error.message}`);
        event.target.value = '';
        if (side === 'front') {
          setNidFrontPreview(null);
          setNidFrontUrl(null);
          setFormData((prev) => ({ ...prev, nid_front_image: '' }));
        } else {
          setNidBackPreview(null);
          setNidBackUrl(null);
          setFormData((prev) => ({ ...prev, nid_back_image: '' }));
        }
      } finally {
        if (side === 'front') {
          setUploadingNidFront(false);
        } else {
          setUploadingNidBack(false);
        }
      }
    }
  };

  const handleServiceChange = (serviceId, isChecked) => {
    if (isChecked) {
      setSelectedServices([...selectedServices, serviceId]);
      setServiceRatings({
        ...serviceRatings,
        [serviceId]: serviceRatings[serviceId] || 0,
      });
    } else {
      setSelectedServices(selectedServices.filter((id) => id !== serviceId));
      const newRatings = { ...serviceRatings };
      delete newRatings[serviceId];
      setServiceRatings(newRatings);
    }
  };

  const handleRatingChange = (serviceId, rating) => {
    setServiceRatings({ ...serviceRatings, [serviceId]: rating });
  };

  const handleClose = () => {
    setEditModal({ open: false, worker: null });
  };

  const renderHiddenInputs = () => {
    return (
      <>
        <input type='hidden' name='id' value={editModal.worker?.id || ''} />
        <input type='hidden' name='imageUrl' value={formData.imageUrl || ''} />
        <input type='hidden' name='rating' value={formData.rating || 0} />
        <input type='hidden' name='nid_front_image' value={nidFrontUrl || ''} />
        <input type='hidden' name='nid_back_image' value={nidBackUrl || ''} />

        {/* Always send is_active value - critical for preventing unwanted changes */}
        <input
          type='hidden'
          name='is_active'
          value={formData.is_active ? 1 : 0}
        />

        {/* Send service_ids */}
        {selectedServices.map((serviceId) => (
          <input
            key={`service_${serviceId}`}
            type='hidden'
            name='service_ids[]'
            value={serviceId}
          />
        ))}

        {/* Send expertise_of_service */}
        {selectedServices.map((serviceId) => (
          <input
            key={`expertise_${serviceId}`}
            type='hidden'
            name='expertise_of_service[]'
            value={serviceRatings[serviceId] || 0}
          />
        ))}
      </>
    );
  };

  const handleServiceCheckbox = (service, isChecked) => {
    handleServiceChange(service.id, isChecked);
  };

  return (
    <Modal
      isOpen={editModal.open}
      onClose={handleClose}
      title='Edit Worker'
      icon={Edit}
      size='2xl'
      className='max-h-[90vh]'
      footer={
        <>
          <button
            onClick={handleClose}
            disabled={isPending}
            type='button'
            className='px-4 py-2 text-sm border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50'>
            Cancel
          </button>
          <button
            type='submit'
            form='update-worker-form'
            disabled={isPending}
            className='px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50'>
            {isPending ? 'Updating...' : 'Update'}
          </button>
        </>
      }>
      <form
        id='update-worker-form'
        action={formAction}
        className='space-y-6 max-h-[70vh] overflow-y-auto pr-2'>
        {renderHiddenInputs()}

        {/* Personal Information Section */}
        <div>
          <h3 className='text-md font-semibold text-slate-800 mb-4 pb-2 border-b border-blue-100'>
            Personal Information
          </h3>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <FormInput
              label='Full Name'
              name='name'
              value={formData.name}
              onChange={handleInputChange}
              required
              error={state.errors?.name}
            />
            <FormInput
              label='Email'
              type='email'
              name='email'
              value={formData.email}
              onChange={handleInputChange}
              required
              error={state.errors?.email}
            />
            <FormInput
              label='Phone'
              type='tel'
              name='phone'
              value={formData.phone}
              onChange={handleInputChange}
              required
              error={state.errors?.phone}
            />
            <FormInput
              label='Age'
              type='number'
              name='age'
              min='18'
              max='65'
              value={formData.age}
              onChange={handleInputChange}
              required
              error={state.errors?.age}
            />
          </div>
        </div>

        {/* National ID Verification Section */}
        <div>
          <h3 className='text-md font-semibold text-slate-800 mb-4 pb-2 border-b border-purple-100'>
            National ID Verification
          </h3>

          <div className='mb-4'>
            <FormInput
              label='NID Number'
              name='nid'
              value={formData.nid}
              onChange={handleInputChange}
              placeholder='Enter 10, 13, or 17 digit NID'
              required
              error={state.errors?.nid}
            />
            <p className='mt-1 text-xs text-gray-500'>
              Supported formats: 10-digit (old) or 13/17-digit (new) Bangladesh
              NID
            </p>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-4'>
            <div>
              <label className='block text-sm mb-2 text-gray-600 font-semibold'>
                NID Front Image
              </label>
              <input
                type='file'
                accept='image/*'
                onChange={(e) => handleNidImageChange(e, 'front')}
                disabled={uploadingNidFront}
                className='w-full border border-gray-300 p-3 rounded-lg bg-white text-gray-700 focus:outline-none transition-colors file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 disabled:opacity-50 disabled:cursor-not-allowed'
              />
              {uploadingNidFront && (
                <p className='mt-2 text-sm text-purple-600'>
                  Uploading NID front image...
                </p>
              )}
              {nidFrontUrl && (
                <p className='mt-2 text-sm text-green-600'>
                  NID front image ready for update
                </p>
              )}
              {nidFrontPreview && (
                <div className='mt-3'>
                  <img
                    src={nidFrontPreview}
                    alt='NID Front Preview'
                    className='w-full h-32 object-contain rounded-lg border border-gray-200 bg-gray-50'
                  />
                </div>
              )}
              {state.errors?.nid_front_image && (
                <p className='text-sm mt-2 text-red-500'>
                  {state.errors.nid_front_image}
                </p>
              )}
            </div>

            <div>
              <label className='block text-sm mb-2 text-gray-600 font-semibold'>
                NID Back Image
              </label>
              <input
                type='file'
                accept='image/*'
                onChange={(e) => handleNidImageChange(e, 'back')}
                disabled={uploadingNidBack}
                className='w-full border border-gray-300 p-3 rounded-lg bg-white text-gray-700 focus:outline-none transition-colors file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 disabled:opacity-50 disabled:cursor-not-allowed'
              />
              {uploadingNidBack && (
                <p className='mt-2 text-sm text-purple-600'>
                  Uploading NID back image...
                </p>
              )}
              {nidBackUrl && (
                <p className='mt-2 text-sm text-green-600'>
                  NID back image ready for update
                </p>
              )}
              {nidBackPreview && (
                <div className='mt-3'>
                  <img
                    src={nidBackPreview}
                    alt='NID Back Preview'
                    className='w-full h-32 object-contain rounded-lg border border-gray-200 bg-gray-50'
                  />
                </div>
              )}
              {state.errors?.nid_back_image && (
                <p className='text-sm mt-2 text-red-500'>
                  {state.errors.nid_back_image}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Service Information Section */}
        <div>
          <h3 className='text-md font-semibold text-slate-800 mb-4 pb-2 border-b border-green-100'>
            Service Information
          </h3>

          {/* Service Type Selection */}
          <div className='mb-4'>
            <label className='block text-sm mb-3 text-gray-600 font-semibold'>
              Service Type *
            </label>
            <div className='grid grid-cols-2 gap-3'>
              {services.map((service) => (
                <label
                  key={service.id}
                  className='flex items-center space-x-2 p-3 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors cursor-pointer bg-white'>
                  <input
                    type='checkbox'
                    checked={selectedServices.includes(service.id)}
                    className='w-4 h-4 text-blue-600 focus:ring-blue-500'
                    onChange={(e) =>
                      handleServiceCheckbox(service, e.target.checked)
                    }
                  />
                  <span className='text-sm font-medium text-gray-700'>
                    {service.name}
                  </span>
                </label>
              ))}
            </div>
            {state.errors?.service_type && (
              <p className='text-sm mt-2 text-red-500'>
                {state.errors.service_type}
              </p>
            )}
          </div>

          {/* Service Ratings */}
          {selectedServices.length > 0 && (
            <div className='mb-4'>
              <label className='block text-sm mb-3 text-gray-600 font-semibold'>
                Rate Your Expertise Per Service *
              </label>
              <div className='space-y-3'>
                {selectedServices.map((serviceId) => {
                  const service = services.find((s) => s.id === serviceId);
                  return service ? (
                    <div
                      key={serviceId}
                      className='flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200'>
                      <span className='text-sm font-medium text-gray-700'>
                        {service.name}
                      </span>
                      <Rating
                        value={serviceRatings[serviceId] || 0}
                        onChange={(rating) =>
                          handleRatingChange(serviceId, rating)
                        }
                        name={`rating_${serviceId}`}
                        max={5}
                      />
                    </div>
                  ) : null;
                })}
              </div>
              {state.errors?.service_ratings && (
                <p className='text-sm mt-2 text-red-500'>
                  {state.errors.service_ratings}
                </p>
              )}
            </div>
          )}

          {/* Shift */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-4'>
            <FormSelect
              label='Preferred Shift'
              name='shift'
              options={SHIFT_OPTIONS}
              value={formData.shift}
              onChange={handleInputChange}
              required
              error={state.errors?.shift}
            />
          </div>

          {/* Feedback */}
          <FormInput
            label='Additional Feedback'
            name='feedback'
            type='textarea'
            value={formData.feedback}
            onChange={handleInputChange}
            placeholder='Share any additional information, special skills, or preferences...'
            error={state.errors?.feedback}
          />
        </div>

        {/* Additional Fields */}
        <div>
          <h3 className='text-md font-semibold text-slate-800 mb-4 pb-2 border-b border-gray-100'>
            Additional Information
          </h3>
          <div className='space-y-4'>
            <FormInput
              label='Profile Image URL'
              type='url'
              name='imageUrl'
              value={formData.imageUrl}
              onChange={handleInputChange}
              placeholder='https://example.com/image.jpg'
            />

            {/* Active Worker Checkbox */}
            <FormCheckboxGroup
              label='Active Worker'
              name='is_active'
              checked={formData.is_active}
              onChange={handleInputChange}
            />
          </div>
        </div>
      </form>
    </Modal>
  );
}

export default UpdateModal;
