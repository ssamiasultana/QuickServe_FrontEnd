import { AlertTriangle, Pencil, X } from 'lucide-react';
import { useActionState, useEffect, useRef, useState } from 'react';
import { useDeleteService } from '../../hooks/useWorker';
import { updateServiceAction } from '../../utils/workerAction';
import Modal from '../ui/Modal';

function ServiceList({
  servicesData,
  onRefresh,
  selectedService,
  onServiceSelect,
}) {
  const services = Array.isArray(servicesData)
    ? { data: servicesData }
    : servicesData || { data: [] };
  const [selectedServiceForAction, setSelectedServiceForAction] =
    useState(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const deleteServiceMutation = useDeleteService();
  const [updateState, updateAction, isUpdating] = useActionState(
    updateServiceAction,
    null
  );
  const lastUpdateSuccessRef = useRef(false);

  const handleDelete = (e, service) => {
    e.stopPropagation(); // Prevent triggering filter
    setSelectedServiceForAction(service);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!selectedServiceForAction) return;

    setShowDeleteModal(false);

    try {
      await deleteServiceMutation.mutateAsync(selectedServiceForAction.id);
      setSelectedServiceForAction(null);
      onRefresh();
    } catch (error) {
      // Error is handled by the hook
    }
  };

  const handleEdit = (e, service) => {
    e.stopPropagation(); // Prevent triggering filter
    setSelectedServiceForAction(service);
    setShowEditModal(true);
    lastUpdateSuccessRef.current = false;
  };

  useEffect(() => {
    if (updateState?.success && !lastUpdateSuccessRef.current) {
      lastUpdateSuccessRef.current = true;
      setShowEditModal(false);
      setSelectedServiceForAction(null);
      onRefresh();
    } else if (!updateState?.success) {
      lastUpdateSuccessRef.current = false;
    }
  }, [updateState?.success, onRefresh]);

  return (
    <>
      <div className='flex flex-row gap-3 flex-wrap'>
        {services.data?.map((service) => (
          <div
            key={service.id}
            onClick={() => onServiceSelect(service.id)}
            className={`group relative border rounded-lg px-4 py-3 cursor-pointer
                     hover:border-blue-400 hover:shadow-md transition-all duration-200 ${
                       selectedService === service.id
                         ? 'bg-blue-600 border-blue-600 text-white'
                         : 'bg-white border-gray-200'
                     }`}>
            <div className='flex items-center justify-between gap-3'>
              <span
                className={`font-medium ${
                  selectedService === service.id
                    ? 'text-white'
                    : 'text-gray-800'
                }`}>
                {service.name}
              </span>

              <div className='flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all'>
                <button
                  onClick={(e) => handleEdit(e, service)}
                  disabled={deleteServiceMutation.isPending || isUpdating}
                  className={`transition-all p-1 disabled:opacity-50 ${
                    selectedService === service.id
                      ? 'text-white hover:text-blue-100'
                      : 'text-gray-400 hover:text-blue-500'
                  }`}>
                  <Pencil className='w-4 h-4' />
                </button>
                <button
                  onClick={(e) => handleDelete(e, service)}
                  disabled={deleteServiceMutation.isPending || isUpdating}
                  className={`transition-all p-1 disabled:opacity-50 ${
                    selectedService === service.id
                      ? 'text-white hover:text-red-200'
                      : 'text-gray-400 hover:text-red-500'
                  }`}>
                  <X className='w-4 h-4' />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title='Delete Service'
        icon={AlertTriangle}
        iconBgColor='bg-red-100'
        iconColor='text-red-600'
        size='md'
        footer={
          <>
            <button
              onClick={() => setShowDeleteModal(false)}
              className='px-4 py-2 border border-gray-300 rounded-lg'
              disabled={deleteServiceMutation.isPending}>
              Cancel
            </button>
            <button
              onClick={confirmDelete}
              className='px-4 py-2 bg-red-600 text-white rounded-lg'
              disabled={deleteServiceMutation.isPending}>
              {deleteServiceMutation.isPending ? 'Deleting...' : 'Delete'}
            </button>
          </>
        }>
        <p className='text-gray-600'>
          Delete{' '}
          <strong className='text-gray-900'>
            {selectedServiceForAction?.name}
          </strong>
          ?
        </p>
      </Modal>

      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title='Edit Service'
        icon={Pencil}
        iconBgColor='bg-blue-100'
        iconColor='text-blue-600'
        size='md'
        footer={
          <>
            <button
              onClick={() => setShowEditModal(false)}
              className='px-4 py-2 border border-gray-300 rounded-lg'
              disabled={isUpdating}>
              Cancel
            </button>

            <button
              type='submit'
              form='edit-service-form'
              className='px-4 py-2 bg-blue-600 text-white rounded-lg'
              disabled={isUpdating}>
              {isUpdating ? 'Updating...' : 'Update'}
            </button>
          </>
        }>
        <form id='edit-service-form' action={updateAction}>
          <input type='hidden' name='id' value={selectedServiceForAction?.id} />
          <label className='block text-sm font-medium mb-2'>Service Name</label>
          <input
            type='text'
            name='name'
            defaultValue={selectedServiceForAction?.name}
            disabled={isUpdating}
            required
            className='w-full px-4 py-2 border rounded-lg'
          />

          {updateState?.errors?.name && (
            <p className='text-red-600 text-sm mt-2'>
              {updateState.errors.name}
            </p>
          )}
        </form>
      </Modal>
    </>
  );
}

export default ServiceList;
