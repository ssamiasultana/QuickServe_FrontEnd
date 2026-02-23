import Cookies from 'js-cookie';
import API_CONFIG from '../config/apiService';

class ReviewService {
  constructor() {
    this.baseURL = API_CONFIG.baseURL;
  }

  getToken() {
    return Cookies.get('auth_token');
  }

  async request(endpoint, options = {}) {
    const { params = {}, ...restOptions } = options;

    const queryString = Object.keys(params).length
      ? '?' + new URLSearchParams(params).toString()
      : '';

    const url = `${this.baseURL}${endpoint}${queryString}`;
    const token = this.getToken();
    const config = {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...restOptions.headers,
      },
      ...restOptions,
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
      throw error;
    }
  }

  async createReview(reviewData) {
    return this.request(API_CONFIG.endpoints.reviews.createReview, {
      method: 'POST',
      body: JSON.stringify(reviewData),
    });
  }

  async getWorkerReviews(workerId) {
    return this.request(API_CONFIG.endpoints.reviews.getWorkerReviews(workerId), {
      method: 'GET',
    });
  }

  async getBookingReview(bookingId) {
    return this.request(API_CONFIG.endpoints.reviews.getBookingReview(bookingId), {
      method: 'GET',
    });
  }
}

const reviewService = new ReviewService();
export default reviewService;
