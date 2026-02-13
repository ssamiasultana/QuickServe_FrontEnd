import API_CONFIG from '../config/apiService';
import Cookies from 'js-cookie';

class PaymentService {
  constructor() {
    this.baseURL = API_CONFIG.baseURL;
  }

  getToken() {
    return Cookies.get('auth_token');
  }

  async request(endpoint, options = {}) {
    const token = this.getToken();
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        const error = new Error(data.message || 'Request failed');
        error.response = data;
        error.status = response.status;
        throw error;
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Worker: Submit commission payment (30% to admin)
  async submitCommissionPayment(data) {
    return this.request('/payments/submit-commission', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Worker: Initiate SSL Commerz payment
  async initiateSslCommerzPayment(bookingId) {
    return this.request('/payments/sslcommerz/initiate', {
      method: 'POST',
      body: JSON.stringify({ booking_id: bookingId }),
    });
  }

  // Customer: Initiate SSL Commerz payment for booking
  async initiateCustomerSslCommerzPayment(bookingId) {
    return this.request('/payments/sslcommerz/customer/initiate', {
      method: 'POST',
      body: JSON.stringify({ booking_id: bookingId }),
    });
  }

  // Worker: Get transactions
  async getWorkerTransactions() {
    return this.request('/payments/worker/transactions');
  }

  // Admin: Get pending commission payments
  async getPendingCommissionPayments() {
    return this.request('/payments/pending-commission-payments');
  }

  // Admin: Process commission payment (approve/reject)
  async processCommissionPayment(transactionId, action, notes = null) {
    return this.request(`/payments/commission-payment/${transactionId}/process`, {
      method: 'POST',
      body: JSON.stringify({ action, notes }),
    });
  }

  // Admin: Get pending online payments
  async getPendingOnlinePayments() {
    return this.request('/payments/pending-online-payments');
  }

  // Admin: Send online payment to worker
  async sendOnlinePayment(bookingId, notes = null) {
    return this.request('/payments/send-online-payment', {
      method: 'POST',
      body: JSON.stringify({ booking_id: bookingId, notes }),
    });
  }

  // Admin: Get all transactions
  async getAllTransactions() {
    return this.request('/payments/all-transactions');
  }
}

const paymentService = new PaymentService();
export default paymentService;
