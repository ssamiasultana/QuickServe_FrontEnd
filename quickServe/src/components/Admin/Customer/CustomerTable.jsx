import { AlertTriangle, Pencil } from 'lucide-react';
import { useState } from 'react';
import { useDeleteCustomer, useUpdateCustomer } from '../../../hooks/useCustomer';
import colors from '../../ui/color';
import Modal from '../../ui/Modal';
import Table from '../../ui/table';

const CustomerTable = ({ customerData }) => {
  const [editModal, setEditModal] = useState({ open: false, customer: null });
  const [deleteModal, setDeleteModal] = useState({ open: false, customer: null });
  const [formData, setFormData] = useState({ name: '', email: '', phone: '' });
  const [errors, setErrors] = useState({});

  const updateCustomerMutation = useUpdateCustomer();
  const deleteCustomerMutation = useDeleteCustomer();

  const CustomerColumn = [
    { header: 'Id', accessor: 'id' },
    {
      header: 'Customer',
      accessor: (item) => (
        <div className='flex items-center gap-3'>
          {item.image ? (
            <img
              src={item.image}
              alt={item.name}
              className='w-9 h-9 rounded-full object-cover'
              style={{ border: `1px solid ${colors.neutral[200]}` }}
            />
          ) : (
            <div
              className='w-9 h-9 rounded-full flex items-center justify-center'
              style={{
                backgroundColor: colors.accent[500],
                border: `1px solid ${colors.neutral[200]}`,
              }}>
              <span
                className='font-medium text-sm'
                style={{ color: colors.white }}>
                {item.name ? item.name.charAt(0).toUpperCase() : 'U'}
              </span>
            </div>
          )}
          <div>
            <div
              className='font-medium text-sm'
              style={{ color: colors.neutral[900] }}>
              {item.name}
            </div>
            <div
              className='text-xs mt-0.5'
              style={{ color: colors.neutral[500] }}>
              {item.email}
            </div>
          </div>
        </div>
      ),
    },
    { header: 'Phone', accessor: 'phone' },
  ];

  const handleEdit = (customer) => {
    setEditModal({ open: true, customer });
    setFormData({
      name: customer.name || '',
      email: customer.email || '',
      phone: customer.phone || '',
    });
    setErrors({});
  };

  const handleDelete = (customer) => {
    setDeleteModal({ open: true, customer });
  };

  const handleUpdate = async () => {
    if (!editModal.customer) return;

    setErrors({});
    try {
      await updateCustomerMutation.mutateAsync({
        id: editModal.customer.id,
        data: formData,
      });
      setEditModal({ open: false, customer: null });
      setFormData({ name: '', email: '', phone: '' });
    } catch (error) {
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      }
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal.customer) return;

    try {
      await deleteCustomerMutation.mutateAsync(deleteModal.customer.id);
      setDeleteModal({ open: false, customer: null });
    } catch (error) {
      // Error handled by hook
    }
  };

  return (
    <div className='space-y-5'>
      <Table
        title='Customers List'
        data={customerData}
        columns={CustomerColumn}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* Edit Modal */}
      <Modal
        isOpen={editModal.open}
        onClose={() => setEditModal({ open: false, customer: null })}
        title='Edit Customer'
        icon={Pencil}
        iconBgColor='bg-blue-100'
        iconColor='text-blue-600'
        size='md'
        footer={
          <>
            <button
              onClick={() => setEditModal({ open: false, customer: null })}
              className='px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors'
              disabled={updateCustomerMutation.isPending}>
              Cancel
            </button>
            <button
              onClick={handleUpdate}
              className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50'
              disabled={updateCustomerMutation.isPending}>
              {updateCustomerMutation.isPending ? 'Updating...' : 'Update'}
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
              className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              disabled={updateCustomerMutation.isPending}
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
              className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              disabled={updateCustomerMutation.isPending}
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
              className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              disabled={updateCustomerMutation.isPending}
            />
            {errors.phone && (
              <p className='text-red-600 text-xs mt-1'>{errors.phone[0]}</p>
            )}
          </div>
        </div>
      </Modal>

      {/* Delete Modal */}
      <Modal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, customer: null })}
        title='Delete Customer'
        icon={AlertTriangle}
        iconBgColor='bg-red-100'
        iconColor='text-red-600'
        size='md'
        footer={
          <>
            <button
              onClick={() => setDeleteModal({ open: false, customer: null })}
              className='px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors'
              disabled={deleteCustomerMutation.isPending}>
              Cancel
            </button>
            <button
              onClick={handleDeleteConfirm}
              className='px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50'
              disabled={deleteCustomerMutation.isPending}>
              {deleteCustomerMutation.isPending ? 'Deleting...' : 'Delete'}
            </button>
          </>
        }>
        <p className='text-gray-600'>
          Are you sure you want to delete customer{' '}
          <strong className='text-gray-900'>
            {deleteModal.customer?.name}
          </strong>
          ? This action cannot be undone.
        </p>
      </Modal>
    </div>
  );
};

export default CustomerTable;
