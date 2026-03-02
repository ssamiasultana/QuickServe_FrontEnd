import {
  Briefcase,
  Camera,
  CheckCircle,
  CreditCard,
  FileText,
  Shield,
  Upload,
  User,
  UserPlus,
  X,
} from 'lucide-react';
import { useActionState, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useGetAllUsers } from '../../../hooks/useAuth';
import { useGetServices } from '../../../hooks/useWorker';
import { uploadImageToCloudinary } from '../../../utils/cloudinaryUpload';
import { SHIFT_OPTIONS } from '../../../utils/constants';
import { submitWorkerData } from '../../../utils/workerAction';
import { FormInput } from '../../ui/FormInput';
import { FormSelect } from '../../ui/FormSelect';
import Rating from '../../ui/Rating';

export default function AddWorker({ isAdminMode = false }) {
  const [preview, setPreview] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState();

  const [nidFrontPreview, setNidFrontPreview] = useState(null);
  const [nidBackPreview, setNidBackPreview] = useState(null);
  const [nidFrontUrl, setNidFrontUrl] = useState(null);
  const [nidBackUrl, setNidBackUrl] = useState(null);
  const [uploadingNidFront, setUploadingNidFront] = useState(false);
  const [uploadingNidBack, setUploadingNidBack] = useState(false);

  const { data: usersData } = useGetAllUsers();
  const users = usersData || [];

  const [formData, setFormData] = useState({
    user_id: '',
    name: '',
    email: '',
    age: '',
    nid: '',
    phone: '',
    shift: '',
    rating: '',
    feedback: '',
  });

  const [state, formAction, isPending] = useActionState(submitWorkerData, {
    success: false,
    message: '',
    errors: {},
    data: null,
  });
  const [selectedServices, setSelectedServices] = useState([]);
  const [serviceRatings, setServiceRatings] = useState({});

  const { data: servicesData } = useGetServices();
  const services = Array.isArray(servicesData)
    ? servicesData
    : servicesData?.data || [];

  useEffect(() => {
    if (state.success) {
      setFormData({
        name: '',
        email: '',
        age: '',
        phone: '',
        nid: '',
        shift: '',
        rating: '',
        feedback: '',
        user_id: '',
      });
      setSelectedServices([]);
      setServiceRatings({});
      setPreview(null);
      setImageUrl(null);
      setNidFrontPreview(null);
      setNidBackPreview(null);
      setNidFrontUrl(null);
      setNidBackUrl(null);
      setSelectedUserId('');

      const fileInput = document.querySelector('input[type="file"]');
      if (fileInput) fileInput.value = '';
    }

    if (state.message) {
      if (state.success) {
        toast.success(state.message);
      } else {
        toast.error(state.message);
      }
    }
  }, [state]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = async (event) => {
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
        setPreview(null);
        setImageUrl(null);
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Image size should be less than 2MB');
        event.target.value = '';
        setPreview(null);
        setImageUrl(null);
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);

      setUploading(true);
      try {
        const url = await uploadImageToCloudinary(file);
        setImageUrl(url);
      } catch (error) {
        toast.error(`Failed to upload image: ${error.message}`);
        event.target.value = '';
        setPreview(null);
        setImageUrl(null);
      } finally {
        setUploading(false);
      }
    } else {
      setPreview(null);
      setImageUrl(null);
    }
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
        } else {
          setNidBackUrl(url);
        }
        toast.success(`NID ${side} image uploaded successfully`);
      } catch (error) {
        toast.error(`Failed to upload NID ${side} image: ${error.message}`);
        event.target.value = '';
        if (side === 'front') {
          setNidFrontPreview(null);
          setNidFrontUrl(null);
        } else {
          setNidBackPreview(null);
          setNidBackUrl(null);
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
      setServiceRatings({ ...serviceRatings, [serviceId]: 0 });
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

  const renderHiddenInputs = () => {
    return (
      <>
        {isAdminMode && selectedUserId && (
          <input type='hidden' name='user_id' value={selectedUserId} />
        )}

        {selectedServices.map((serviceId) => (
          <input
            key={`service_${serviceId}`}
            type='hidden'
            name='service_ids[]'
            value={serviceId}
          />
        ))}

        {Object.entries(serviceRatings).map(([serviceId, rating]) => (
          <input
            key={`rating_${serviceId}`}
            type='hidden'
            name='expertise_of_service[]'
            value={rating}
          />
        ))}
        <input type='hidden' name='nid_front_image' value={nidFrontUrl || ''} />
        <input type='hidden' name='nid_back_image' value={nidBackUrl || ''} />
      </>
    );
  };

  const handleServiceCheckbox = (service, isChecked) => {
    handleServiceChange(service.id, isChecked);
  };

  // Section header component
  const SectionHeader = ({ step, icon: Icon, title, subtitle, color = 'blue' }) => {
    const colorMap = {
      blue: { bg: 'bg-blue-100', text: 'text-blue-600', badge: 'bg-blue-600' },
      purple: { bg: 'bg-purple-100', text: 'text-purple-600', badge: 'bg-purple-600' },
      amber: { bg: 'bg-amber-100', text: 'text-amber-600', badge: 'bg-amber-600' },
      green: { bg: 'bg-green-100', text: 'text-green-600', badge: 'bg-green-600' },
      indigo: { bg: 'bg-indigo-100', text: 'text-indigo-600', badge: 'bg-indigo-600' },
    };
    const c = colorMap[color] || colorMap.blue;
    return (
      <div className='flex items-center gap-3 mb-5'>
        <div className={`w-8 h-8 rounded-full ${c.badge} text-white flex items-center justify-center text-sm font-bold flex-shrink-0`}>
          {step}
        </div>
        <div className={`p-2 rounded-lg ${c.bg}`}>
          <Icon className={`w-5 h-5 ${c.text}`} />
        </div>
        <div>
          <h3 className='text-base font-semibold text-gray-800'>{title}</h3>
          {subtitle && <p className='text-xs text-gray-500'>{subtitle}</p>}
        </div>
      </div>
    );
  };

  // Image upload box component
  const ImageUploadBox = ({ label, preview: imgPreview, uploading: isUploading, uploaded, onChange, accept = 'image/*', className = '' }) => (
    <div className={className}>
      <label className='block text-sm mb-2 text-gray-600 font-semibold'>{label}</label>
      <div className='relative'>
        <label className={`flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-xl cursor-pointer transition-all ${
          imgPreview ? 'border-green-300 bg-green-50/30' : 'border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50/30'
        } ${isUploading ? 'opacity-70 pointer-events-none' : ''}`}>
          {imgPreview ? (
            <img src={imgPreview} alt='Preview' className='h-full w-full object-cover rounded-xl' />
          ) : (
            <div className='flex flex-col items-center justify-center pt-5 pb-6'>
              {isUploading ? (
                <>
                  <div className='w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin mb-2' />
                  <p className='text-sm text-blue-600 font-medium'>Uploading...</p>
                </>
              ) : (
                <>
                  <Upload className='w-8 h-8 text-gray-400 mb-2' />
                  <p className='text-sm text-gray-500'>
                    <span className='font-medium text-blue-600'>Click to upload</span>
                  </p>
                  <p className='text-xs text-gray-400 mt-1'>PNG, JPG, WEBP (max 2MB)</p>
                </>
              )}
            </div>
          )}
          <input type='file' accept={accept} onChange={onChange} disabled={isUploading} className='hidden' />
        </label>
        {uploaded && (
          <div className='absolute top-2 right-2 bg-green-500 text-white rounded-full p-1'>
            <CheckCircle className='w-4 h-4' />
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className='w-full max-w-3xl mx-auto'>
      {/* Header */}
      <div className='mb-6'>
        <div className='flex items-center gap-3 mb-2'>
          <div className={`p-2.5 rounded-xl ${isAdminMode ? 'bg-blue-100' : 'bg-purple-100'}`}>
            <Briefcase className={`w-6 h-6 ${isAdminMode ? 'text-blue-600' : 'text-purple-600'}`} />
          </div>
          <div>
            <h1 className='text-2xl font-bold text-gray-900'>
              {isAdminMode ? 'Add Worker Profile' : 'Worker Profile Registration'}
            </h1>
            <p className='text-sm text-gray-500'>
              {isAdminMode
                ? 'Create a complete worker profile with services and verification'
                : 'Complete your worker profile to start receiving jobs'}
            </p>
          </div>
        </div>
      </div>

      {/* Success / Error Alert */}
      {state.message && (
        <div
          className={`flex items-center gap-3 p-4 rounded-xl mb-6 border ${
            state.success
              ? 'bg-green-50 border-green-200 text-green-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}>
          {state.success ? (
            <CheckCircle className='w-5 h-5 text-green-600 flex-shrink-0' />
          ) : (
            <Shield className='w-5 h-5 text-red-600 flex-shrink-0' />
          )}
          <span className='text-sm font-medium'>{state.message}</span>
        </div>
      )}

      {/* Form */}
      <div className='bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden'>
        <form action={formAction}>
          {renderHiddenInputs()}
          <input type='hidden' name='imageUrl' value={imageUrl || ''} />

          {/* Step 0: Select User (Admin Only) */}
          {isAdminMode && (
            <div className='p-6 border-b border-gray-100'>
              <SectionHeader step={0} icon={UserPlus} title='Select User Account' subtitle='Choose the user to create a worker profile for' color='amber' />
              <div className='max-w-md'>
                <label className='block text-sm mb-2 text-gray-600 font-semibold'>
                  User Account *
                </label>
                <select
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  required
                  className='w-full border border-gray-300 p-3 rounded-xl bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all'>
                  <option value=''>-- Select a user --</option>
                  {users
                    .filter((user) => user.role === 'Worker')
                    .map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.name} ({user.email})
                      </option>
                    ))}
                </select>
                {state.errors?.user_id && (
                  <p className='text-sm mt-2 text-red-500'>
                    {state.errors.user_id}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Step 1: Personal Information */}
          <div className='p-6 border-b border-gray-100'>
            <SectionHeader step={1} icon={User} title='Personal Information' subtitle='Basic details about the worker' color='blue' />
            <div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
              <FormInput
                label='Full Name'
                name='name'
                value={formData.name}
                onChange={handleInputChange}
                placeholder='Enter full name'
                required
                error={state.errors?.name}
              />
              <FormInput
                label='Email Address'
                type='email'
                name='email'
                value={formData.email}
                onChange={handleInputChange}
                placeholder='email@example.com'
                required
                error={state.errors?.email}
              />
              <FormInput
                label='Age'
                type='number'
                name='age'
                value={formData.age}
                onChange={handleInputChange}
                placeholder='Enter age'
                required
                error={state.errors?.age}
              />
              <FormInput
                label='Phone Number'
                name='phone'
                value={formData.phone}
                onChange={handleInputChange}
                placeholder='+880 1XXX-XXXXXX'
                required
                error={state.errors?.phone}
              />
            </div>

            {/* Profile Image */}
            <div className='mt-5'>
              <ImageUploadBox
                label='Profile Photo'
                preview={preview}
                uploading={uploading}
                uploaded={!!imageUrl}
                onChange={handleImageChange}
                className='max-w-xs'
              />
            </div>
          </div>

          {/* Step 2: NID Verification */}
          <div className='p-6 border-b border-gray-100'>
            <SectionHeader step={2} icon={CreditCard} title='National ID Verification' subtitle='Upload NID images for identity verification' color='purple' />
            <div className='mb-5 max-w-md'>
              <FormInput
                label='NID Number'
                name='nid'
                value={formData.nid}
                onChange={handleInputChange}
                placeholder='Enter 10, 13, or 17 digit NID'
                required
                error={state.errors?.nid}
              />
              <p className='mt-1.5 text-xs text-gray-400'>
                Supported: 10-digit (old) or 13/17-digit (new) Bangladesh NID
              </p>
            </div>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
              <ImageUploadBox
                label='NID Front Image *'
                preview={nidFrontPreview}
                uploading={uploadingNidFront}
                uploaded={!!nidFrontUrl}
                onChange={(e) => handleNidImageChange(e, 'front')}
              />
              <ImageUploadBox
                label='NID Back Image *'
                preview={nidBackPreview}
                uploading={uploadingNidBack}
                uploaded={!!nidBackUrl}
                onChange={(e) => handleNidImageChange(e, 'back')}
              />
            </div>
          </div>

          {/* Step 3: Services & Expertise */}
          <div className='p-6 border-b border-gray-100'>
            <SectionHeader step={3} icon={Briefcase} title='Services & Expertise' subtitle='Select services and rate expertise level' color='green' />

            <div className='mb-5'>
              <label className='block text-sm mb-3 text-gray-600 font-semibold'>
                Select Services *
              </label>
              <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5'>
                {services.map((service) => {
                  const isSelected = selectedServices.includes(service.id);
                  return (
                    <label
                      key={service.id}
                      className={`flex items-center gap-2.5 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50 shadow-sm'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}>
                      <input
                        type='checkbox'
                        checked={isSelected}
                        className='w-4 h-4 text-blue-600 rounded focus:ring-blue-500'
                        onChange={(e) =>
                          handleServiceCheckbox(service, e.target.checked)
                        }
                      />
                      <span className={`text-sm font-medium ${isSelected ? 'text-blue-700' : 'text-gray-700'}`}>
                        {service.name}
                      </span>
                    </label>
                  );
                })}
              </div>
              {state.errors?.service_type && (
                <p className='text-sm mt-2 text-red-500'>
                  {state.errors.service_ids}
                </p>
              )}
            </div>

            {/* Expertise Rating */}
            {selectedServices.length > 0 && (
              <div className='mb-5'>
                <label className='block text-sm mb-3 text-gray-600 font-semibold'>
                  Expertise Rating Per Service *
                </label>
                <div className='space-y-2.5'>
                  {selectedServices.map((serviceId) => {
                    const service = services.find((s) => s.id === serviceId);
                    return service ? (
                      <div
                        key={serviceId}
                        className='flex items-center justify-between p-3.5 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-200'>
                        <div className='flex items-center gap-2'>
                          <div className='w-2 h-2 rounded-full bg-blue-500' />
                          <span className='text-sm font-medium text-gray-700'>
                            {service.name}
                          </span>
                        </div>
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
          </div>

          {/* Step 4: Work Preferences */}
          <div className='p-6 border-b border-gray-100'>
            <SectionHeader step={4} icon={FileText} title='Work Preferences' subtitle='Shift preference and additional notes' color='indigo' />
            <div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
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
            <div className='mt-5'>
              <FormInput
                label='Additional Notes'
                name='feedback'
                type='textarea'
                value={formData.feedback || ''}
                onChange={handleInputChange}
                placeholder='Special skills, certifications, or any additional information...'
                error={state.errors?.feedback}
              />
            </div>
          </div>

          {/* Submit */}
          <div className='p-6 bg-gray-50 flex items-center justify-between'>
            <p className='text-xs text-gray-400'>
              Fields marked with * are required
            </p>
            <button
              disabled={isPending || uploading || uploadingNidFront || uploadingNidBack}
              type='submit'
              className='px-8 py-3 rounded-xl text-white font-semibold transition-all duration-200 hover:shadow-lg bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center gap-2'>
              {isPending ? (
                <>
                  <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin' />
                  Registering...
                </>
              ) : (
                <>
                  <CheckCircle className='w-4 h-4' />
                  Register Worker
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
