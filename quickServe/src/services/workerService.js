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
  async getPaginatedWorkers(page, perPage) {
    return this.request(API_CONFIG.endpoints.workers.getPaginatedWorkers, {
      method: 'GET',
      params: { page, per_page: perPage },
    });
  }

  async searchWorkers(searchTerm) {
    const trimmedSearch = searchTerm?.trim();
    if (!trimmedSearch) {
      return { data: [] };
    }
    const params = new URLSearchParams({
      search: trimmedSearch,
    });

    return this.request(
      `${API_CONFIG.endpoints.workers.searchWorkers}?${params.toString()}`,
      {
        method: 'GET',
      }
    );
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
        method: 'PATCH',
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
  async getServicecategoryById(serviceId) {
    return this.request(
      `${API_CONFIG.endpoints.services.getSubServices(serviceId)}`,
      {
        method: 'GET',
      }
    );
  }
  async getWorkersByService(serviceId) {
    return this.request(
      `${API_CONFIG.endpoints.workers.getWorkersByService}/${serviceId}`,
      {
        method: 'GET',
      }
    );
  }
}

export default new WorkerService();
