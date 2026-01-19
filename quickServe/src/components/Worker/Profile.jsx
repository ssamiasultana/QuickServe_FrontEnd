import { useContext, useEffect, useState } from 'react';
import { Edit2, Save, X, User, Mail, Phone, Calendar, IdCard, MapPin, Briefcase, Clock, Star } from 'lucide-react';
import toast from 'react-hot-toast';
import { AuthContext } from '../Context/AuthContext';
import { useGetProfile, useUpdateProfile, useGetServices } from '../../hooks/useWorker';
import { uploadImageToCloudinary } from '../../utils/cloudinaryUpload';
import { SHIFT_OPTIONS } from '../../utils/constants';
import Card from '../ui/Card';
import { FormInput } from '../ui/FormInput';
import { FormSelect } from '../ui/FormSelect';
import Rating from '../ui/Rating';

export default function Profile() {
  const { user } = useContext(AuthContext);
  const [isEditing, setIsEditing] = useState(false);
  const [preview, setPreview] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [nidFrontPreview, setNidFrontPreview] = useState(null);
  const [nidBackPreview, setNidBackPreview] = useState(null);
  const [nidFrontUrl, setNidFrontUrl] = useState(null);
  const [nidBackUrl, setNidBackUrl] = useState(null);
  const [uploadingNidFront, setUploadingNidFront] = useState(false);
  const [uploadingNidBack, setUploadingNidBack] = useState(false);

  const {
    data: worker,
    isLoading: profileLoading,
    isError: profileError,
    refetch: refetchProfile,
  } = useGetProfile();

  const { data: servicesData } = useGetServices();
  const services = Array.isArray(servicesData)
    ? servicesData
    : servicesData?.data || [];

  const updateProfileMutation = useUpdateProfile();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    age: '',
    nid: '',
    phone: '',
    shift: '',
    feedback: '',
    address: '',
  });

  const [selectedServices, setSelectedServices] = useState([]);
  const [serviceRatings, setServiceRatings] = useState({});

  // Initialize form data when worker data is loaded
  useEffect(() => {
    if (worker && !isEditing) {
      setFormData({
        name: worker.name || '',
        email: worker.email || '',
        age: worker.age || '',
        nid: worker.nid || '',
        phone: worker.phone || '',
        shift: worker.shift || '',
        feedback: worker.feedback || '',
        address: worker.address || '',
      });

      // Set services
      if (worker.services && Array.isArray(worker.services)) {
        setSelectedServices(worker.services.map((s) => s.id));
        const ratings = {};
        worker.services.forEach((service) => {
          if (worker.expertise_of_service) {
            const expertise = Array.isArray(worker.expertise_of_service)
              ? worker.expertise_of_service
              : JSON.parse(worker.expertise_of_service || '[]');
            const serviceIndex = worker.services.findIndex((s) => s.id === service.id);
            if (serviceIndex !== -1 && expertise[serviceIndex] !== undefined) {
              ratings[service.id] = expertise[serviceIndex];
            }
          }
        });
        setServiceRatings(ratings);
      }

      // Set images
      if (worker.image) {
        setImageUrl(worker.image);
        setPreview(worker.image);
      }
      if (worker.nid_front_image) {
        setNidFrontUrl(worker.nid_front_image);
        setNidFrontPreview(worker.nid_front_image);
      }
      if (worker.nid_back_image) {
        setNidBackUrl(worker.nid_back_image);
        setNidBackPreview(worker.nid_back_image);
      }
    }
  }, [worker, isEditing]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = async (event) => {
    const file = event.currentTarget.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    setUploading(true);
    try {
      const url = await uploadImageToCloudinary(file);
      setImageUrl(url);
      setPreview(URL.createObjectURL(file));
      toast.success('Image uploaded successfully!');
    } catch (error) {
      toast.error('Failed to upload image');
      console.error('Image upload error:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleNidImageChange = async (event, side) => {
    const file = event.currentTarget.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    if (side === 'front') {
      setUploadingNidFront(true);
    } else {
      setUploadingNidBack(true);
    }

    try {
      const url = await uploadImageToCloudinary(file);
      if (side === 'front') {
        setNidFrontUrl(url);
        setNidFrontPreview(URL.createObjectURL(file));
      } else {
        setNidBackUrl(url);
        setNidBackPreview(URL.createObjectURL(file));
      }
      toast.success(`NID ${side} image uploaded successfully!`);
    } catch (error) {
      toast.error(`Failed to upload NID ${side} image`);
      console.error('NID image upload error:', error);
    } finally {
      if (side === 'front') {
        setUploadingNidFront(false);
      } else {
        setUploadingNidBack(false);
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

  const handleSave = async () => {
    if (!worker) {
      toast.error('Worker profile not found');
      return;
    }

    // Prepare update data - ensure expertise_of_service matches service_ids order
    const updateData = {
      ...formData,
      image: imageUrl || worker.image,
      nid_front_image: nidFrontUrl || worker.nid_front_image,
      nid_back_image: nidBackUrl || worker.nid_back_image,
      service_ids: selectedServices,
      expertise_of_service: selectedServices.map((serviceId) => {
        return serviceRatings[serviceId] !== undefined ? serviceRatings[serviceId] : 0;
      }),
    };

    try {
      await updateProfileMutation.mutateAsync(updateData);
      setIsEditing(false);
      refetchProfile();
    } catch (error) {
      console.error('Update error:', error);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset form data to original worker data
    if (worker) {
      setFormData({
        name: worker.name || '',
        email: worker.email || '',
        age: worker.age || '',
        nid: worker.nid || '',
        phone: worker.phone || '',
        shift: worker.shift || '',
        feedback: worker.feedback || '',
        address: worker.address || '',
      });
      if (worker.services) {
        setSelectedServices(worker.services.map((s) => s.id));
      }
      if (worker.image) {
        setPreview(worker.image);
        setImageUrl(worker.image);
      }
      if (worker.nid_front_image) {
        setNidFrontPreview(worker.nid_front_image);
        setNidFrontUrl(worker.nid_front_image);
      }
      if (worker.nid_back_image) {
        setNidBackPreview(worker.nid_back_image);
        setNidBackUrl(worker.nid_back_image);
      }
    }
  };

  if (profileLoading) {
    return (
      <div className='flex justify-center items-center py-12'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto'></div>
          <p className='mt-4 text-gray-600'>Loading profile...</p>
        </div>
      </div>
    );
  }

  if (profileError || !worker) {
    return (
      <div className='text-center py-12'>
        <div className='w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4'>
          <User className='w-8 h-8 text-purple-600' />
        </div>
        <h1 className='text-2xl font-bold text-gray-900 mb-2'>
          Profile Not Found
        </h1>
        <p className='text-gray-600 mb-4'>
          Please complete your profile to view and edit your information
        </p>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-50 p-6'>
      <div className='max-w-4xl mx-auto'>
        {/* Header */}
        <div className='mb-8 flex items-center justify-between'>
          <div>
            <h1 className='text-3xl font-bold text-gray-900 mb-2'>My Profile</h1>
            <p className='text-gray-600'>View and manage your profile information</p>
          </div>
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className='flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors'>
              <Edit2 className='w-4 h-4' />
              Edit Profile
            </button>
          ) : (
            <div className='flex gap-2'>
              <button
                onClick={handleCancel}
                className='flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors'>
                <X className='w-4 h-4' />
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={updateProfileMutation.isPending}
                className='flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'>
                <Save className='w-4 h-4' />
                {updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          )}
        </div>

        {/* Profile Image */}
        <Card className='mb-6' bgColor='bg-white' borderColor='border-gray-200'>
          <div className='flex flex-col items-center py-6'>
            <div className='relative mb-4'>
              {preview ? (
                <img
                  src={preview}
                  alt='Profile'
                  className='w-32 h-32 rounded-full object-cover border-4 border-purple-200'
                />
              ) : (
                <div className='w-32 h-32 rounded-full bg-purple-100 flex items-center justify-center border-4 border-purple-200'>
                  <User className='w-16 h-16 text-purple-400' />
                </div>
              )}
            </div>
            {isEditing && (
              <div>
                <label className='cursor-pointer inline-block px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors'>
                  {uploading ? 'Uploading...' : 'Change Photo'}
                  <input
                    type='file'
                    accept='image/*'
                    onChange={handleImageChange}
                    disabled={uploading}
                    className='hidden'
                  />
                </label>
              </div>
            )}
          </div>
        </Card>

        {/* Personal Information */}
        <Card
          title='Personal Information'
          className='mb-6'
          bgColor='bg-white'
          borderColor='border-gray-200'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div className='flex items-start gap-3'>
              <User className='w-5 h-5 text-purple-600 mt-1' />
              <div className='flex-1'>
                <label className='block text-sm font-medium text-gray-500 mb-1'>
                  Full Name
                </label>
                {isEditing ? (
                  <FormInput
                    name='name'
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder='Full Name'
                  />
                ) : (
                  <p className='text-gray-900 font-medium'>{worker.name || 'N/A'}</p>
                )}
              </div>
            </div>

            <div className='flex items-start gap-3'>
              <Mail className='w-5 h-5 text-purple-600 mt-1' />
              <div className='flex-1'>
                <label className='block text-sm font-medium text-gray-500 mb-1'>
                  Email
                </label>
                {isEditing ? (
                  <FormInput
                    name='email'
                    type='email'
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder='Email Address'
                  />
                ) : (
                  <p className='text-gray-900 font-medium'>{worker.email || 'N/A'}</p>
                )}
              </div>
            </div>

            <div className='flex items-start gap-3'>
              <Phone className='w-5 h-5 text-purple-600 mt-1' />
              <div className='flex-1'>
                <label className='block text-sm font-medium text-gray-500 mb-1'>
                  Phone Number
                </label>
                {isEditing ? (
                  <FormInput
                    name='phone'
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder='Phone Number'
                  />
                ) : (
                  <p className='text-gray-900 font-medium'>{worker.phone || 'N/A'}</p>
                )}
              </div>
            </div>

            <div className='flex items-start gap-3'>
              <Calendar className='w-5 h-5 text-purple-600 mt-1' />
              <div className='flex-1'>
                <label className='block text-sm font-medium text-gray-500 mb-1'>
                  Age
                </label>
                {isEditing ? (
                  <FormInput
                    name='age'
                    type='number'
                    value={formData.age}
                    onChange={handleInputChange}
                    placeholder='Age'
                  />
                ) : (
                  <p className='text-gray-900 font-medium'>{worker.age || 'N/A'}</p>
                )}
              </div>
            </div>

            <div className='flex items-start gap-3 md:col-span-2'>
              <MapPin className='w-5 h-5 text-purple-600 mt-1' />
              <div className='flex-1'>
                <label className='block text-sm font-medium text-gray-500 mb-1'>
                  Address
                </label>
                {isEditing ? (
                  <FormInput
                    name='address'
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder='Address'
                  />
                ) : (
                  <p className='text-gray-900 font-medium'>{worker.address || 'N/A'}</p>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* National ID Verification */}
        <Card
          title='National ID Verification'
          className='mb-6'
          bgColor='bg-white'
          borderColor='border-gray-200'>
          <div className='space-y-6'>
            <div className='flex items-start gap-3'>
              <IdCard className='w-5 h-5 text-purple-600 mt-1' />
              <div className='flex-1'>
                <label className='block text-sm font-medium text-gray-500 mb-1'>
                  NID Number
                </label>
                {isEditing ? (
                  <FormInput
                    name='nid'
                    value={formData.nid}
                    onChange={handleInputChange}
                    placeholder='Enter NID Number'
                  />
                ) : (
                  <p className='text-gray-900 font-medium'>{worker.nid || 'N/A'}</p>
                )}
              </div>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <div>
                <label className='block text-sm font-medium text-gray-500 mb-2'>
                  NID Front Image
                </label>
                {nidFrontPreview ? (
                  <img
                    src={nidFrontPreview}
                    alt='NID Front'
                    className='w-full h-32 object-cover rounded-lg border border-gray-200 mb-2'
                  />
                ) : (
                  <div className='w-full h-32 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center mb-2'>
                    <p className='text-gray-400 text-sm'>No image</p>
                  </div>
                )}
                {isEditing && (
                  <input
                    type='file'
                    accept='image/*'
                    onChange={(e) => handleNidImageChange(e, 'front')}
                    disabled={uploadingNidFront}
                    className='w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 disabled:opacity-50'
                  />
                )}
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-500 mb-2'>
                  NID Back Image
                </label>
                {nidBackPreview ? (
                  <img
                    src={nidBackPreview}
                    alt='NID Back'
                    className='w-full h-32 object-cover rounded-lg border border-gray-200 mb-2'
                  />
                ) : (
                  <div className='w-full h-32 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center mb-2'>
                    <p className='text-gray-400 text-sm'>No image</p>
                  </div>
                )}
                {isEditing && (
                  <input
                    type='file'
                    accept='image/*'
                    onChange={(e) => handleNidImageChange(e, 'back')}
                    disabled={uploadingNidBack}
                    className='w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 disabled:opacity-50'
                  />
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* Service Information */}
        <Card
          title='Service Information'
          className='mb-6'
          bgColor='bg-white'
          borderColor='border-gray-200'>
          <div className='space-y-6'>
            <div className='flex items-start gap-3'>
              <Briefcase className='w-5 h-5 text-purple-600 mt-1' />
              <div className='flex-1'>
                <label className='block text-sm font-medium text-gray-500 mb-3'>
                  Services
                </label>
                {isEditing ? (
                  <div className='grid grid-cols-2 md:grid-cols-3 gap-3'>
                    {services.map((service) => (
                      <label
                        key={service.id}
                        className='flex items-center space-x-2 p-3 rounded-lg border border-gray-200 hover:border-purple-300 transition-colors cursor-pointer bg-white'>
                        <input
                          type='checkbox'
                          checked={selectedServices.includes(service.id)}
                          onChange={(e) => handleServiceChange(service.id, e.target.checked)}
                          className='w-4 h-4 text-purple-600 focus:ring-purple-500'
                        />
                        <span className='text-sm font-medium text-gray-700'>
                          {service.name}
                        </span>
                      </label>
                    ))}
                  </div>
                ) : (
                  <div className='flex flex-wrap gap-2'>
                    {worker.services && worker.services.length > 0 ? (
                      worker.services.map((service) => (
                        <span
                          key={service.id}
                          className='px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium'>
                          {service.name}
                        </span>
                      ))
                    ) : (
                      <p className='text-gray-500'>No services selected</p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {isEditing && selectedServices.length > 0 && (
              <div>
                <label className='block text-sm font-medium text-gray-500 mb-3'>
                  Rate Your Expertise Per Service
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
                          onChange={(rating) => handleRatingChange(serviceId, rating)}
                          name={`rating_${serviceId}`}
                          max={5}
                        />
                      </div>
                    ) : null;
                  })}
                </div>
              </div>
            )}

            {!isEditing && worker.services && worker.services.length > 0 && (
              <div>
                <label className='block text-sm font-medium text-gray-500 mb-3'>
                  Expertise Ratings
                </label>
                <div className='space-y-3'>
                  {worker.services.map((service, index) => {
                    const expertise = Array.isArray(worker.expertise_of_service)
                      ? worker.expertise_of_service
                      : JSON.parse(worker.expertise_of_service || '[]');
                    const rating = expertise[index] || 0;
                    return (
                      <div
                        key={service.id}
                        className='flex items-center justify-between p-3 bg-gray-50 rounded-lg'>
                        <span className='text-sm font-medium text-gray-700'>
                          {service.name}
                        </span>
                        <div className='flex items-center gap-1'>
                          <Star className='w-4 h-4 text-yellow-400 fill-current' />
                          <span className='text-sm font-medium text-gray-700'>{rating}/5</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className='flex items-start gap-3'>
              <Clock className='w-5 h-5 text-purple-600 mt-1' />
              <div className='flex-1'>
                <label className='block text-sm font-medium text-gray-500 mb-1'>
                  Preferred Shift
                </label>
                {isEditing ? (
                  <FormSelect
                    name='shift'
                    options={SHIFT_OPTIONS}
                    value={formData.shift}
                    onChange={handleInputChange}
                  />
                ) : (
                  <p className='text-gray-900 font-medium'>{worker.shift || 'N/A'}</p>
                )}
              </div>
            </div>

            <div className='flex items-start gap-3'>
              <div className='flex-1'>
                <label className='block text-sm font-medium text-gray-500 mb-1'>
                  Additional Feedback
                </label>
                {isEditing ? (
                  <FormInput
                    name='feedback'
                    type='textarea'
                    value={formData.feedback || ''}
                    onChange={handleInputChange}
                    placeholder='Share any additional information...'
                  />
                ) : (
                  <p className='text-gray-900'>{worker.feedback || 'No feedback provided'}</p>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* Status Information */}
        {!isEditing && (
          <Card
            title='Account Status'
            className='mb-6'
            bgColor='bg-white'
            borderColor='border-gray-200'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm text-gray-500 mb-1'>Account Status</p>
                <span
                  className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                    worker.is_active
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                  {worker.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
              {worker.rating && (
                <div>
                  <p className='text-sm text-gray-500 mb-1'>Overall Rating</p>
                  <div className='flex items-center gap-1'>
                    <Star className='w-5 h-5 text-yellow-400 fill-current' />
                    <span className='text-lg font-bold text-gray-900'>
                      {parseFloat(worker.rating).toFixed(1)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
