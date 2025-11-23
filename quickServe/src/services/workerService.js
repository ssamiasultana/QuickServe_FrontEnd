import API_CONFIG from "../config/apiService";

class WorkerService {
  constructor() {
    this.baseURL = API_CONFIG.baseURL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;

    const config = {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await (await fetch(url, config)).json();

      if (response.errors && Object.keys(response.errors).length > 0) {
        throw new Error(` ${response.message}`);
      }

      return response;
    } catch (error) {
      console.error("API request failed:", error);
      throw error;
    }
  }

  async createWorker(workerData) {
    const url = `${this.baseURL}${API_CONFIG.endpoints.workers.create}`;

    const config = {
      method: "POST",
      body: JSON.stringify(workerData),
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (data.errors && Object.keys(data.errors).length > 0) {
        throw new Error(` ${data.message}`);
      }

      return data;
    } catch (error) {
      console.error("API request failed:", error);
      throw error;
    }
  }

  async getAllWorkers() {
    return this.request(API_CONFIG.endpoints.workers.getAll, {
      method: "GET",
    });
  }

  async getServices() {
    return this.request(API_CONFIG.endpoints.services.getServices, {
      method: "GET",
    });
  }
  async createService(serviceData) {
    return this.request(API_CONFIG.endpoints.services.createService, {
      method: "POST",
      body: JSON.stringify(serviceData),
    });
  }
  async updateService(id, serviceData) {
    return this.request(
      `${API_CONFIG.endpoints.services.updateService}/${id}`,
      {
        method: "PUT",
        body: JSON.stringify(serviceData),
      }
    );
  }

  async deleteService(id) {
    return this.request(
      `${API_CONFIG.endpoints.services.deleteService}/${id}`,
      {
        method: "DELETE",
      }
    );
  }
}

export default new WorkerService();
