import { useActionState, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useGetAllUsers } from '../../../hooks/useAuth';
import { useGetServices } from '../../../hooks/useWorker';
import { uploadImageToCloudinary } from '../../../utils/cloudinaryUpload';
import { SHIFT_OPTIONS } from '../../../utils/constants';
import { submitWorkerData } from '../../../utils/workerAction';
import Card from '../../ui/Card';
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

      // Show preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);

      // Upload to Cloudinary
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
      </>
    );
  };
  const handleServiceCheckbox = (service, isChecked) => {
    handleServiceChange(service.id, isChecked);
  };

  return (
    <div className='w-full max-w-4xl mx-auto p-4'>
      <h2 className='text-2xl font-bold text-center mb-6 text-gray-900'>
        {isAdminMode
          ? 'Register Worker (Admin)'
          : 'Worker Profile Registration'}
      </h2>

      <Card
        title=''
        className='mb-6'
        bgColor='bg-gradient-to-br from-blue-25 to-white'
        borderColor='border-blue-100'
        formCard={true}>
        <form action={formAction}>
          {renderHiddenInputs()}
          <input type='hidden' name='imageUrl' value={imageUrl || ''} />
          {isAdminMode && (
            <div className='mb-8'>
              <h3 className='text-lg font-semibold text-slate-800 mb-4 flex items-center'>
                <svg
                  className='w-5 h-5 mr-2 text-amber-600'
                  fill='currentColor'
                  viewBox='0 0 20 20'>
                  <path
                    fillRule='evenodd'
                    d='M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z'
                    clipRule='evenodd'
                  />
                </svg>
                Select User for Worker Profile
              </h3>
              <div>
                <label className='block text-sm mb-2 text-gray-600 font-semibold'>
                  User *
                </label>
                <select
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  required
                  className='w-full border border-gray-300 p-3 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all'>
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

          <div className='mb-8'>
            <h3 className='text-lg font-semibold text-slate-800 mb-6 pb-2 border-b border-blue-100'>
              Personal Information
            </h3>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <div className='space-y-4'>
                <FormInput
                  label='Full Name'
                  name='name'
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder='Full Name'
                  required
                  error={state.errors?.name}
                />

                <FormInput
                  label='Email Address'
                  type='email'
                  name='email'
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder='Email Address'
                  required
                  error={state.errors?.email}
                />

                <FormInput
                  label='Age'
                  type='number'
                  name='age'
                  value={formData.age}
                  onChange={handleInputChange}
                  placeholder='Age'
                  required
                  error={state.errors?.age}
                />
              </div>

              <div className='space-y-4'>
                <FormInput
                  label='Phone Number'
                  name='phone'
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder='Phone Number'
                  required
                  error={state.errors?.phone}
                />

                <div>
                  <label className='block text-sm mb-2 text-gray-600 font-semibold'>
                    Profile Image
                  </label>
                  <input
                    type='file'
                    name='image'
                    accept='image/*'
                    onChange={handleImageChange}
                    disabled={uploading}
                    className='w-full border border-gray-300 p-3 rounded-lg bg-white text-gray-700 focus:outline-none transition-colors file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed'
                  />
                  {uploading && (
                    <p className='mt-2 text-sm text-blue-600'>
                      Uploading image...
                    </p>
                  )}
                  {imageUrl && (
                    <p className='mt-2 text-sm text-green-600'>
                      Image uploaded successfully!
                    </p>
                  )}
                  {preview && (
                    <div className='mt-3'>
                      <img
                        src={preview}
                        alt='Preview'
                        className='w-20 h-20 object-cover rounded-lg border border-gray-200'
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className='mb-8'>
            <h3 className='text-lg font-semibold text-slate-800 mb-6 pb-2 border-b border-purple-100'>
              National ID Verification
            </h3>

            <div className='mb-6'>
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
                Supported formats: 10-digit (old) or 13/17-digit (new)
                Bangladesh NID
              </p>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <div>
                <label className='block text-sm mb-2 text-gray-600 font-semibold'>
                  NID Front Image *
                </label>
                <input
                  type='file'
                  name='nid_front'
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
                    NID front uploaded!
                  </p>
                )}
                {nidFrontPreview && (
                  <div className='mt-3'>
                    <img
                      src={nidFrontPreview}
                      alt='NID Front'
                      className='w-full h-32 object-cover rounded-lg border border-gray-200'
                    />
                  </div>
                )}
              </div>

              <div>
                <label className='block text-sm mb-2 text-gray-600 font-semibold'>
                  NID Back Image *
                </label>
                <input
                  type='file'
                  name='nid_back'
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
                    NID back uploaded!
                  </p>
                )}
                {nidBackPreview && (
                  <div className='mt-3'>
                    <img
                      src={nidBackPreview}
                      alt='NID Back'
                      className='w-full h-32 object-cover rounded-lg border border-gray-200'
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className='mb-6'>
            <h3 className='text-lg font-semibold text-slate-800 mb-6 pb-2 border-b border-green-100'>
              Service Information
            </h3>

            <div className='mb-6'>
              <label className='block text-sm mb-3 text-gray-600 font-semibold'>
                Service Type *
              </label>
              <div className='grid grid-cols-2 md:grid-cols-4 gap-3'>
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
                  {state.errors.service_ids}
                </p>
              )}
            </div>
            {selectedServices.length > 0 && (
              <div className='mb-6'>
                <label className='block text-sm mb-3 text-gray-600 font-semibold'>
                  Rate Your Expertise Per Service *
                </label>
                <div className='space-y-4'>
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
            <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-6'>
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

            <FormInput
              label='Additional Feedback'
              name='feedback'
              type='textarea'
              value={formData.feedback || ''}
              onChange={handleInputChange}
              placeholder='Share any additional information, special skills, or preferences...'
              error={state.errors?.feedback}
            />
          </div>

          <div className='flex justify-center pt-6 border-t border-gray-100'>
            <button
              disabled={isPending}
              type='submit'
              className='px-8 py-3 rounded-lg text-white font-semibold transition-all duration-200 hover:shadow-lg cursor-pointer bg-blue-600 hover:bg-blue-700 min-w-48 disabled:bg-blue-400 disabled:cursor-not-allowed'>
              {isPending ? 'Registering...' : 'Register Worker'}
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
}
