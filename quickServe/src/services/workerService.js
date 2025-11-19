import API_CONFIG from "../config/apiService.js";

class WorkerService {
  constructor() {
    this.baseURL = API_CONFIG.baseURL;
    console.log("Base URL:", this.baseURL);
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    console.log("Making request to:", url); // Debug log

    const config = {
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        ...options.headers,
      },
      ...options,
    };

    try {
      // FIX: Proper fetch implementation
      const response = await fetch(url, config);
      
      // Check if response is OK
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("API Response:", data); // Debug log

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
}

export default new WorkerService();