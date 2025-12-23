import API_CONFIG from '../config/apiService';

class BookingService {
  constructor() {
    this.baseURL = API_CONFIG.baseURL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
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
}

export default new BookingService();
