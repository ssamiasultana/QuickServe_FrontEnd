import { Shield, UserCheck, UserX } from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { useGetAllCustomers } from '../../../hooks/useCustomer';
import Card from '../../ui/Card';
import Table from '../../ui/table';

const ModeratorList = () => {
  const { data: usersData, isLoading, isError, error } = useGetAllCustomers();
  const [searchTerm, setSearchTerm] = useState('');

  // Filter moderators from all users
  const moderators = useMemo(() => {
    if (!usersData) return [];
    const allUsers = Array.isArray(usersData) ? usersData : usersData?.data || [];
    const filtered = allUsers.filter(
      (user) =>
        user.role === 'Moderator' &&
        (searchTerm === '' ||
          user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email?.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    return filtered;
  }, [usersData, searchTerm]);

  const moderatorColumns = [
    { header: 'ID', accessor: 'id' },
    {
      header: 'Moderator',
      accessor: (item) => (
        <div className='flex items-center gap-3'>
          {item.image ? (
            <img
              src={item.image}
              alt={item.name}
              className='w-10 h-10 rounded-full object-cover border border-gray-200'
            />
          ) : (
            <div className='w-10 h-10 rounded-full flex items-center justify-center bg-purple-100 border border-purple-200'>
              <Shield className='w-5 h-5 text-purple-600' />
            </div>
          )}
          <div>
            <div className='font-medium text-sm text-gray-900'>{item.name || 'N/A'}</div>
            <div className='text-xs text-gray-500'>{item.email || 'N/A'}</div>
          </div>
        </div>
      ),
    },
    { header: 'Phone', accessor: 'phone' },
    {
      header: 'Status',
      accessor: (item) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            item.is_active !== false
              ? 'bg-green-100 text-green-700'
              : 'bg-red-100 text-red-700'
          }`}>
          {item.is_active !== false ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      header: 'Role',
      accessor: (item) => (
        <span className='px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium'>
          {item.role || 'Moderator'}
        </span>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div className='p-6'>
        <div className='mb-6'>
          <h1 className='text-2xl font-bold text-gray-900'>Moderators</h1>
          <p className='text-gray-600'>Manage system moderators</p>
        </div>
        <div className='flex justify-center items-center py-12'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600'></div>
          <span className='ml-3 text-gray-600'>Loading moderators...</span>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className='p-6'>
        <div className='mb-6'>
          <h1 className='text-2xl font-bold text-gray-900'>Moderators</h1>
        </div>
        <div className='flex flex-col items-center justify-center py-12 text-red-600'>
          <p className='font-semibold'>Failed to load moderators.</p>
          <p className='text-sm text-red-500'>
            {error?.message || 'Something went wrong. Please try again.'}
          </p>
        </div>
      </div>
    );
  }

  const activeModerators = moderators.filter((m) => m.is_active !== false).length;
  const inactiveModerators = moderators.length - activeModerators;

  return (
    <div className='p-6'>
      <div className='mb-6'>
        <h1 className='text-2xl font-bold text-gray-900'>Moderators</h1>
        <p className='text-gray-600'>Manage system moderators</p>
      </div>

      {/* Stats Cards */}
      <div className='grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6'>
        <Card
          title='Total Moderators'
          value={moderators.length}
          icon={Shield}
          iconColor='text-purple-600'
          iconBgColor='bg-purple-100'
        />
        <Card
          title='Active Moderators'
          value={activeModerators}
          icon={UserCheck}
          iconColor='text-green-600'
          iconBgColor='bg-green-100'
        />
        <Card
          title='Inactive Moderators'
          value={inactiveModerators}
          icon={UserX}
          iconColor='text-red-600'
          iconBgColor='bg-red-100'
        />
      </div>

      {/* Search Bar */}
      <div className='mb-6'>
        <div className='relative'>
          <input
            type='text'
            placeholder='Search moderators by name or email...'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className='w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent'
          />
          <Shield className='absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400' />
        </div>
      </div>

      {/* Moderators Table */}
      {moderators.length === 0 ? (
        <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center'>
          <div className='w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4'>
            <Shield className='w-10 h-10 text-gray-400' />
          </div>
          <h3 className='text-xl font-semibold text-gray-900 mb-2'>No Moderators Found</h3>
          <p className='text-gray-600'>
            {searchTerm
              ? 'Try adjusting your search terms'
              : 'There are no moderators in the system yet'}
          </p>
        </div>
      ) : (
        <div className='bg-white rounded-lg shadow-sm border border-gray-200'>
          <Table title='Moderators List' data={moderators} columns={moderatorColumns} />
        </div>
      )}
    </div>
  );
};

export default ModeratorList;
