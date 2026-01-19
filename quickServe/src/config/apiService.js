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
      getProfile: '/worker/profile',
      updateProfile: '/worker/profile',
      getPaginatedWorkers: '/workers/paginated',
      searchWorkers: '/workers/search',
      getWorkersByService: (serviceId) => `/workers/${serviceId}`,
      verifyNid: (id) => `/workers/${id}/verify-nid`,
      checkNid: '/workers/check-nid',
    },
    services: {
      getServices: '/getServices',
      createService: '/services',
      updateService: '/services',
      deleteService: '/services',
      getServicecategoryById: (serviceId) =>
        `/service-subcategories/${serviceId}`,
      getSubServices: '/service-subcategories',
      postSubServices: '/service-subcategories',
      getServicesWithSubcategories:
        '/service-subcategories/services-with-subcategories',
    },
    auth: {
      signUp: '/signup',
      login: '/login',
      getAll: '/users',
      getProfile: '/user/profile',
      updateProfile: '/user/profile',
    },
    customers: {
      getAll: '/customers',
    },
    booking: {
      createBooking: '/booking',
      // Get all bookings for a specific customer
      getCustomerBookings: (customerID) => `/booking/customer/${customerID}`,
      batchBooking: '/booking/batch',
      getAllBookings: '/bookings',
      // Get all bookings for the authenticated worker
      getWorkerBookings: '/booking/worker/jobs',
      // Update booking status (confirm/cancel)
      updateBookingStatus: (bookingId) => `/booking/${bookingId}/status`,
    },
  },
  timeout: 10000,
};

export default API_CONFIG;
