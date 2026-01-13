import Cookies from 'js-cookie';
import API_CONFIG from '../config/apiService';

class BookingService {
  constructor() {
    this.baseURL = API_CONFIG.baseURL;
  }

  getToken() {
    return Cookies.get('auth_token');
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const token = this.getToken();
    const config = {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...options.headers,
      },
      ...options,
      body: options.body,
    };

    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Request failed');
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  async createBooking(bookingData) {
    return this.request(API_CONFIG.endpoints.booking.createBooking, {
      method: 'POST',
      body: JSON.stringify(bookingData),
    });
  }

  async createBatchBooking(batchData) {
    return this.request(API_CONFIG.endpoints.booking.batchBooking, {
      method: 'POST',
      body: JSON.stringify(batchData),
    });
  }
  // Get all bookings for a customer
  async getCustomerBookings(customerId) {
    return this.request(
      API_CONFIG.endpoints.booking.getCustomerBookings(customerId),
      {
        method: 'GET',
      }
    );
  }
  async getAllBookings() {
    return this.request(API_CONFIG.endpoints.booking.getAllBookings, {
      method: 'GET',
    });
  }

  // Get all bookings for the authenticated worker
  // Backend automatically uses the authenticated worker's ID from JWT token
  async getWorkerBookings() {
    return this.request(API_CONFIG.endpoints.booking.getWorkerBookings, {
      method: 'GET',
    });
  }

  // Update booking status (confirm or cancel)
  async updateBookingStatus(bookingId, status) {
    return this.request(
      API_CONFIG.endpoints.booking.updateBookingStatus(bookingId),
      {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }
    );
  }
}

export default new BookingService();
