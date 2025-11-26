export const parseServiceData = (worker) => {
  let serviceTypes = worker.service_type;
  let serviceRatings = worker.expertise_of_service;

  if (typeof serviceTypes === "string") {
    try {
      serviceTypes = JSON.parse(serviceTypes);
    } catch (error) {
      console.error("Error parsing service_type:", error);
      serviceTypes = [serviceTypes];
    }
  }

  if (typeof serviceRatings === "string") {
    try {
      serviceRatings = JSON.parse(serviceRatings);
    } catch (error) {
      console.error("Error parsing service_ratings:", error);
      serviceRatings = {};
    }
  }

  return { serviceTypes, serviceRatings };
};

export const formatServicesDisplay = (serviceTypes, serviceRatings) => {
  if (!serviceRatings || Object.keys(serviceRatings).length === 0) {
    if (Array.isArray(serviceTypes)) {
      return serviceTypes.join(", ");
    }
    return serviceTypes || "Not specified";
  }

  if (Array.isArray(serviceTypes)) {
    const formattedServices = serviceTypes.map((service) => {
      const rating = serviceRatings[service];
      return rating ? `${service}(${rating})` : service;
    });
    return formattedServices.join(", ");
  }

  return serviceTypes || "Not specified";
};
