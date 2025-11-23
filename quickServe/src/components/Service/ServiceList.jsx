import { AlertTriangle, Pencil, X } from "lucide-react";
import { use, useActionState, useEffect, useState, useTransition } from "react";
import WorkerService from "../../services/workerService";
import { updateServiceAction } from "../../utils/workerAction";
import Modal from "../ui/Modal";

function ServiceList({ servicePromise, onRefresh }) {
  const initialServices = use(servicePromise);

  const [services, setServices] = useState(initialServices);
  const [selectedService, setSelectedService] = useState(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const [isPending, startTransition] = useTransition();
  const [updateState, updateAction, isUpdating] = useActionState(
    updateServiceAction,
    null
  );
  const handleDelete = (service) => {
    setSelectedService(service);
    setShowDeleteModal(true);
  };
  const confirmDelete = () => {
    if (!selectedService) return;

    const prev = services;

    // Optimistic UI
    setServices({
      ...services,
      data: services.data.filter((s) => s.id !== selectedService.id),
    });

    setShowDeleteModal(false);

    startTransition(async () => {
      try {
        await WorkerService.deleteService(selectedService.id);
      } catch (e) {
        console.error(e);
        setServices(prev);
        alert("Delete failed, restored previous state.");
      } finally {
        setSelectedService(null);
      }
    });
  };

  const handleEdit = (service) => {
    setSelectedService(service);
    setShowEditModal(true);
  };

  useEffect(() => {
    if (updateState?.success) {
      setShowEditModal(false);
      setSelectedService(null);
      onRefresh();
    }
  }, [updateState?.success]);

  return (
    <>
      <div className="flex flex-row gap-3 flex-wrap">
        {services.data?.map((service) => (
          <div
            key={service.id}
            className="group relative bg-white border border-gray-200 rounded-lg px-4 py-3 
                     hover:border-blue-400 hover:shadow-md transition-all duration-200"
          >
            <div className="flex items-center justify-between gap-3">
              <span className="text-gray-800 font-medium">{service.name}</span>

              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                <button
                  onClick={() => handleEdit(service)}
                  disabled={isPending || isUpdating}
                  className="text-gray-400 hover:text-blue-500 transition-all p-1 disabled:opacity-50"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(service)}
                  disabled={isPending || isUpdating}
                  className="text-gray-400 hover:text-red-500 transition-all p-1 disabled:opacity-50"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Service"
        icon={AlertTriangle}
        iconBgColor="bg-red-100"
        iconColor="text-red-600"
        size="md"
        footer={
          <>
            <button
              onClick={() => setShowDeleteModal(false)}
              className="px-4 py-2 border border-gray-300 rounded-lg"
              disabled={isPending}
            >
              Cancel
            </button>
            <button
              onClick={confirmDelete}
              className="px-4 py-2 bg-red-600 text-white rounded-lg"
              disabled={isPending}
            >
              {isPending ? "Deleting..." : "Delete"}
            </button>
          </>
        }
      >
        <p className="text-gray-600">
          Delete{" "}
          <strong className="text-gray-900">{selectedService?.name}</strong>?
        </p>
      </Modal>

      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Service"
        icon={Pencil}
        iconBgColor="bg-blue-100"
        iconColor="text-blue-600"
        size="md"
        footer={
          <>
            <button
              onClick={() => setShowEditModal(false)}
              className="px-4 py-2 border border-gray-300 rounded-lg"
              disabled={isUpdating}
            >
              Cancel
            </button>

            <button
              type="submit"
              form="edit-service-form"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg"
              disabled={isUpdating}
            >
              {isUpdating ? "Updating..." : "Update"}
            </button>
          </>
        }
      >
        <form id="edit-service-form" action={updateAction}>
          <input type="hidden" name="id" value={selectedService?.id} />
          <label className="block text-sm font-medium mb-2">Service Name</label>
          <input
            type="text"
            name="name"
            defaultValue={selectedService?.name}
            disabled={isUpdating}
            required
            className="w-full px-4 py-2 border rounded-lg"
          />

          {updateState?.errors?.name && (
            <p className="text-red-600 text-sm mt-2">
              {updateState.errors.name}
            </p>
          )}
        </form>
      </Modal>
    </>
  );
}

export default ServiceList;
