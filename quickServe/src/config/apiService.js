const API_CONFIG = {
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api',

  endpoints: {
    workers: {
      create: '/workers',
      getAll: '/getWorkers',
      updateWorker: (id) => `/workers/${id}`,
      deleteWorker: (id) => `/workers/${id}`,
      getSingleWorker: (id) => `/workers/${id}`,
      checkWorkerProfile: '/worker/check-profile',
      getPaginatedWorkers: '/workers/paginated',
      searchWorkers: '/workers/search',
      getWorkersByService: (serviceId) => `/workers/${serviceId}`,
    },
    services: {
      getServices: '/getServices',
      createService: '/services',
      updateService: '/services',
      deleteService: '/services',
      getSubServices: (serviceId) => `/service-subcategories/${serviceId}`,
    },
    auth: {
      signUp: '/signup',
      login: '/login',
      getAll: '/users',
    },
    customers: {
      getAll: '/customers',
    },
  },
  timeout: 10000,
};

export default API_CONFIG;
