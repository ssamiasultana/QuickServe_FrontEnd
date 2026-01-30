import { AlertTriangle, Pencil, Shield } from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { useGetAllModerators, useUpdateModerator, useDeleteModerator } from '../../../hooks/useModerator';
import Modal from '../../ui/Modal';
import Table from '../../ui/table';

const ModeratorList = () => {
  const { data: moderatorsData, isLoading, isError, error } = useGetAllModerators();
  const [searchTerm, setSearchTerm] = useState('');
  const [editModal, setEditModal] = useState({ open: false, moderator: null });
  const [deleteModal, setDeleteModal] = useState({ open: false, moderator: null });
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', is_active: true });
  const [errors, setErrors] = useState({});

  const updateModeratorMutation = useUpdateModerator();
  const deleteModeratorMutation = useDeleteModerator();

  // Filter moderators by search term
  const moderators = useMemo(() => {
    if (!moderatorsData) return [];
    const allModerators = Array.isArray(moderatorsData) ? moderatorsData : moderatorsData?.data || [];
    return allModerators.filter(
      (moderator) =>
        searchTerm === '' ||
        moderator.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        moderator.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [moderatorsData, searchTerm]);

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

  const handleEdit = (moderator) => {
    setEditModal({ open: true, moderator });
    setFormData({
      name: moderator.name || '',
      email: moderator.email || '',
      phone: moderator.phone || '',
      is_active: moderator.is_active !== false,
    });
    setErrors({});
  };

  const handleDelete = (moderator) => {
    setDeleteModal({ open: true, moderator });
  };

  const handleUpdate = async () => {
    if (!editModal.moderator) return;

    setErrors({});
    try {
      await updateModeratorMutation.mutateAsync({
        id: editModal.moderator.id,
        data: formData,
      });
      setEditModal({ open: false, moderator: null });
      setFormData({ name: '', email: '', phone: '', is_active: true });
    } catch (error) {
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      }
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal.moderator) return;

    try {
      await deleteModeratorMutation.mutateAsync(deleteModal.moderator.id);
      setDeleteModal({ open: false, moderator: null });
    } catch (error) {
      // Error handled by hook
    }
  };

  return (
    <div className='p-6'>
      <div className='mb-6'>
        <h1 className='text-2xl font-bold text-gray-900'>Moderators</h1>
        <p className='text-gray-600'>Manage system moderators</p>
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
          <Table 
            title='Moderators List' 
            data={moderators} 
            columns={moderatorColumns}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </div>
      )}

      {/* Edit Modal */}
      <Modal
        isOpen={editModal.open}
        onClose={() => setEditModal({ open: false, moderator: null })}
        title='Edit Moderator'
        icon={Pencil}
        iconBgColor='bg-purple-100'
        iconColor='text-purple-600'
        size='md'
        footer={
          <>
            <button
              onClick={() => setEditModal({ open: false, moderator: null })}
              className='px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors'
              disabled={updateModeratorMutation.isPending}>
              Cancel
            </button>
            <button
              onClick={handleUpdate}
              className='px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50'
              disabled={updateModeratorMutation.isPending}>
              {updateModeratorMutation.isPending ? 'Updating...' : 'Update'}
            </button>
          </>
        }>
        <div className='space-y-4'>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Name
            </label>
            <input
              type='text'
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent'
              disabled={updateModeratorMutation.isPending}
            />
            {errors.name && (
              <p className='text-red-600 text-xs mt-1'>{errors.name[0]}</p>
            )}
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Email
            </label>
            <input
              type='email'
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent'
              disabled={updateModeratorMutation.isPending}
            />
            {errors.email && (
              <p className='text-red-600 text-xs mt-1'>{errors.email[0]}</p>
            )}
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Phone
            </label>
            <input
              type='text'
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent'
              disabled={updateModeratorMutation.isPending}
            />
            {errors.phone && (
              <p className='text-red-600 text-xs mt-1'>{errors.phone[0]}</p>
            )}
          </div>
          <div>
            <label className='flex items-center gap-2'>
              <input
                type='checkbox'
                checked={formData.is_active}
                onChange={(e) =>
                  setFormData({ ...formData, is_active: e.target.checked })
                }
                className='w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500'
                disabled={updateModeratorMutation.isPending}
              />
              <span className='text-sm font-medium text-gray-700'>Active</span>
            </label>
          </div>
        </div>
      </Modal>

      {/* Delete Modal */}
      <Modal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, moderator: null })}
        title='Delete Moderator'
        icon={AlertTriangle}
        iconBgColor='bg-red-100'
        iconColor='text-red-600'
        size='md'
        footer={
          <>
            <button
              onClick={() => setDeleteModal({ open: false, moderator: null })}
              className='px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors'
              disabled={deleteModeratorMutation.isPending}>
              Cancel
            </button>
            <button
              onClick={handleDeleteConfirm}
              className='px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50'
              disabled={deleteModeratorMutation.isPending}>
              {deleteModeratorMutation.isPending ? 'Deleting...' : 'Delete'}
            </button>
          </>
        }>
        <p className='text-gray-600'>
          Are you sure you want to delete moderator{' '}
          <strong className='text-gray-900'>
            {deleteModal.moderator?.name}
          </strong>
          ? This action cannot be undone.
        </p>
      </Modal>
    </div>
  );
};

export default ModeratorList;
