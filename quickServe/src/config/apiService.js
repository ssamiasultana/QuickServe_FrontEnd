const API_CONFIG = {
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api",

  endpoints: {
    workers: {
      create: "/workers",
      getAll: "/getWorkers",
      //getById: (id) => `/workers/${id}`,
      update: (id) => `/workers/${id}`,
      delete: (id) => `deleteWorkers/${id}`,
    },
    services: {
      getServices: "/getServices",
      createService: "/services",
      updateService: "/services",
      deleteService: "/services",
    },
  },
  timeout: 10000,
};

export default API_CONFIG;
