import { useContext, useEffect, useState } from 'react';
import { Edit2, Save, X, User, Mail, Phone, Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import { AuthContext } from '../Context/AuthContext';
import { useGetUserProfile, useUpdateUserProfile } from '../../hooks/useAuth';
import Card from '../ui/Card';
import { FormInput } from '../ui/FormInput';

export default function AdminProfile() {
  const { user: authUser, updateUser } = useContext(AuthContext);
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordChange, setShowPasswordChange] = useState(false);

  const {
    data: user,
    isLoading: profileLoading,
    isError: profileError,
    refetch: refetchProfile,
  } = useGetUserProfile();

  const updateProfileMutation = useUpdateUserProfile();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  });

  const [passwordData, setPasswordData] = useState({
    current_password: '',
    password: '',
    password_confirmation: '',
  });

  // Initialize form data when user data is loaded
  useEffect(() => {
    if (user && !isEditing) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
      });
    }
  }, [user, isEditing]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    if (!user) {
      toast.error('User profile not found');
      return;
    }

    try {
      const updateData = { ...formData };
      await updateProfileMutation.mutateAsync(updateData);
      setIsEditing(false);
      refetchProfile();
      // Update auth context
      if (updateUser) {
        updateUser({ ...authUser, ...updateData });
      }
    } catch (error) {
      console.error('Update error:', error);
    }
  };

  const handlePasswordUpdate = async () => {
    if (passwordData.password !== passwordData.password_confirmation) {
      toast.error('Passwords do not match');
      return;
    }

    if (passwordData.password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    try {
      await updateProfileMutation.mutateAsync({
        ...passwordData,
        update_password: true,
      });
      setPasswordData({
        current_password: '',
        password: '',
        password_confirmation: '',
      });
      setShowPasswordChange(false);
      toast.success('Password updated successfully!');
    } catch (error) {
      console.error('Password update error:', error);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
      });
    }
  };

  if (profileLoading) {
    return (
      <div className='flex justify-center items-center py-12'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto'></div>
          <p className='mt-4 text-gray-600'>Loading profile...</p>
        </div>
      </div>
    );
  }

  if (profileError || !user) {
    return (
      <div className='text-center py-12'>
        <div className='w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4'>
          <User className='w-8 h-8 text-blue-600' />
        </div>
        <h1 className='text-2xl font-bold text-gray-900 mb-2'>
          Profile Not Found
        </h1>
        <p className='text-gray-600'>
          Unable to load your profile information
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
              className='flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'>
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
                className='flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'>
                <Save className='w-4 h-4' />
                {updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          )}
        </div>

        {/* Profile Avatar */}
        <Card className='mb-6' bgColor='bg-white' borderColor='border-gray-200'>
          <div className='flex flex-col items-center py-6'>
            <div className='relative mb-4'>
              <div className='w-32 h-32 rounded-full bg-blue-100 flex items-center justify-center border-4 border-blue-200'>
                <User className='w-16 h-16 text-blue-400' />
              </div>
            </div>
            <h2 className='text-xl font-semibold text-gray-900'>{user.name}</h2>
            <p className='text-gray-500'>{user.email}</p>
            <span className='mt-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium'>
              {user.role}
            </span>
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
              <User className='w-5 h-5 text-blue-600 mt-1' />
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
                  <p className='text-gray-900 font-medium'>{user.name || 'N/A'}</p>
                )}
              </div>
            </div>

            <div className='flex items-start gap-3'>
              <Mail className='w-5 h-5 text-blue-600 mt-1' />
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
                  <p className='text-gray-900 font-medium'>{user.email || 'N/A'}</p>
                )}
              </div>
            </div>

            <div className='flex items-start gap-3 md:col-span-2'>
              <Phone className='w-5 h-5 text-blue-600 mt-1' />
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
                  <p className='text-gray-900 font-medium'>{user.phone || 'N/A'}</p>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* Password Change */}
        <Card
          title='Security'
          className='mb-6'
          bgColor='bg-white'
          borderColor='border-gray-200'>
          <div className='space-y-4'>
            {!showPasswordChange ? (
              <button
                onClick={() => setShowPasswordChange(true)}
                className='flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors'>
                <Lock className='w-4 h-4' />
                Change Password
              </button>
            ) : (
              <div className='space-y-4'>
                <div>
                  <label className='block text-sm font-medium text-gray-500 mb-1'>
                    Current Password
                  </label>
                  <FormInput
                    name='current_password'
                    type='password'
                    value={passwordData.current_password}
                    onChange={handlePasswordChange}
                    placeholder='Enter current password'
                  />
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-500 mb-1'>
                    New Password
                  </label>
                  <FormInput
                    name='password'
                    type='password'
                    value={passwordData.password}
                    onChange={handlePasswordChange}
                    placeholder='Enter new password'
                  />
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-500 mb-1'>
                    Confirm New Password
                  </label>
                  <FormInput
                    name='password_confirmation'
                    type='password'
                    value={passwordData.password_confirmation}
                    onChange={handlePasswordChange}
                    placeholder='Confirm new password'
                  />
                </div>
                <div className='flex gap-2'>
                  <button
                    onClick={() => {
                      setShowPasswordChange(false);
                      setPasswordData({
                        current_password: '',
                        password: '',
                        password_confirmation: '',
                      });
                    }}
                    className='px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors'>
                    Cancel
                  </button>
                  <button
                    onClick={handlePasswordUpdate}
                    disabled={updateProfileMutation.isPending}
                    className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50'>
                    {updateProfileMutation.isPending ? 'Updating...' : 'Update Password'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
