const API_CONFIG = {
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api",

  endpoints: {
    workers: {
      create: "/workers",
      getAll: "/getWorkers",
      updateWorker: (id) => `/workers/${id}`,
      deleteWorker: (id) => `/workers/${id}`,
      getSingleWorker: (id) => `/workers/${id}`,
      checkWorkerProfile: "/worker/check-profile",
    },
    services: {
      getServices: "/getServices",
      createService: "/services",
      updateService: "/services",
      deleteService: "/services",
    },
    auth: {
      signUp: "/signup",
      login: "/login",
    },
  },
  timeout: 10000,
};

export default API_CONFIG;
