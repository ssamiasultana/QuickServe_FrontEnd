import workerService from '../services/workerService';
import { workerValidationSchema } from '../validation/workerValidation';

export const submitWorkerData = async (prevState, formData) => {
  try {
    // const serviceTypeArray = formData.getAll("service_type[]");

    const serviceIds = formData
      .getAll('service_ids[]')
      .map((id) => parseInt(id));
    const expertiseOfService = formData
      .getAll('expertise_of_service[]')
      .map((rating) => parseInt(rating));

    const values = Object.fromEntries(formData);
    console.log({ values });
    const imageUrl = values.imageUrl || '';
    // const serviceRatings = {};
    // serviceTypeArray.forEach((serviceName) => {
    //   const ratingKey = `service_rating_${serviceName}`;
    //   const rating = formData.get(ratingKey);
    //   if (rating) {
    //     serviceRatings[serviceName] = parseInt(rating);
    //   }
    // });

    await workerValidationSchema.validate(
      { ...values, service_type: serviceIds },
      { abortEarly: false }
    );

    const workerData = {
      user_id: values.user_id,
      name: values.name,
      email: values.email,
      phone: values.phone,
      age: values.age ? parseInt(values.age) : null,

      shift: values.shift,
      feedback: values.feedback,
      service_ids: serviceIds,
      expertise_of_service: expertiseOfService,
      image: imageUrl || null,
    };

    const response = await workerService.createWorker(workerData);

    return {
      success: true,
      message: 'Worker registered successfully!',
      data: response.data || response,
      errors: {},
    };
  } catch (error) {
    if (error.name === 'ValidationError') {
      const errors = {};
      error.inner.forEach((err) => {
        errors[err.path] = err.message;
      });

      return {
        success: false,
        message: 'Please submit form with all fields',
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
export async function updateWorkerData(prevState, formData) {
  try {
    const id = formData.get('id');

    const serviceIds = formData
      .getAll('service_ids[]')
      .map((id) => parseInt(id));
    const expertiseRatings = formData
      .getAll('expertise_of_service[]')
      .map((rating) => parseInt(rating));

    const values = Object.fromEntries(formData);

    if (!id) {
      return {
        success: false,
        message: 'Worker ID is required',
        errors: { id: 'Worker ID is required' },
        data: null,
      };
    }

    // Handle is_active: can be '1', 1, 'on', true, or boolean
    const isActiveValue = values.is_active;
    const isActive =
      isActiveValue === '1' ||
      isActiveValue === 1 ||
      isActiveValue === 'on' ||
      isActiveValue === true ||
      isActiveValue === 'true';

    console.log('Submitting data:', {
      id,
      service_ids: serviceIds,
      expertise_of_service: expertiseRatings,
      is_active: isActive,
      raw_is_active: values.is_active,
    });

    await workerValidationSchema.validate(
      {
        ...values,
        service_ids: serviceIds,
        expertise_of_service: expertiseRatings,
      },
      { abortEarly: false }
    );

    const workerData = {
      name: values.name,
      email: values.email,
      phone: values.phone,
      age: values.age ? parseInt(values.age) : null,
      shift: values.shift,
      feedback: values.feedback,
      image: values.imageUrl || null,
      is_active: isActive,
      // Send as arrays matching backend expectations
      service_ids: serviceIds,
      expertise_of_service: expertiseRatings,
    };

    // Remove any null/undefined values
    Object.keys(workerData).forEach((key) => {
      if (workerData[key] === undefined || workerData[key] === null) {
        delete workerData[key];
      }
    });

    const response = await workerService.updateWorker(id, workerData);

    return {
      success: true,
      message: 'Worker updated successfully!',
      data: response.data || response,
      errors: {},
    };
  } catch (error) {
    if (error.name === 'ValidationError') {
      const errors = {};
      error.inner.forEach((err) => {
        errors[err.path] = err.message;
      });

      return {
        success: false,
        message: 'Please submit form with all fields',
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

    return {
      success: false,
      message: 'An unexpected error occurred',
      errors: {},
      data: null,
    };
  }
}
export async function createServiceAction(prevState, formData) {
  try {
    const name = formData.get('name')?.trim();

    if (!name) {
      return {
        success: false,
        message: 'Service name is required',
        errors: { name: 'Service name is required' },
        data: null,
      };
    }

    const response = await workerService.createService({ name });

    return {
      success: true,
      message: 'Service created successfully!',
      errors: {},
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      message: error.message || 'Failed to create service',
      errors: {},
      data: null,
    };
  }
}

export async function updateServiceAction(prevState, formData) {
  try {
    const id = formData.get('id');
    const name = formData.get('name')?.trim();

    if (!name) {
      return {
        success: false,
        message: 'Service name is required',
        errors: { name: 'Service name is required' },
        data: null,
      };
    }

    if (!id) {
      return {
        success: false,
        message: 'Service ID is required',
        errors: { id: 'Service ID is required' },
        data: null,
      };
    }

    const response = await workerService.updateService(id, { name });

    return {
      success: true,
      message: 'Service updated successfully!',
      errors: {},
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      message: error.message || 'Failed to update service',
      errors: {},
      data: null,
    };
  }
}
