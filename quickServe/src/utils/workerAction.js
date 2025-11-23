import workerService from "../services/workerService";
import { workerValidationSchema } from "../validation/workerValidation";

export const submitWorkerData = async (prevState, formData) => {
  try {
    const serviceTypeArray = formData.getAll("service_type[]");

    const values = Object.fromEntries(formData);

    const imageUrl = values.imageUrl || "";
    const serviceRatings = {};
    serviceTypeArray.forEach((serviceName) => {
      const ratingKey = `service_rating_${serviceName}`;
      const rating = formData.get(ratingKey);
      if (rating) {
        serviceRatings[serviceName] = parseInt(rating);
      }
    });

    await workerValidationSchema.validate(
      { ...values, service_type: serviceTypeArray },
      { abortEarly: false }
    );

    const workerData = {
      name: values.name,
      email: values.email,
      phone: values.phone,
      age: values.age ? parseInt(values.age) : null,

      shift: values.shift,
      rating: values.rating ? parseInt(values.rating) : null,
      expertise_of_service: serviceRatings,
      service_type: serviceTypeArray,
      image: imageUrl || null,
    };

    const response = await workerService.createWorker(workerData);

    return {
      success: true,
      message: "Worker registered successfully!",
      data: response.data || response,
      errors: {},
    };
  } catch (error) {
    if (error.name === "ValidationError") {
      const errors = {};
      error.inner.forEach((err) => {
        errors[err.path] = err.message;
      });

      return {
        success: false,
        message: "Please submit form with all fields",
        errors: errors,
        data: null,
      };
    }

    if (error.message) {
      return {
        success: false,
        message: error.message,
        errors: {},
        data: null,
      };
    }
  }
};

export async function createServiceAction(prevState, formData) {
  try {
    const name = formData.get("name")?.trim();

    if (!name) {
      return {
        success: false,
        message: "Service name is required",
        errors: { name: "Service name is required" },
        data: null,
      };
    }

    const response = await workerService.createService({ name });

    return {
      success: true,
      message: "Service created successfully!",
      errors: {},
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      message: error.message || "Failed to create service",
      errors: {},
      data: null,
    };
  }
}

export async function updateServiceAction(prevState, formData) {
  try {
    const id = formData.get("id");
    const name = formData.get("name")?.trim();

    if (!name) {
      return {
        success: false,
        message: "Service name is required",
        errors: { name: "Service name is required" },
        data: null,
      };
    }

    if (!id) {
      return {
        success: false,
        message: "Service ID is required",
        errors: { id: "Service ID is required" },
        data: null,
      };
    }

    const response = await workerService.updateService(id, { name });

    return {
      success: true,
      message: "Service updated successfully!",
      errors: {},
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      message: error.message || "Failed to update service",
      errors: {},
      data: null,
    };
  }
}
