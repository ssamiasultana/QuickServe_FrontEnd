import { Edit } from "lucide-react";
import { useActionState, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import workerService from "../../../services/workerService";
import { SHIFT_OPTIONS } from "../../../utils/constants";
import { updateWorkerData } from "../../../utils/workerAction";
import { FormCheckboxGroup } from "../../ui/FormCheckbox";
import { FormInput } from "../../ui/FormInput";
import { FormSelect } from "../../ui/FormSelect";
import Modal from "../../ui/Modal";
import Rating from "../../ui/Rating";

function UpdateModal({ editModal, setEditModal, onWorkerUpdate }) {
  const [services, setServices] = useState([]);
  const [selectedServices, setSelectedServices] = useState([]);
  const [serviceRatings, setServiceRatings] = useState({});

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    age: "",
    shift: "morning",
    rating: 0,
    feedback: "",
    imageUrl: "",
    is_active: true,
  });

  const [state, formAction, isPending] = useActionState(updateWorkerData, {
    success: false,
    message: "",
    errors: {},
    data: null,
  });
  const lastSuccessRef = useRef(false);
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await workerService.getServices();
        setServices(res.data);
      } catch (err) {
        console.error("Failed to fetch services:", err);
      }
    };
    fetchServices();
  }, []);

  useEffect(() => {
    if (editModal.open && editModal.worker) {
      const worker = editModal.worker;

      let serviceTypes = [];
      if (typeof worker.service_type === "string") {
        try {
          serviceTypes = JSON.parse(worker.service_type);
        } catch {
          serviceTypes = [worker.service_type];
        }
      } else if (Array.isArray(worker.service_type)) {
        serviceTypes = worker.service_type;
      }

      let serviceRatingsData = {};
      if (typeof worker.expertise_of_service === "string") {
        try {
          serviceRatingsData = JSON.parse(worker.expertise_of_service);
        } catch {
          serviceRatingsData = {};
        }
      } else if (typeof worker.expertise_of_service === "object") {
        serviceRatingsData = worker.expertise_of_service || {};
      }

      setFormData({
        name: worker.name || "",
        email: worker.email || "",
        phone: worker.phone || "",
        age: worker.age || "",
        shift: worker.shift || "morning",
        rating: worker.rating || 0,
        feedback: worker.feedback || "",
        imageUrl: worker.image || "",
        is_active: worker.is_active ?? true,
      });

      setSelectedServices(serviceTypes);
      setServiceRatings(serviceRatingsData);
      lastSuccessRef.current = false;
    }
  }, [editModal.open, editModal.worker]);

  useEffect(() => {
    if (state?.success && !lastSuccessRef.current) {
      lastSuccessRef.current = true;

      toast.success(state.message || "Worker updated successfully!");
      setEditModal({ open: false, worker: null });

      if (onWorkerUpdate) {
        onWorkerUpdate();
      }
    }

    if (state?.message && !state?.success) {
      toast.error(state.message);
    }
  }, [state?.success, state?.message, setEditModal, onWorkerUpdate]);
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleServiceChange = (serviceName, isChecked) => {
    if (isChecked) {
      setSelectedServices([...selectedServices, serviceName]);
      setServiceRatings({
        ...serviceRatings,
        [serviceName]: serviceRatings[serviceName] || 0,
      });
    } else {
      setSelectedServices(selectedServices.filter((s) => s !== serviceName));
      const newRatings = { ...serviceRatings };
      delete newRatings[serviceName];
      setServiceRatings(newRatings);
    }
  };

  const handleRatingChange = (serviceName, rating) => {
    setServiceRatings({ ...serviceRatings, [serviceName]: rating });
  };

  const handleClose = () => {
    setEditModal({ open: false, worker: null });
  };

  const renderHiddenInputs = () => {
    return (
      <>
        <input type="hidden" name="id" value={editModal.worker?.id || ""} />
        <input type="hidden" name="imageUrl" value={formData.imageUrl || ""} />
        <input type="hidden" name="rating" value={formData.rating || 0} />
        {selectedServices.map((service) => (
          <input
            key={`service_${service}`}
            type="hidden"
            name="service_type[]"
            value={service}
          />
        ))}
        {Object.entries(serviceRatings).map(([service, rating]) => (
          <input
            key={`rating_${service}`}
            type="hidden"
            name={`service_rating_${service}`}
            value={rating}
          />
        ))}
      </>
    );
  };

  return (
    <Modal
      isOpen={editModal.open}
      onClose={handleClose}
      title="Edit Worker"
      icon={Edit}
      size="lg"
      className="max-h-[90vh]"
      footer={
        <>
          <button
            onClick={handleClose}
            disabled={isPending}
            type="button"
            className="px-4 py-2 text-sm border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="update-worker-form"
            disabled={isPending}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {isPending ? "Updating..." : "Update"}
          </button>
        </>
      }
    >
      <form
        id="update-worker-form"
        action={formAction}
        className="space-y-6 max-h-[70vh] overflow-y-auto pr-2"
      >
        {renderHiddenInputs()}

        {/* Personal Information Section */}
        <div>
          <h3 className="text-md font-semibold text-slate-800 mb-4 pb-2 border-b border-blue-100">
            Personal Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              label="Full Name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              error={state.errors?.name}
            />
            <FormInput
              label="Email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              error={state.errors?.email}
            />
            <FormInput
              label="Phone"
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              required
              error={state.errors?.phone}
            />
            <FormInput
              label="Age"
              type="number"
              name="age"
              min="18"
              max="65"
              value={formData.age}
              onChange={handleInputChange}
              required
              error={state.errors?.age}
            />
          </div>
        </div>

        {/* Service Information Section */}
        <div>
          <h3 className="text-md font-semibold text-slate-800 mb-4 pb-2 border-b border-green-100">
            Service Information
          </h3>

          {/* Service Type Selection */}
          <div className="mb-4">
            <label className="block text-sm mb-3 text-gray-600 font-semibold">
              Service Type *
            </label>
            <div className="grid grid-cols-2 gap-3">
              {services.map((service) => (
                <label
                  key={service.name}
                  className="flex items-center space-x-2 p-3 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors cursor-pointer bg-white"
                >
                  <input
                    type="checkbox"
                    checked={selectedServices.includes(service.name)}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                    onChange={(e) =>
                      handleServiceChange(service.name, e.target.checked)
                    }
                  />
                  <span className="text-sm font-medium text-gray-700">
                    {service.name}
                  </span>
                </label>
              ))}
            </div>
            {state.errors?.service_type && (
              <p className="text-sm mt-2 text-red-500">
                {state.errors.service_type}
              </p>
            )}
          </div>

          {/* Service Ratings */}
          {selectedServices.length > 0 && (
            <div className="mb-4">
              <label className="block text-sm mb-3 text-gray-600 font-semibold">
                Rate Your Expertise Per Service *
              </label>
              <div className="space-y-3">
                {selectedServices.map((serviceName) => (
                  <div
                    key={serviceName}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <span className="text-sm font-medium text-gray-700">
                      {serviceName}
                    </span>
                    <Rating
                      value={serviceRatings[serviceName] || 0}
                      onChange={(rating) =>
                        handleRatingChange(serviceName, rating)
                      }
                      name={`service_rating_${serviceName}`}
                      max={5}
                    />
                  </div>
                ))}
              </div>
              {state.errors?.service_ratings && (
                <p className="text-sm mt-2 text-red-500">
                  {state.errors.service_ratings}
                </p>
              )}
            </div>
          )}

          {/* Shift */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <FormSelect
              label="Preferred Shift"
              name="shift"
              options={SHIFT_OPTIONS}
              value={formData.shift}
              onChange={handleInputChange}
              required
              error={state.errors?.shift}
            />
          </div>

          {/* Feedback */}
          <FormInput
            label="Additional Feedback"
            name="feedback"
            type="textarea"
            value={formData.feedback}
            onChange={handleInputChange}
            placeholder="Share any additional information, special skills, or preferences..."
            error={state.errors?.feedback}
          />
        </div>

        {/* Additional Fields */}
        <div>
          <h3 className="text-md font-semibold text-slate-800 mb-4 pb-2 border-b border-gray-100">
            Additional Information
          </h3>
          <div className="space-y-4">
            <FormInput
              label="Profile Image URL"
              type="url"
              name="imageUrl"
              value={formData.imageUrl}
              onChange={handleInputChange}
              placeholder="https://example.com/image.jpg"
            />

            <FormCheckboxGroup
              label="Active Worker"
              name="is_active"
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
