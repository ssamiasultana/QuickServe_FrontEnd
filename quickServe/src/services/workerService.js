import Cookies from 'js-cookie';
import API_CONFIG from '../config/apiService';
class WorkerService {
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
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...options.headers,
      },
      ...options,
    };
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    try {
      const response = await (await fetch(url, config)).json();

      if (response.errors && Object.keys(response.errors).length > 0) {
        throw new Error(` ${response.message}`);
      }

      return response;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  async createWorker(workerData, userId) {
    const payload = userId
      ? { ...workerData, user_id: userId } // Admin case
      : workerData;
    return this.request(API_CONFIG.endpoints.workers.create, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async getAllWorkers() {
    return this.request(API_CONFIG.endpoints.workers.getAll, {
      method: 'GET',
    });
  }
  async getPaginatedWorkers(page, limit) {
    return this.request(API_CONFIG.endpoints.workers.getPaginatedWorkers, {
      method: 'GET',
      query: { page, limit },
    });
  }

  async getSingleWorker(id) {
    return this.request(API_CONFIG.endpoints.workers.getSingleWorker(id), {
      method: 'GET',
    });
  }
  async updateWorker(workerId, workerData) {
    return this.request(
      `${API_CONFIG.endpoints.workers.updateWorker(workerId)}`,
      {
        method: 'PUT',
        body: JSON.stringify(workerData),
      }
    );
  }
  async deleteWorker(id) {
    return this.request(`${API_CONFIG.endpoints.workers.deleteWorker(id)}`, {
      method: 'DELETE',
    });
  }

  async checkWorkerProfile() {
    return this.request(API_CONFIG.endpoints.workers.checkWorkerProfile, {
      method: 'GET',
    });
  }

  async getServices() {
    return this.request(API_CONFIG.endpoints.services.getServices, {
      method: 'GET',
    });
  }

  async createService(serviceData) {
    return this.request(API_CONFIG.endpoints.services.createService, {
      method: 'POST',
      body: JSON.stringify(serviceData),
    });
  }
  async updateService(id, serviceData) {
    return this.request(
      `${API_CONFIG.endpoints.services.updateService}/${id}`,
      {
        method: 'PUT',
        body: JSON.stringify(serviceData),
      }
    );
  }

  async deleteService(id) {
    return this.request(
      `${API_CONFIG.endpoints.services.deleteService}/${id}`,
      {
        method: 'DELETE',
      }
    );
  }
}

export default new WorkerService();
